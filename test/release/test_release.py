import importlib.util
import io
import json
import os
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch, call
from types import SimpleNamespace
import urllib.error
import zipfile

spec = importlib.util.spec_from_file_location('release', Path(__file__).resolve().parents[2] / 'scripts/release.py')
r = importlib.util.module_from_spec(spec)
spec.loader.exec_module(r)


def vsix(content=b'hello', version=None, extra=None):
    data = io.BytesIO()
    with zipfile.ZipFile(data, 'w') as z:
        z.writestr('extension/package.json', json.dumps({'publisher': r.PUBLISHER, 'name': r.NAME, 'version': version or r.VERSION}))
        z.writestr('extension/index.js', content)
        if extra:
            z.writestr('extension/index.js', extra)
    return data.getvalue()


class ReleaseTests(unittest.TestCase):
    def test_tag_and_credentials_are_checked_before_publication(self):
        self.assertEqual(r.validate_tag('v' + r.VERSION), 'v' + r.VERSION)
        for tag in ['v1.2.3;echo-pwned', 'v1.2.3\n', 'v01.2.3', 'v9.9.9']:
            with self.assertRaises(ValueError):
                r.validate_tag(tag)
        with patch.dict(os.environ, {'GITHUB_REPOSITORY': 'owner/repo'}, clear=True):
            with self.assertRaisesRegex(ValueError, 'OVSX_PAT'):
                r.preflight('v' + r.VERSION)

        credentials = {'GITHUB_REPOSITORY': 'owner/repo', 'OVSX_PAT': 'fixture', 'GH_TOKEN': 'fixture'}
        with patch.dict(os.environ, credentials, clear=True):
            r.preflight('v' + r.VERSION)
            with self.assertRaisesRegex(ValueError, 'OIDC'):
                r.preflight('v' + r.VERSION, require_oidc=True)
        with patch.dict(os.environ, {**credentials, 'ACTIONS_ID_TOKEN_REQUEST_URL': 'https://example.invalid', 'ACTIONS_ID_TOKEN_REQUEST_TOKEN': 'fixture'}, clear=True):
            r.preflight('v' + r.VERSION, require_oidc=True)

    def test_compare_actual_content_and_validate_manifest(self):
        r.validate_vsix(vsix())
        self.assertTrue(r.same_vsix(vsix(), vsix()))
        self.assertFalse(r.same_vsix(vsix(), vsix(b'different')))
        with self.assertRaisesRegex(ValueError, 'different VSIX'):
            r.ensure_matching(vsix(), vsix(b'different'), 'Marketplace')
        with self.assertRaisesRegex(ValueError, 'version'):
            r.validate_vsix(vsix(version='9.9.9'))
        with self.assertRaisesRegex(ValueError, 'duplicate'):
            r.validate_vsix(vsix(extra=b'duplicate'))

    def test_registry_errors_are_not_treated_as_missing(self):
        with patch.object(r, 'request', side_effect=urllib.error.HTTPError('url', 404, 'missing', {}, None)):
            self.assertIsNone(r.open_vsx_package())
        with patch.object(r, 'request', side_effect=urllib.error.HTTPError('url', 503, 'unavailable', {}, None)):
            with self.assertRaises(urllib.error.HTTPError):
                r.open_vsx_package()

    def test_open_vsx_polls_use_a_fresh_cache_key(self):
        error = urllib.error.HTTPError('url', 404, 'missing', {}, None)
        with patch.object(r.time, 'time_ns', side_effect=[1, 2]), patch.object(r, 'request', side_effect=error) as request:
            self.assertIsNone(r.open_vsx_package())
            self.assertIsNone(r.open_vsx_package())
            self.assertTrue(request.call_args_list[0].args[0].endswith('?release-check=1'))
            self.assertTrue(request.call_args_list[1].args[0].endswith('?release-check=2'))

    def test_wait_stops_on_match_or_bounded_timeout(self):
        expected = vsix()
        with patch.object(r.time, 'sleep') as sleep:
            r.wait_for_match(expected, unittest.mock.Mock(side_effect=[None, None, expected]), 'Marketplace', attempts=3, delay=1)
            self.assertEqual(sleep.call_count, 2)
        with patch.object(r.time, 'sleep') as sleep:
            with self.assertRaisesRegex(RuntimeError, 'not visible'):
                r.wait_for_match(expected, lambda: None, 'Marketplace', attempts=3, delay=1)
            self.assertEqual(sleep.call_count, 2)

    def test_retry_reuses_saved_asset_instead_of_overwriting_it(self):
        saved, rebuilt = vsix(b'original'), vsix(b'rebuilt')
        with tempfile.TemporaryDirectory() as directory, patch.dict(os.environ, {'GITHUB_REPOSITORY': 'owner/repo'}):
            path = Path(directory) / r.ASSET
            path.write_bytes(rebuilt)
            release = {'draft': True, 'assets': [{'name': r.ASSET}]}
            def fake_gh(*args, **kwargs):
                self.assertEqual(args[0:2], ('release', 'download'))
                path.write_bytes(saved)
            with patch.object(r, 'release_info', return_value=release), patch.object(r, 'gh', side_effect=fake_gh):
                r.prepare_asset('v' + r.VERSION, path)
            self.assertEqual(path.read_bytes(), saved)

    def test_publish_checks_both_before_any_mutation(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / r.ASSET
            path.write_bytes(vsix())
            with patch.object(r, 'open_vsx_package', return_value=None), patch.object(r, 'marketplace_package', return_value=vsix(b'different')), patch.object(r, 'run') as run:
                with self.assertRaisesRegex(ValueError, 'different VSIX'):
                    r.publish('v' + r.VERSION, path)
                run.assert_not_called()

    def test_partial_retry_only_publishes_missing_registry(self):
        with tempfile.TemporaryDirectory() as directory, patch.dict(os.environ, {'GITHUB_REPOSITORY': 'owner/repo'}):
            path = Path(directory) / r.ASSET
            expected = vsix()
            path.write_bytes(expected)
            def fake_gh(*args):
                if args[:2] == ('release', 'download'):
                    (Path(args[-1]) / r.ASSET).write_bytes(expected)
            infos = [{'draft': True, 'assets': [{'name': r.ASSET}]}, {'draft': False, 'assets': [{'name': r.ASSET}]}]
            with patch.object(r, 'open_vsx_package', return_value=expected), patch.object(r, 'marketplace_package', side_effect=[None, expected, expected]), patch.object(r, 'run') as run, patch.object(r, 'release_info', side_effect=infos), patch.object(r, 'gh', side_effect=fake_gh) as gh:
                r.publish('v' + r.VERSION, path)
                run.assert_called_once_with(['pnpm', 'exec', 'vsce', 'publish', '--oidc', '--packagePath', str(path)])
                self.assertEqual(gh.call_args_list[-1], call('release', 'edit', 'v' + r.VERSION, '--repo', 'owner/repo', '--draft=false'))

    def test_missing_release_is_created_draft_and_asset_uploaded(self):
        with tempfile.TemporaryDirectory() as directory, patch.dict(os.environ, {'GITHUB_REPOSITORY': 'owner/repo'}):
            path = Path(directory) / r.ASSET
            path.write_bytes(vsix())
            with patch.object(r, 'release_info', side_effect=[None, {'draft': True, 'assets': []}]), patch.object(r, 'gh') as gh:
                r.prepare_asset('v' + r.VERSION, path)
                self.assertEqual(gh.call_args_list, [call('release', 'create', 'v' + r.VERSION, '--repo', 'owner/repo', '--verify-tag', '--generate-notes', '--draft'), call('release', 'upload', 'v' + r.VERSION, str(path), '--repo', 'owner/repo')])

    def test_release_lookup_includes_drafts_and_fails_closed_on_auth_errors(self):
        draft = SimpleNamespace(returncode=0, stdout=json.dumps({'tagName': 'v' + r.VERSION, 'isDraft': True, 'assets': []}), stderr='')
        with patch.dict(os.environ, {'GITHUB_REPOSITORY': 'owner/repo'}), patch.object(r.subprocess, 'run', return_value=draft):
            self.assertEqual(r.release_info('v' + r.VERSION), {'draft': True, 'assets': []})
        denied = SimpleNamespace(returncode=1, stdout='', stderr='HTTP 403')
        with patch.dict(os.environ, {'GITHUB_REPOSITORY': 'owner/repo'}), patch.object(r.subprocess, 'run', return_value=denied):
            with self.assertRaisesRegex(RuntimeError, 'HTTP 403'):
                r.release_info('v' + r.VERSION)

    def test_failed_registry_verification_never_publishes_github_release(self):
        with tempfile.TemporaryDirectory() as directory, patch.dict(os.environ, {'GITHUB_REPOSITORY': 'owner/repo'}):
            path = Path(directory) / r.ASSET
            path.write_bytes(vsix())
            with patch.object(r, 'open_vsx_package', return_value=None), patch.object(r, 'marketplace_package', return_value=None), patch.object(r, 'run'), patch.object(r, 'wait_for_match', side_effect=RuntimeError('not visible')), patch.object(r, 'gh') as gh:
                with self.assertRaisesRegex(RuntimeError, 'not visible'):
                    r.publish('v' + r.VERSION, path)
                gh.assert_not_called()

    def test_each_cli_only_receives_its_own_credential(self):
        env = {'GH_TOKEN': 'gh-token', 'VSCE_PAT': 'vsce-token', 'OVSX_PAT': 'ovsx-token', 'ACTIONS_ID_TOKEN_REQUEST_URL': 'oidc-url', 'ACTIONS_ID_TOKEN_REQUEST_TOKEN': 'oidc-token'}
        for args, expected in [(['gh', 'release'], {'GH_TOKEN'}), (['pnpm', 'exec', 'vsce'], {'ACTIONS_ID_TOKEN_REQUEST_URL', 'ACTIONS_ID_TOKEN_REQUEST_TOKEN'}), (['pnpm', 'exec', 'ovsx'], {'OVSX_PAT'})]:
            with self.subTest(command=args), patch.dict(os.environ, env, clear=True), patch.object(r.subprocess, 'run') as run:
                r.run(args)
                child = run.call_args.kwargs['env']
                self.assertEqual({key for key in env if key in child}, expected)

    def test_recover_requires_existing_asset_and_downloads_it(self):
        with tempfile.TemporaryDirectory() as directory, patch.dict(os.environ, {'GITHUB_REPOSITORY': 'owner/repo'}):
            path = Path(directory) / 'nested' / r.ASSET
            def fake_gh(*args):
                (Path(args[-1]) / r.ASSET).write_bytes(vsix())
            with patch.object(r, 'release_info', return_value={'draft': True, 'assets': [{'name': r.ASSET}]}), patch.object(r, 'gh', side_effect=fake_gh):
                r.recover_asset('v' + r.VERSION, path)
            self.assertTrue(path.exists())
            with patch.object(r, 'release_info', return_value={'draft': True, 'assets': []}), patch.object(r, 'gh') as gh:
                with self.assertRaisesRegex(RuntimeError, 'missing'):
                    r.recover_asset('v' + r.VERSION, path)
                gh.assert_not_called()

    def test_published_release_without_asset_fails_closed(self):
        with tempfile.TemporaryDirectory() as directory, patch.dict(os.environ, {'GITHUB_REPOSITORY': 'owner/repo'}):
            with patch.object(r, 'release_info', return_value={'draft': False, 'assets': []}), patch.object(r, 'gh') as gh:
                with self.assertRaisesRegex(RuntimeError, 'no matching VSIX'):
                    r.prepare_asset('v' + r.VERSION, Path(directory) / r.ASSET)
                gh.assert_not_called()


if __name__ == '__main__':
    unittest.main()
