#!/usr/bin/env python3
"""Publish the same persisted VSIX to both registries and verify its contents."""
import argparse
import gzip
import hashlib
import io
import json
import os
from pathlib import Path
import re
import subprocess
import sys
import tempfile
import time
import urllib.error
import urllib.request
import zipfile

ROOT = Path(__file__).resolve().parent.parent
PACKAGE = json.loads((ROOT / 'package.json').read_text())
PUBLISHER, NAME, VERSION = PACKAGE['publisher'], PACKAGE['name'], PACKAGE['version']
ASSET = f'{NAME}-{VERSION}.vsix'
GALLERY = 'https://marketplace.visualstudio.com/_apis/public/gallery'
OPEN_VSX = 'https://open-vsx.org'


def validate_tag(tag):
    if not re.fullmatch(r'v(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)', tag or ''):
        raise ValueError('Expected a stable vMAJOR.MINOR.PATCH tag')
    if tag != f'v{VERSION}':
        raise ValueError(f'Tag {tag} does not match package.json version {VERSION}')
    return tag


def run(args, *, capture=False):
    env = os.environ.copy()
    if args[0] == 'gh':
        env.pop('VSCE_PAT', None)
        env.pop('OVSX_PAT', None)
    elif args[:3] == ['pnpm', 'exec', 'ovsx']:
        env.pop('VSCE_PAT', None)
        env.pop('GH_TOKEN', None)
    elif args[:3] == ['pnpm', 'exec', 'vsce']:
        env.pop('VSCE_PAT', None)
        env.pop('OVSX_PAT', None)
        env.pop('GH_TOKEN', None)
    if args[:3] != ['pnpm', 'exec', 'vsce']:
        env.pop('ACTIONS_ID_TOKEN_REQUEST_URL', None)
        env.pop('ACTIONS_ID_TOKEN_REQUEST_TOKEN', None)
    return subprocess.run(args, check=True, text=True, capture_output=capture, env=env)


def gh(*args, capture=False):
    return run(['gh', *args], capture=capture)


def request(url, data=None):
    headers = {'Accept-Encoding': 'identity', 'User-Agent': 'i18n-ally-next-release'}
    if data is not None:
        headers.update({'Content-Type': 'application/json', 'Accept': 'application/json;api-version=7.1-preview.1'})
        data = json.dumps(data).encode()
    with urllib.request.urlopen(urllib.request.Request(url, data=data, headers=headers), timeout=60) as response:
        content = response.read()
        if response.headers.get('Content-Encoding') == 'gzip' or content.startswith(b'\x1f\x8b'):
            content = gzip.decompress(content)
        return content


def zip_contents(data):
    with zipfile.ZipFile(io.BytesIO(data)) as archive:
        names = [x.filename for x in archive.infolist() if not x.is_dir()]
        if len(names) != len(set(names)):
            raise ValueError('VSIX contains duplicate entries')
        return {name: hashlib.sha256(archive.read(name)).hexdigest() for name in names}


def validate_vsix(data):
    zip_contents(data)
    with zipfile.ZipFile(io.BytesIO(data)) as archive:
        manifest = json.loads(archive.read('extension/package.json'))
    if (manifest.get('publisher'), manifest.get('name'), manifest.get('version')) != (PUBLISHER, NAME, VERSION):
        raise ValueError('VSIX publisher, name or version does not match package.json')


def same_vsix(expected, actual):
    # Compare uncompressed files, not ZIP timestamps, order or transport compression.
    return zip_contents(expected) == zip_contents(actual)


def open_vsx_package():
    try:
        # A cached 404 can outlive the registry's scan/activation. Use a fresh
        # query on each poll so the newly published version can become visible.
        metadata = json.loads(request(f'{OPEN_VSX}/api/{PUBLISHER}/{NAME}/{VERSION}?release-check={time.time_ns()}'))
    except urllib.error.HTTPError as error:
        if error.code == 404:
            return None
        raise
    if metadata.get('version') != VERSION or metadata.get('namespace') != PUBLISHER or metadata.get('name') != NAME:
        raise ValueError('Unexpected Open VSX metadata')
    # Do not follow a registry-provided URL with credentials or an arbitrary origin.
    return request(f'{OPEN_VSX}/api/{PUBLISHER}/{NAME}/{VERSION}/file/{PUBLISHER}.{NAME}-{VERSION}.vsix')


