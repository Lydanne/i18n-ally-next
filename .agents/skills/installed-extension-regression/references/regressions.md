# Published extension regression guide

## Test the artifact, not a second copy of the source bundle

The existing `test/e2e/index.ts` launches the repository as `extensionDevelopmentPath`, and `test/e2e/ctx.ts` imports `../../dist/extension`. Simply installing a VSIX and then running `pnpm test:e2e` still tests the development build. For a released-build regression:

- Compile the current compatible E2E tests, and adapt a **temporary copy** of the compiled runner and context so the extension development path and context's extension import both resolve to the same installed/extracted extension entry point. Verify the active extension ID/version and that the loaded bundle matches the intended artifact. Do not replace tracked source or leave temporary harness changes behind.
- Give each run a separate user-data directory, extensions directory and copied fixtures; use a short temporary path where local socket length is limited. Preserve any pre-existing ignored test directories. Run VS Code test instances serially if they would share a profile.
- VS Code needs a registered `vue` language for Vue fixture detection. The CI workflow registers one for tests; in an isolated installed-artifact run, use a temporary language-only test extension or equivalent configuration without changing the installed extension's files. Record the shim and editor version. Do not silently update snapshots; map snapshot paths to the intended fixtures or report unsupported snapshot cases.
- The repository's fixture runner also launches the checkout by default. Adapt a temporary compiled copy to launch the installed extension when exercising batch extraction fixtures. Keep fixture output under an isolated temporary path.

A VSIX smoke test can be run with `node scripts/test-packaged-ts-parser.cjs <path-to-verified-vsix>`; it runs the bundled TypeScript parser outside the checkout's dependency tree. Check whether the test executable/version matches the user's requested editor; an isolated extension host is not evidence that every already-open user window has reloaded.

## Select checks from the reported fixes

- `test/e2e/frameworks/vue-i18n-sfc`: JSON/YAML locale blocks, active component changes and dirty/saved writes without disturbing other blocks.
- `test/e2e/fixtures/issue-parser-shell`: TypeScript locale parsing and literal handling of shell-like compiler options.
- `test/e2e/fixtures/issue-search-by-value`: references, cache refresh, selection and navigation.
- `test/e2e/fixtures/issue-3`: loader disable/re-enable and configured editor preference.
- `test/e2e/frameworks/paraglide`: message-call detection and unrelated-object exclusions.
- `test/fixtures` via `test/fixture-scripts`: extraction and interpolation output. For manual extraction, use an isolated selection and source-specific custom template and verify both placeholder substitution and the resulting edit.
- For LibreTranslate, configure a loopback-only mock endpoint and a synthetic key in the temporary workspace. Exercise key-present/key-absent requests, a failing response and a redirect; verify errors do not contain the key and a credential-bearing request is not forwarded. This does not validate a real third-party service or user credential.

Choose additional cases based on the actual release and issue history. Run source unit tests when useful, but label them as source evidence; do not present a clean audit or a mock service as proof of live-service behavior. Check existing open PRs and release workflow outcomes when the question also concerns publication reliability.
