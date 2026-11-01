---
name: dual-marketplace-release
description: Prepare, publish, recover, and verify this VS Code extension release on both VS Code Marketplace and Open VSX. Use when asked to release or publish this extension, investigate a failed release, or verify the two marketplace versions.
---

# Dual marketplace release

Apply the user's requested release scope. Inspect `AGENTS.md`, contribution rules, the current branch and worktree, the latest tag, both registry versions and `.github/workflows/release.yml` before acting. Never print or request tokens in chat. Publishing a release and pushing its tag are external mutations: proceed when the user requests a release; preparing a PR alone does not authorize publishing.

1. Check that the relevant fixes are merged, CI is green, and release notes and version are appropriate. `pnpm release:patch` and `pnpm release:minor` prepare version/changelog changes without committing, tagging or pushing. Deliver and merge the version change through the repository's PR workflow when requested; do not tag an unmerged or unreviewed version.
2. Confirm `OVSX_TOKEN` is configured and the `lydanne` Marketplace Trusted Publishing policy names this repository and `.github/workflows/release.yml` (no environment). VS Code Marketplace uses GitHub OIDC, not `VSCE_TOKEN`. The publish job preflights the trust exchange before either registry is changed. Presence of the Open VSX secret does not prove its validity; report authentication failures without exposing secrets.
3. Run the relevant tests and build/VSIX smoke check on the intended merged commit, using Node 22 or newer. Inspect the exact commit and tag; the workflow accepts only a stable `vMAJOR.MINOR.PATCH` matching `package.json`. Create and push that single tag only after the release is authorized; do not use `git push --follow-tags` or force-push.
4. Monitor the Release workflow. It persists one VSIX in a draft GitHub Release, publishes to both registries and compares the actual package contents before making the release public. Record the run and expected version. A published version with different contents is a hard stop requiring investigation, not a reason to bypass verification.
5. On partial failure, inspect the existing draft, asset and each registry. Correct the actual cause and rerun the same workflow; it reuses the stored VSIX and publishes only missing matching versions. Do not delete or replace published versions or overwrite an asset to force a retry. Independently verify both registries, the public GitHub Release and its asset; report any incomplete or unverified state honestly.