def marketplace_package():
    query = {'filters': [{'criteria': [{'filterType': 7, 'value': f'{PUBLISHER}.{NAME}'}], 'pageNumber': 1, 'pageSize': 1}], 'flags': 1}
    response = json.loads(request(f'{GALLERY}/extensionquery', query))
    extensions = response['results'][0]['extensions']
    if not extensions:
        return None
    ext = extensions[0]
    if ext['publisher']['publisherName'].lower() != PUBLISHER.lower() or ext['extensionName'].lower() != NAME.lower():
        raise ValueError('Unexpected Marketplace metadata')
    if not any(v['version'] == VERSION for v in ext['versions']):
        return None
    return request(f'{GALLERY}/publishers/{PUBLISHER}/vsextensions/{NAME}/{VERSION}/vspackage')


def ensure_matching(expected, actual, platform):
    if actual is not None and not same_vsix(expected, actual):
        raise ValueError(f'{platform} already has {VERSION} with different VSIX contents; stop and investigate')
    return actual is not None


def wait_for_match(expected, lookup, platform, attempts=180, delay=10):
    for attempt in range(attempts):
        actual = lookup()
        if ensure_matching(expected, actual, platform):
            print(f'{platform}: {VERSION} verified')
            return
        if attempt % 6 == 0:
            print(f'{platform}: waiting for {VERSION} to become visible', flush=True)
        if attempt + 1 < attempts:
            time.sleep(delay)
    raise RuntimeError(f'{platform}: {VERSION} not visible after publishing; retry the workflow')


def preflight(tag, *, require_oidc=False):
    validate_tag(tag)
    credentials = {'OVSX_PAT': 'OVSX_TOKEN', 'GH_TOKEN': 'GITHUB_TOKEN'}
    missing = [f'{secret} ({key})' for key, secret in credentials.items() if not os.environ.get(key)]
    if missing:
        raise ValueError('Missing required release credentials: ' + ', '.join(missing))
    if require_oidc and not all(os.environ.get(key) for key in ('ACTIONS_ID_TOKEN_REQUEST_URL', 'ACTIONS_ID_TOKEN_REQUEST_TOKEN')):
        raise ValueError('GitHub Actions OIDC is unavailable; grant id-token: write to the publish job')
    if not re.fullmatch(r'[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+', os.environ.get('GITHUB_REPOSITORY', '')):
        raise ValueError('Invalid GITHUB_REPOSITORY')


def release_info(tag):
    # gh resolves draft pending tag names through GraphQL; REST by-tag only
    # returns published releases, and REST listings may use untagged-* names.
    env = {key: value for key, value in os.environ.items() if key not in ('VSCE_PAT', 'OVSX_PAT', 'ACTIONS_ID_TOKEN_REQUEST_URL', 'ACTIONS_ID_TOKEN_REQUEST_TOKEN')}
    result = subprocess.run(['gh', 'release', 'view', tag, '--repo', os.environ['GITHUB_REPOSITORY'], '--json', 'tagName,isDraft,assets'], text=True, capture_output=True, env=env)
    if result.returncode:
        if result.stderr.strip() == 'release not found':
            # Fail closed on API/auth errors rather than assuming no release.
            gh('api', f'repos/{os.environ["GITHUB_REPOSITORY"]}/releases?per_page=1', capture=True)
            return None
        raise RuntimeError('Unable to inspect GitHub release: ' + result.stderr.strip())
    release = json.loads(result.stdout)
    if release['tagName'] != tag:
        raise RuntimeError('GitHub release tag mismatch')
    return {'draft': release['isDraft'], 'assets': release['assets']}


