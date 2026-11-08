# Weekly automated release design

This document describes a proposed workflow. It does not enable scheduled publishing.

## Schedule and change detection

Run every Monday at 09:00 Asia/Shanghai from the latest `main`. Allow a manual dispatch for recovery, subject to the same checks. GitHub's scheduler can be delayed, and public-repository schedules can be disabled after 60 days of inactivity.

Identify the latest **public** stable GitHub release and verify its tag exists, is an ancestor of `main`, and matches its release manifest. An API or authentication failure, an unknown release state, a divergent tag, or an existing unfinished release must stop the run rather than be treated as an empty history. If the tree at that tag equals the tree at `main`, skip. Otherwise release the changes, including documentation and workflow changes; never count a version preparation commit after its corresponding release tag as an additional change.

Use a patch increment by default, without downgrading or reusing a tag or registry version. The version in `package.json`, the changelog, and any other versioned manifests must agree. Preserve explicitly chosen future release versions rather than silently overwriting them; stop on unexpected version drift or a pre-existing tag.

## Version pull request and checks

Before creating a version PR, require the required tests to pass for the exact `main` commit being released. Create or reuse one bot-owned version PR against `main`, using the existing release tooling to generate the version and changelog. Limit the changes in this PR to the intended version and changelog files. Do not execute scripts from untrusted PRs with release credentials.

Run the complete PR checks on the exact version PR head and verify that its base still matches the source commit. Merge only after the checks succeed, with a head-SHA guard. If `main` advances or the PR changes while checks are running, do not merge stale output; refresh and rerun checks. Automated version PRs must have a trusted identity, a predictable branch, a bounded set of changed files, and must not grant arbitrary PRs access to publishing credentials.

A GitHub App with narrowly scoped repository contents, pull-request, and workflow permissions can create the PR and trigger ordinary PR checks. Its installation token should be short-lived and made available only to jobs that need it. Confirm the precise permissions during implementation and configure the App privately; do not commit keys. GitHub Actions' built-in token is not a drop-in substitute: workflow-created PR events can require approval, and token-created pushes normally do not trigger another workflow.

## Tag and publish

Tag the exact merged version commit with one stable `vMAJOR.MINOR.PATCH` tag after verifying its version and ancestry. Invoke the existing `.github/workflows/release.yml` explicitly for that tag, using a supported dispatch mechanism; pushing a tag with `GITHUB_TOKEN` alone does not trigger its push workflow. Confirm any dispatch changes retain the Marketplace trusted-publishing policy for `release.yml`, the existing OIDC preflight, and the rule that neither marketplace is modified until the tested VSIX is persisted.

The existing release workflow builds and tests, persists one VSIX in a draft GitHub release, publishes to Open VSX and VS Code Marketplace, compares the published artifacts, and finally publishes the GitHub release. Keep this as the sole publishing implementation. Do not claim that a dispatch succeeded until the run has been observed and both registry packages and the public release have been verified.

Serialize scheduled and manual runs, including tag creation and dispatch. Do not cancel an in-progress publish. Fail closed if another version PR, tag, or draft release makes the intended state ambiguous. Guard against a tag being created without a dispatch: a retry must dispatch the same tag and reuse the existing draft asset rather than create a new version. On partial publication, use the existing release workflow's retry and mismatch protections; never replace an asset or overwrite a marketplace version. Surface failed or stalled runs to maintainers.

## Verification before enabling

Test the change detector using temporary Git histories, including no changes, changed files, divergent tags, existing drafts, duplicate schedules, stale PR heads, and already-created tags. Exercise the PR orchestration against a disposable repository with mocked or disabled publishing, including branch protection and permission failures. Confirm the OIDC policy and manual recovery for an actual tag before enabling the schedule; local tests or a successful dispatch alone do not establish that either marketplace was updated. Test the existing release scripts and CI, and review all workflow permissions and external actions.

References: [GitHub Actions schedules](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule), [events triggered by GITHUB_TOKEN](https://docs.github.com/en/actions/concepts/security/github_token#when-github_token-triggers-workflow-runs).
