---
name: installed-extension-regression
description: Install or verify a published build of this VS Code extension and regress reported fixes against the actual installed or packaged extension. Use for requests such as 安装最新插件回归、验证发布版 or testing a VSIX; ordinary source-only tests do not establish installed behavior.
---

# Installed extension regression

Use this workflow when asked to verify the shipped extension. Respect the requested version, platform and installation scope. Installing or updating the user's normal VS Code profile is appropriate when explicitly requested; otherwise prefer a temporary profile and leave existing installations and open windows intact. Do not publish, upload data, use real API credentials, or reload a user's window unless the request authorizes it.

1. Inspect the worktree, current release/tag and relevant issue fixes. Derive the extension ID and version from the intended artifact or current registry rather than assuming the local checkout is the published version. Record the editor version, installation source and pre-existing extension version. If updating the user's profile, use the requested editor's supported CLI/UI and verify the reported installed version afterward.
2. Verify artifact identity before testing: compare the release or registry package and the installed extension's relevant files. When comparing registry ZIPs, compare their uncompressed contents if ZIP metadata or transport compression differs. Distinguish a downloaded VSIX, an installed profile, and a development build; do not claim one validates another without evidence.
3. Run issue-specific regressions in an isolated workspace and VS Code profile, loading the installed extension or extracted VSIX, not the checkout's development bundle. For repository-specific harness details and test mappings, read [references/regressions.md](references/regressions.md). Add short-lived, focused checks for behavior that existing tests do not exercise. Use copied fixtures, synthetic keys and a local mock server for translation or error/redirect security tests.
4. Check relevant packaging and security evidence, including `scripts/test-packaged-ts-parser.cjs` for the actual VSIX and any still-open release or dependency findings. A successful installation or audit alone does not prove every fix. Avoid repeating a real release or an external API transaction merely to test.
5. Report the editor and extension version, installation scope, scenarios and outcomes, and which checks were mocked or source-only. Include failures, unresolved issues and actions still needed; a running user's existing VS Code window may require a normal reload before it activates the update. Preserve user files and settings; remove only temporary artifacts created for this run.