def prepare_asset(tag, path):
    release = release_info(tag)
    if release is None:
        gh('release', 'create', tag, '--repo', os.environ['GITHUB_REPOSITORY'], '--verify-tag', '--generate-notes', '--draft')
        for _ in range(5):
            release = release_info(tag)
            if release is not None:
                break
            time.sleep(2)
        if release is None:
            raise RuntimeError('Created release could not be retrieved; retry the workflow')
    assets = [a for a in release['assets'] if a['name'] == ASSET]
    if assets:
        if len(assets) != 1:
            raise RuntimeError('Multiple matching release assets')
        path.unlink(missing_ok=True)
        gh('release', 'download', tag, '--repo', os.environ['GITHUB_REPOSITORY'], '--pattern', ASSET, '--dir', str(path.parent))
        validate_vsix(path.read_bytes())
        print('Reusing the existing GitHub release asset')
    else:
        if not release['draft']:
            raise RuntimeError('Existing published release has no matching VSIX; investigate before proceeding')
        validate_vsix(path.read_bytes())
        gh('release', 'upload', tag, str(path), '--repo', os.environ['GITHUB_REPOSITORY'])
        print('Saved VSIX to draft GitHub release')


def recover_asset(tag, path):
    release = release_info(tag)
    if release is None or len([asset for asset in release['assets'] if asset['name'] == ASSET]) != 1:
        raise RuntimeError('Expected persisted GitHub release asset is missing or ambiguous')
    path.parent.mkdir(parents=True, exist_ok=True)
    path.unlink(missing_ok=True)
    gh('release', 'download', tag, '--repo', os.environ['GITHUB_REPOSITORY'], '--pattern', ASSET, '--dir', str(path.parent))
    validate_vsix(path.read_bytes())


def publish(tag, path):
    expected = path.read_bytes()
    validate_vsix(expected)
    # Check both before publishing either, so a pre-existing mismatch stops early.
    open_exists = ensure_matching(expected, open_vsx_package(), 'Open VSX')
    market_exists = ensure_matching(expected, marketplace_package(), 'VS Code Marketplace')
    if not open_exists:
        run(['pnpm', 'exec', 'ovsx', 'publish', '--packagePath', str(path)])
        wait_for_match(expected, open_vsx_package, 'Open VSX')
    if not market_exists:
        run(['pnpm', 'exec', 'vsce', 'publish', '--oidc', '--packagePath', str(path)])
        wait_for_match(expected, marketplace_package, 'VS Code Marketplace')
    # Check both again before turning the draft into a public GitHub release.
    wait_for_match(expected, open_vsx_package, 'Open VSX')
    wait_for_match(expected, marketplace_package, 'VS Code Marketplace')
    release = release_info(tag)
    if release is None:
        raise RuntimeError('GitHub release disappeared')
    if len([asset for asset in release['assets'] if asset['name'] == ASSET]) != 1:
        raise RuntimeError('GitHub release asset is missing or ambiguous')
    with tempfile.TemporaryDirectory(prefix='i18n-release-verify-') as directory:
        gh('release', 'download', tag, '--repo', os.environ['GITHUB_REPOSITORY'], '--pattern', ASSET, '--dir', directory)
        if (Path(directory) / ASSET).read_bytes() != expected:
            raise RuntimeError('GitHub release asset differs from the published VSIX')
    if release['draft']:
        gh('release', 'edit', tag, '--repo', os.environ['GITHUB_REPOSITORY'], '--draft=false')
    release = release_info(tag)
    if release is None or release['draft']:
        raise RuntimeError('GitHub release is not public; retry the workflow')
    print(f'GitHub release {tag} is published')


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('step', choices=['preflight', 'prepare', 'recover', 'publish'])
    parser.add_argument('--asset-dir', default='/tmp/i18n-release')
    args = parser.parse_args()
    tag = os.environ.get('GITHUB_REF_NAME', '')
    preflight(tag, require_oidc=args.step in ('recover', 'publish'))
    path = Path(args.asset_dir).resolve() / ASSET
    if args.step == 'prepare':
        prepare_asset(tag, path)
    elif args.step == 'recover':
        recover_asset(tag, path)
    elif args.step == 'publish':
        publish(tag, path)


if __name__ == '__main__':
    try:
        main()
    except (ValueError, OSError, RuntimeError, subprocess.CalledProcessError, zipfile.BadZipFile, KeyError) as error:
        print(f'Release failed: {error}', file=sys.stderr)
        sys.exit(1)
