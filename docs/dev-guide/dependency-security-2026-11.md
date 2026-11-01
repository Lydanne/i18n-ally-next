# Dependency security review (2026-11-01)

The baseline is the complete workspace `pnpm audit --json` before this change. It reported 239 affected findings (226 distinct package/advisory pairs): 5 critical, 110 high, 102 moderate and 22 low. Production-only audit reported 82 findings. The updated full and production audits each report one moderate finding, described below. Counts are pnpm's findings; the table lists every baseline package/advisory pair. Registry data can change over time.

## Exposure and mitigation

- **Extension** means the old webpack extension bundle contained that package. This establishes presence, not exploitability: each advisory has its own input and execution requirements. Network/translation data and workspace files/settings are the relevant trust boundaries. Axios, parsers and matching utilities were upgraded; the legacy SFC chain was removed.
- **Webview** means Vue I18n was used by the extension webview; escaping bugs matter when the vulnerable interpolation mode is used with untrusted values. Vue and Vue I18n were upgraded.
- **Release/install** covers the package publishing pipeline or native addon installation. Old `conventional-github-releaser` and its legacy network/tooling chain were removed; the new release step uses the GitHub CLI and generated notes. Native installation uses the existing Mapbox package upgraded to 2.x and patched tar 7. Archive origin and installer privileges remain security boundaries.
- **Tooling/transitive** covers other audit paths in development, documentation, packaging, or dependencies removed with the old SFC library. Inclusion in the dependency graph alone does not prove the vulnerable function was invoked. Patched versions or removal eliminate the flagged versions.

The only remaining report is [GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249), whose affected range includes minimatch 3.1.5. The described `firstPhasePreProcess`/`globParts` amplification code exists in newer minimatch implementations but is absent from the installed 3.1.5 implementation. This is a source-level assessment of this specific advisory, not a claim that arbitrary glob patterns cannot cause denial of service. The separate 3.x advisories were addressed by upgrading 3.1.2 to 3.1.5; other affected branches were upgraded to 11.0.3. No audit suppression is configured.

Compatibility exceptions: VitePress 1.6.4 declares Vite 5, but is overridden to patched Vite 6.4.5; its build and development server were exercised. Glob 14, minimatch 11 and serialize-javascript 7 cross major versions for tooling; CI runs Node 20. The existing Azure MSAL use of UUID v4 is overridden to UUID 11. Native node-pre-gyp was tested using a local fixture archive; this does not establish the availability or integrity of remote prebuilt binaries.

## Advisory inventory

Each entry links the specific upstream advisory. “Resolved in audit” means no installed version is reported for that package/advisory after the change; it does not claim that the baseline was exploitable.

### @babel/core

Baseline versions: 7.29.0. Exposure: Tooling/transitive.

| Advisory | Severity | Status |
| --- | --- | --- |
| [@babel/core: Arbitrary File Read via sourceMappingURL Comment](https://github.com/advisories/GHSA-4x5r-pxfx-6jf8) | low | Resolved in audit |

### @humanfs/node

Baseline versions: 0.16.7. Exposure: Tooling/transitive.

| Advisory | Severity | Status |
| --- | --- | --- |
| [humanfs: Recursive copy follows symlinked files and copies data from outside the source tree](https://github.com/advisories/GHSA-p498-v437-472g) | moderate | Resolved in audit |

### @intlify/core-base

Baseline versions: 11.2.8. Exposure: Webview.

| Advisory | Severity | Status |
| --- | --- | --- |
| [Vue I18n: escapeParameter does not prevent XSS through srcdoc in translation messages](https://github.com/advisories/GHSA-83rm-6c8r-g728) | high | Resolved in audit |
| [Vue I18n: `escapeParameter` does not escape named values when the same call also passes a list](https://github.com/advisories/GHSA-8rc2-428q-7ww3) | low | Resolved in audit |

### @intlify/shared

Baseline versions: 11.2.8. Exposure: Webview.

| Advisory | Severity | Status |
| --- | --- | --- |
| [Vue I18n: escapeParameter does not prevent XSS through srcdoc in translation messages](https://github.com/advisories/GHSA-83rm-6c8r-g728) | high | Resolved in audit |

### @vue/server-renderer

Baseline versions: 3.5.28. Exposure: Tooling/transitive.

| Advisory | Severity | Status |
| --- | --- | --- |
| [@vue/server-renderer: XSS via missing CR in attribute-name blacklist](https://github.com/advisories/GHSA-g2v6-rqmx-r4w6) | high | Resolved in audit |

### ajv

Baseline versions: 6.12.6, 8.17.1. Exposure: Tooling/transitive.

| Advisory | Severity | Status |
| --- | --- | --- |
| [ajv has ReDoS when using `$data` option](https://github.com/advisories/GHSA-2g4f-4pwh-qvx6) | moderate | Resolved in audit |
| [ajv has ReDoS when using `$data` option](https://github.com/advisories/GHSA-2g4f-4pwh-qvx6) | moderate | Resolved in audit |

### axios

Baseline versions: 1.13.5. Exposure: Extension.

| Advisory | Severity | Status |
| --- | --- | --- |
| [axios Vulnerable to Full Man-in-the-Middle via Prototype Pollution Gadget in `config.proxy`](https://github.com/advisories/GHSA-35jp-ww65-95wh) | high | Resolved in audit |
| [axios Vulnerable to Credential Theft and Response Hijacking via Prototype Pollution Gadget in Config Merge](https://github.com/advisories/GHSA-3g43-6gmg-66jw) | high | Resolved in audit |
| [Axios has a NO_PROXY Hostname Normalization Bypass that Leads to SSRF](https://github.com/advisories/GHSA-3p68-rc4w-qgx5) | moderate | Resolved in audit |
| [Axios: HTTP/2 adapter bypasses configured DNS lookup and proxy controls](https://github.com/advisories/GHSA-3pq3-5fj3-cg6v) | high | Resolved in audit |
| [Axios: Invisible JSON Response Tampering via Prototype Pollution Gadget in `parseReviver`](https://github.com/advisories/GHSA-3w6x-2g7m-8v23) | moderate | Resolved in audit |
| [Axios: Excessive recursion in formDataToJSON can cause denial of service](https://github.com/advisories/GHSA-42h9-826w-cgv3) | moderate | Resolved in audit |
| [Axios: CRLF Injection in multipart/form-data body via unsanitized blob.type in formDataToStream](https://github.com/advisories/GHSA-445q-vr5w-6q77) | moderate | Resolved in audit |
| [Axios: Fetch Adapter Header Injection via Inherited FormData getHeaders](https://github.com/advisories/GHSA-4hqw-qxg8-jxx2) | moderate | Resolved in audit |
| [Axios: Denial of Service via Unhandled 'error' Event in HTTP/2 ClientHttp2Session Initialization](https://github.com/advisories/GHSA-542g-h47m-68v8) | high | Resolved in audit |
| [Axios' HTTP adapter-streamed uploads bypass maxBodyLength when maxRedirects: 0](https://github.com/advisories/GHSA-5c9x-8gcm-mpgx) | moderate | Resolved in audit |
| [Axios: unbounded recursion in toFormData causes DoS via deeply nested request data](https://github.com/advisories/GHSA-62hf-57xw-28j9) | moderate | Resolved in audit |
| [Axios: Header Injection via Prototype Pollution](https://github.com/advisories/GHSA-6chq-wfr3-2hj9) | high | Resolved in audit |
| [Allocation of Resources Without Limits or Throttling in Axios](https://github.com/advisories/GHSA-777c-7fjr-54vf) | high | Resolved in audit |
| [Axios: Nested axios option objects can consume polluted prototype values](https://github.com/advisories/GHSA-7q8q-rj6j-mhjq) | moderate | Resolved in audit |
| [axios has DoS & Header Injection via Prototype Pollution Read-Side Gadgets in axios merge functions](https://github.com/advisories/GHSA-898c-q2cr-xwhg) | moderate | Resolved in audit |
| [Axios: Prototype-Pollution Gadget in the Default Instance Allows Inherited Object.prototype.method to Override HTTP Method](https://github.com/advisories/GHSA-9fr6-4gfg-395g) | moderate | Resolved in audit |
| [Axios has Unrestricted Cloud Metadata Exfiltration via Header Injection Chain](https://github.com/advisories/GHSA-fvcv-3m26-pcqx) | moderate | Resolved in audit |
| [Axios: Regular Expression Denial of Service (ReDoS) via Cookie Name Injection](https://github.com/advisories/GHSA-hfxv-24rg-xrqf) | high | Resolved in audit |
| [Axios: Proxy-Authorization header leaks to redirect target when proxy is re-evaluated to direct connection](https://github.com/advisories/GHSA-j5f8-grm9-p9fc) | high | Resolved in audit |
| [Axios: Header Injection via Inherited headers After Minimal Interceptor](https://github.com/advisories/GHSA-j8rh-479h-cp32) | moderate | Resolved in audit |
| [Axios: Fetch adapter `ReadableStream` uploads bypass `maxBodyLength`](https://github.com/advisories/GHSA-jqh4-m9w3-8hp9) | moderate | Resolved in audit |
| [Axios: no_proxy bypass via IP alias allows SSRF](https://github.com/advisories/GHSA-m7pr-hjqh-92cm) | moderate | Resolved in audit |
| [Axios: Prototype pollution gadgets can alter axios request construction](https://github.com/advisories/GHSA-mmx7-hfxf-jppx) | moderate | Resolved in audit |
| [Axios: HTTP/2 streamed uploads bypass `maxBodyLength`](https://github.com/advisories/GHSA-mwf2-3pr3-8698) | moderate | Resolved in audit |
| [Axios: Proxy-Authorization Credential Leak to Origin Server Across HTTP-to-HTTPS Redirect in Axios Node.js HTTP Adapter](https://github.com/advisories/GHSA-p92q-9vqr-4j8v) | high | Resolved in audit |
| [Axios: Prototype Pollution Gadgets - Response Tampering, Data Exfiltration, and Request Hijacking](https://github.com/advisories/GHSA-pf86-5x62-jrwf) | high | Resolved in audit |
| [Axios: Deep formToJSON Key Recursion Can Cause Denial of Service](https://github.com/advisories/GHSA-pmv8-rq9r-6j72) | moderate | Resolved in audit |
| [Axios: Incomplete Fix for CVE-2025-62718 — NO_PROXY Protection Bypassed via RFC 1122 Loopback Subnet (127.0.0.0/8) in Axios 1.15.0](https://github.com/advisories/GHSA-pmwg-cvhr-8vh7) | high | Resolved in audit |
| [Axios has prototype pollution read-side gadgets in HTTP adapter that allow credential injection and request hijacking](https://github.com/advisories/GHSA-q8qp-cvcw-x6jj) | high | Resolved in audit |
| [Axios: HTTP adapter streamed responses bypass maxContentLength](https://github.com/advisories/GHSA-vf2m-468p-8v99) | moderate | Resolved in audit |
| [Axios: Prototype pollution gadget in fetch adapter can alter outbound requests](https://github.com/advisories/GHSA-vh66-26gq-q6x8) | moderate | Resolved in audit |
| [Axios: Authentication Bypass via Prototype Pollution Gadget in `validateStatus` Merge Strategy](https://github.com/advisories/GHSA-w9j2-pvgh-6h63) | moderate | Resolved in audit |
| [Axios: Null Byte Injection via Reverse-Encoding in AxiosURLSearchParams](https://github.com/advisories/GHSA-xhjh-pmcv-23jw) | low | Resolved in audit |
| [Axios: XSRF Token Cross-Origin Leakage via Prototype Pollution Gadget in `withXSRFToken` Boolean Coercion](https://github.com/advisories/GHSA-xx6v-rp6x-q39c) | moderate | Resolved in audit |

### baseline-browser-mapping

Baseline versions: 2.9.19. Exposure: Tooling/transitive.

| Advisory | Severity | Status |
| --- | --- | --- |
| [baseline-browser-mapping process termination on invalid input causes denial of service](https://github.com/advisories/GHSA-w5vr-8v7q-w6rv) | moderate | Resolved in audit |

### brace-expansion

Baseline versions: 1.1.12, 2.0.2. Exposure: Extension.

| Advisory | Severity | Status |
| --- | --- | --- |
| [brace-expansion: DoS via exponential-time expansion of consecutive non-expanding {} groups](https://github.com/advisories/GHSA-3jxr-9vmj-r5cp) | high | Resolved in audit |
| [brace-expansion: DoS via exponential-time expansion of consecutive non-expanding {} groups](https://github.com/advisories/GHSA-3jxr-9vmj-r5cp) | high | Resolved in audit |
| [brace-expansion: DoS via uncontrolled recursion in parseCommaParts causing stack exhaustion](https://github.com/advisories/GHSA-6j4f-fj2g-mc7p) | high | Resolved in audit |
| [brace-expansion: DoS via uncontrolled recursion in parseCommaParts causing stack exhaustion](https://github.com/advisories/GHSA-6j4f-fj2g-mc7p) | high | Resolved in audit |
| [brace-expansion: Zero-step sequence causes process hang and memory exhaustion](https://github.com/advisories/GHSA-f886-m6hf-6m8v) | moderate | Resolved in audit |
| [brace-expansion: Zero-step sequence causes process hang and memory exhaustion](https://github.com/advisories/GHSA-f886-m6hf-6m8v) | moderate | Resolved in audit |
| [brace-expansion: DoS via unbounded expansion length causing an out-of-memory process crash](https://github.com/advisories/GHSA-mh99-v99m-4gvg) | high | Resolved in audit |
| [brace-expansion: DoS via unbounded expansion length causing an out-of-memory process crash](https://github.com/advisories/GHSA-mh99-v99m-4gvg) | high | Resolved in audit |
| [brace-expansion: Quadratic-time expansion of the `{a},b}` rewrite causes CPU denial of service](https://github.com/advisories/GHSA-q2hr-2g5m-vwhr) | moderate | Resolved in audit |
| [brace-expansion: Quadratic-time expansion of the `{a},b}` rewrite causes CPU denial of service](https://github.com/advisories/GHSA-q2hr-2g5m-vwhr) | moderate | Resolved in audit |
| [brace-expansion: DoS via uncontrolled recursion on nested brace groups causing stack exhaustion](https://github.com/advisories/GHSA-qhr7-859c-m2p7) | high | Resolved in audit |
| [brace-expansion: DoS via uncontrolled recursion on nested brace groups causing stack exhaustion](https://github.com/advisories/GHSA-qhr7-859c-m2p7) | high | Resolved in audit |
| [brace-expansion: DoS via unbounded intermediate arrays, bypassing the CVE-2026-14257 mitigation](https://github.com/advisories/GHSA-rgw5-rvv9-x895) | high | Resolved in audit |
| [brace-expansion: DoS via unbounded intermediate arrays, bypassing the CVE-2026-14257 mitigation](https://github.com/advisories/GHSA-rgw5-rvv9-x895) | high | Resolved in audit |

### browserslist

Baseline versions: 4.28.1. Exposure: Tooling/transitive.

| Advisory | Severity | Status |
| --- | --- | --- |
| [Browserslist: Uncaught crash / prototype write via untrusted browserslist-stats.json custom stats (normalizeStats)](https://github.com/advisories/GHSA-73wf-gq98-2v4g) | high | Resolved in audit |
| [Browserslist: Unbounded memory growth (no cache eviction) via distinct query results, leading to eventual OOM](https://github.com/advisories/GHSA-c83g-rgw3-j3cx) | high | Resolved in audit |

### decode-uri-component

Baseline versions: 0.2.2. Exposure: Extension.

| Advisory | Severity | Status |
| --- | --- | --- |
| [decode-uri-component vulnerable to denial of service via quadratic replacement of percent-encoded runs](https://github.com/advisories/GHSA-qr28-fpjm-wq7f) | high | Resolved in audit |
| [decode-uri-component: Denial of service via exponential decoding of malformed percent-encoded input](https://github.com/advisories/GHSA-vcc3-ghjq-m6fr) | moderate | Resolved in audit |

### deepmerge

Baseline versions: 4.3.1. Exposure: Extension.

| Advisory | Severity | Status |
| --- | --- | --- |
| [deepmerge mergeObject() allows prototype poisoning of returned objects](https://github.com/advisories/GHSA-gcqx-w48m-w2h4) | low | Resolved in audit |

### diff

Baseline versions: 7.0.0. Exposure: Tooling/transitive.

| Advisory | Severity | Status |
| --- | --- | --- |
| [jsdiff has a Denial of Service vulnerability in parsePatch and applyPatch](https://github.com/advisories/GHSA-73rr-hh4g-fpgx) | low | Resolved in audit |

### dot-prop

Baseline versions: 3.0.0. Exposure: Release/install.

| Advisory | Severity | Status |
| --- | --- | --- |
| [dot-prop Prototype Pollution vulnerability](https://github.com/advisories/GHSA-ff7x-qrg7-qggm) | high | Resolved in audit |

### esbuild

Baseline versions: 0.21.5, 0.27.3. Exposure: Tooling/transitive.

| Advisory | Severity | Status |
| --- | --- | --- |
| [esbuild enables any website to send any requests to the development server and read the response](https://github.com/advisories/GHSA-67mh-4wv8-2f99) | moderate | Resolved in audit |
| [esbuild allows arbitrary file read when running the development server on Windows](https://github.com/advisories/GHSA-g7r4-m6w7-qqqr) | low | Resolved in audit |

### fast-uri

Baseline versions: 3.1.0. Exposure: Tooling/transitive.

| Advisory | Severity | Status |
| --- | --- | --- |
| [fast-uri vulnerable to scheme injection via an unescaped first-segment colon in suffix references](https://github.com/advisories/GHSA-333x-w4r6-6crp) | low | Resolved in audit |
| [fast-uri vulnerable to host confusion via failed IDN canonicalization](https://github.com/advisories/GHSA-4c8g-83qw-93j6) | high | Resolved in audit |
| [fast-uri vulnerable to host confusion via backslash authority introducer](https://github.com/advisories/GHSA-7p8r-x3mc-p8w7) | high | Resolved in audit |
| [fast-uri vulnerable to server-side request forgery via malformed IPv6 normalization](https://github.com/advisories/GHSA-f65p-4m7j-42xc) | high | Resolved in audit |
| [fast-uri vulnerable to inconsistent host case normalization via percent-encoded octets](https://github.com/advisories/GHSA-hrr3-gc8f-f4qj) | moderate | Resolved in audit |
| [fast-uri vulnerable to host confusion via percent-encoded scheme normalization](https://github.com/advisories/GHSA-jqff-g426-hqxp) | high | Resolved in audit |
| [fast-uri vulnerable to path traversal via percent-encoded dot segments](https://github.com/advisories/GHSA-q3j6-qgpj-74h6) | high | Resolved in audit |
| [fast-uri vulnerable to authority injection via an unvalidated port in serialize](https://github.com/advisories/GHSA-qw65-cvwx-89v3) | high | Resolved in audit |
| [fast-uri vulnerable to host confusion via literal backslash authority delimiter](https://github.com/advisories/GHSA-v2hh-gcrm-f6hx) | high | Resolved in audit |
| [fast-uri vulnerable to host confusion via percent-encoded authority delimiters](https://github.com/advisories/GHSA-v39h-62p7-jpjc) | high | Resolved in audit |
| [fast-uri vulnerable to URI scheme spoofing via percent-encoded scheme decoding](https://github.com/advisories/GHSA-w74x-v6f9-j3xg) | moderate | Resolved in audit |
| [fast-uri vulnerable to improper path equivalence in relative reference normalization](https://github.com/advisories/GHSA-xhq7-xmqj-769h) | low | Resolved in audit |

### flatted

Baseline versions: 3.3.3. Exposure: Tooling/transitive.

| Advisory | Severity | Status |
| --- | --- | --- |
| [flatted vulnerable to unbounded recursion DoS in parse() revive phase](https://github.com/advisories/GHSA-25h7-pfq9-p65f) | high | Resolved in audit |
| [Prototype Pollution via parse() in NodeJS flatted](https://github.com/advisories/GHSA-rf6f-7fwh-wjgh) | high | Resolved in audit |

### follow-redirects

Baseline versions: 1.15.11. Exposure: Tooling/transitive.

| Advisory | Severity | Status |
| --- | --- | --- |
| [follow-redirects leaks Custom Authentication Headers to Cross-Domain Redirect Targets](https://github.com/advisories/GHSA-r4q5-vmmm-2653) | moderate | Resolved in audit |

### form-data

Baseline versions: 4.0.5. Exposure: Tooling/transitive.

| Advisory | Severity | Status |
| --- | --- | --- |
| [form-data: CRLF injection in form-data via unescaped multipart field names and filenames](https://github.com/advisories/GHSA-hmw2-7cc7-3qxx) | high | Resolved in audit |

### glob

Baseline versions: 10.5.0, 11.1.0, 13.0.2. Exposure: Tooling/transitive.

| Advisory | Severity | Status |
| --- | --- | --- |
| [Glob: AbortSignal cancellation bypass allows post-timeout filesystem traversal](https://github.com/advisories/GHSA-3g3m-2fjr-6pw4) | moderate | Resolved in audit |

### got

Baseline versions: 8.3.2. Exposure: Release/install.

| Advisory | Severity | Status |
| --- | --- | --- |
| [Got allows a redirect to a UNIX socket](https://github.com/advisories/GHSA-pfrx-2q88-qq97) | moderate | Resolved in audit |

### handlebars

Baseline versions: 4.7.8. Exposure: Tooling/transitive.

| Advisory | Severity | Status |
| --- | --- | --- |
| [Handlebars.js has Prototype Pollution Leading to XSS through Partial Template Injection](https://github.com/advisories/GHSA-2qvq-rjwj-gvw9) | moderate | Resolved in audit |
| [Handlebars.js has JavaScript Injection via AST Type Confusion](https://github.com/advisories/GHSA-2w6w-674q-4c4q) | critical | Resolved in audit |
| [Handlebars.js has JavaScript Injection via AST Type Confusion by tampering @partial-block](https://github.com/advisories/GHSA-3mfm-83xf-c92r) | high | Resolved in audit |
| [Handlebars.js has a Property Access Validation Bypass in container.lookup](https://github.com/advisories/GHSA-442j-39wm-28r2) | low | Resolved in audit |
| [Handlebars.js has a Prototype Method Access Control Gap via Missing __lookupSetter__ Blocklist Entry](https://github.com/advisories/GHSA-7rx3-28cr-v5wh) | moderate | Resolved in audit |
| [Handlebars: JavaScript Injection via AST Type Confusion in compile (bypass of CVE-2026-33937)](https://github.com/advisories/GHSA-8r5x-fm3f-whwj) | critical | Resolved in audit |
| [Handlebars.js has Denial of Service via Malformed Decorator Syntax in Template Compilation](https://github.com/advisories/GHSA-9cx6-37pm-9jff) | high | Resolved in audit |
| [Handlebars: JavaScript Injection via Own Property Check Bypass](https://github.com/advisories/GHSA-p8wg-vrv2-v86f) | critical | Resolved in audit |
| [Handlebars.js has JavaScript Injection via AST Type Confusion when passing an object as dynamic partial](https://github.com/advisories/GHSA-xhpv-hc6g-r9c6) | high | Resolved in audit |
| [Handlebars.js has JavaScript Injection in CLI Precompiler via Unescaped Names and Options](https://github.com/advisories/GHSA-xjpj-3mr7-gcpf) | high | Resolved in audit |
| [Handlebars: JavaScript Injection via Unsafe Inline Embedding of Precompiled Templates](https://github.com/advisories/GHSA-xw65-4hp5-5hc7) | moderate | Resolved in audit |

### http-cache-semantics

Baseline versions: 3.8.1. Exposure: Release/install.

| Advisory | Severity | Status |
| --- | --- | --- |
| [http-cache-semantics vulnerable to Regular Expression Denial of Service](https://github.com/advisories/GHSA-rc47-6667-2j5j) | high | Resolved in audit |

### js-yaml

Baseline versions: 3.14.2, 4.1.1. Exposure: Extension.

| Advisory | Severity | Status |
| --- | --- | --- |
| [js-yaml: maxTotalMergeKeys does not limit CPU use for empty merge sources](https://github.com/advisories/GHSA-2883-xcg3-v3hh) | high | Resolved in audit |
| [js-yaml: maxTotalMergeKeys does not limit CPU use for empty merge sources](https://github.com/advisories/GHSA-2883-xcg3-v3hh) | high | Resolved in audit |
| [js-yaml: YAML merge-key chains can force quadratic CPU consumption](https://github.com/advisories/GHSA-52cp-r559-cp3m) | high | Resolved in audit |
| [js-yaml: YAML merge-key chains can force quadratic CPU consumption](https://github.com/advisories/GHSA-52cp-r559-cp3m) | high | Resolved in audit |
| [JS-YAML: Quadratic CPU consumption in !!omap resolution (3.x and 4.x) — CVE-2026-59870 fix not backported](https://github.com/advisories/GHSA-5p4m-2wfm-xmqj) | high | Resolved in audit |
| [JS-YAML: Quadratic CPU consumption in !!omap resolution (3.x and 4.x) — CVE-2026-59870 fix not backported](https://github.com/advisories/GHSA-5p4m-2wfm-xmqj) | high | Resolved in audit |
| [JS-YAML: Quadratic-complexity DoS in merge key handling via repeated aliases](https://github.com/advisories/GHSA-h67p-54hq-rp68) | moderate | Resolved in audit |
| [JS-YAML: Quadratic-complexity DoS in merge key handling via repeated aliases](https://github.com/advisories/GHSA-h67p-54hq-rp68) | moderate | Resolved in audit |

### linkify-it

Baseline versions: 5.0.0. Exposure: Tooling/transitive.

| Advisory | Severity | Status |
| --- | --- | --- |
| [LinkifyIt#match scan loop has quadratic algorithmic complexity](https://github.com/advisories/GHSA-22p9-wv53-3rq4) | high | Resolved in audit |
| [linkify-it: Quadratic-complexity DoS via the `mailto:` validator scan-loop on attacker text](https://github.com/advisories/GHSA-v245-v573-v5vm) | high | Resolved in audit |

### lodash

Baseline versions: 4.17.23. Exposure: Extension.

| Advisory | Severity | Status |
| --- | --- | --- |
| [lodash vulnerable to Prototype Pollution via array path bypass in `_.unset` and `_.omit`](https://github.com/advisories/GHSA-f23m-r3pf-42rh) | moderate | Resolved in audit |
| [lodash vulnerable to Code Injection via `_.template` imports key names](https://github.com/advisories/GHSA-r5fr-rjxr-66jc) | high | Resolved in audit |

### lodash.template

Baseline versions: 4.5.0. Exposure: Tooling/transitive.

| Advisory | Severity | Status |
| --- | --- | --- |
| [Command Injection in lodash](https://github.com/advisories/GHSA-35jh-r3h4-6jhm) | high | Resolved in audit |
| [lodash vulnerable to Code Injection via `_.template` imports key names](https://github.com/advisories/GHSA-r5fr-rjxr-66jc) | high | Resolved in audit |

### markdown-it

Baseline versions: 14.1.1. Exposure: Tooling/transitive.

| Advisory | Severity | Status |
| --- | --- | --- |
| [markdown-it linkify: true has two quadratic paths, so a few hundred KB of markdown blocks the event loop for tens of seconds](https://github.com/advisories/GHSA-253c-mchw-3w2r) | moderate | Resolved in audit |
| [markdown-it: Quadratic complexity DoS in smartquotes rule via replaceAt string operations](https://github.com/advisories/GHSA-6v5v-wf23-fmfq) | moderate | Resolved in audit |
| [markdown-it: Quadratic-time rendering of a single multi-line link reference definition with default options (regression since 14.0)](https://github.com/advisories/GHSA-gfr2-rv44-r23c) | high | Resolved in audit |
| [markdown-it: Quadratic complexity in smartquotes with unmatched closing quotes](https://github.com/advisories/GHSA-r7fv-28h4-cvq7) | high | Resolved in audit |
| [markdown-it: Quadratic-time denial of service in inline HTML parsing with html enabled](https://github.com/advisories/GHSA-vfgh-jcmw-g37q) | low | Resolved in audit |

### minimatch

Baseline versions: 10.1.2, 3.1.2, 9.0.5. Exposure: Extension.

| Advisory | Severity | Status |
| --- | --- | --- |
| [minimatch ReDoS: nested *() extglobs generate catastrophically backtracking regular expressions](https://github.com/advisories/GHSA-23c5-xmqv-rm74) | high | Resolved in audit |
| [minimatch ReDoS: nested *() extglobs generate catastrophically backtracking regular expressions](https://github.com/advisories/GHSA-23c5-xmqv-rm74) | high | Resolved in audit |
| [minimatch ReDoS: nested *() extglobs generate catastrophically backtracking regular expressions](https://github.com/advisories/GHSA-23c5-xmqv-rm74) | high | Resolved in audit |
| [minimatch has a ReDoS via repeated wildcards with non-matching literal in pattern](https://github.com/advisories/GHSA-3ppc-4f35-3m26) | high | Resolved in audit |
| [minimatch has a ReDoS via repeated wildcards with non-matching literal in pattern](https://github.com/advisories/GHSA-3ppc-4f35-3m26) | high | Resolved in audit |
| [minimatch has a ReDoS via repeated wildcards with non-matching literal in pattern](https://github.com/advisories/GHSA-3ppc-4f35-3m26) | high | Resolved in audit |
| [minimatch has ReDoS: matchOne() combinatorial backtracking via multiple non-adjacent GLOBSTAR segments](https://github.com/advisories/GHSA-7r86-cg39-jmmj) | high | Resolved in audit |
| [minimatch has ReDoS: matchOne() combinatorial backtracking via multiple non-adjacent GLOBSTAR segments](https://github.com/advisories/GHSA-7r86-cg39-jmmj) | high | Resolved in audit |
| [minimatch has ReDoS: matchOne() combinatorial backtracking via multiple non-adjacent GLOBSTAR segments](https://github.com/advisories/GHSA-7r86-cg39-jmmj) | high | Resolved in audit |
| [minimatch has potential denial of service via globparts amplification](https://github.com/advisories/GHSA-g3hv-75wg-m249) | moderate | Still reported; see analysis above |

### nanoid

Baseline versions: 3.3.11. Exposure: Extension.

| Advisory | Severity | Status |
| --- | --- | --- |
| [nanoid: non-secure generators can loop indefinitely with negative size](https://github.com/advisories/GHSA-28wg-ghj8-5hjv) | high | Resolved in audit |
| [nanoid: custom generators can loop indefinitely when size is zero](https://github.com/advisories/GHSA-2v37-7h3g-55p8) | high | Resolved in audit |
| [nanoid: Integer Overflow or Wraparound](https://github.com/advisories/GHSA-xwg4-73v4-xw9w) | high | Resolved in audit |

### picomatch

Baseline versions: 2.3.1, 4.0.3. Exposure: Extension.

| Advisory | Severity | Status |
| --- | --- | --- |
| [Picomatch: Method Injection in POSIX Character Classes causes incorrect Glob Matching](https://github.com/advisories/GHSA-3v7f-55p6-f55p) | moderate | Resolved in audit |
| [Picomatch: Method Injection in POSIX Character Classes causes incorrect Glob Matching](https://github.com/advisories/GHSA-3v7f-55p6-f55p) | moderate | Resolved in audit |
| [Picomatch has a ReDoS vulnerability via extglob quantifiers](https://github.com/advisories/GHSA-c2c7-rcm5-vvqj) | high | Resolved in audit |
| [Picomatch has a ReDoS vulnerability via extglob quantifiers](https://github.com/advisories/GHSA-c2c7-rcm5-vvqj) | high | Resolved in audit |

### postcss

Baseline versions: 7.0.39, 8.5.6, 8.5.8. Exposure: Tooling/transitive.

| Advisory | Severity | Status |
| --- | --- | --- |
| [PostCSS: Arbitrary file read and information disclosure via attacker-controlled sourceMappingURL in CSS comments](https://github.com/advisories/GHSA-6g55-p6wh-862q) | high | Resolved in audit |
| [PostCSS line return parsing error](https://github.com/advisories/GHSA-7fh5-64p2-3v2j) | moderate | Resolved in audit |
| [PostCSS: incomplete fix of GHSA-6g55-p6wh-862q — attacker-controlled sourceMappingURL reads arbitrary .map files when `from` is unset](https://github.com/advisories/GHSA-fxqj-rqcc-2cmp) | moderate | Resolved in audit |
| [PostCSS has XSS via Unescaped </style> in its CSS Stringify Output](https://github.com/advisories/GHSA-qx2v-qp2m-jg93) | moderate | Resolved in audit |
| [PostCSS: Path Traversal in Previous Source Map Auto-Loading (sourceMappingURL) leads to Arbitrary .map File Disclosure](https://github.com/advisories/GHSA-r28c-9q8g-f849) | high | Resolved in audit |

### postcss-selector-parser

Baseline versions: 6.1.2, 7.1.1. Exposure: Tooling/transitive.

| Advisory | Severity | Status |
| --- | --- | --- |
| [PostCSS: Quadratic complexity in flat selector parsing allows CPU exhaustion](https://github.com/advisories/GHSA-rj75-hqrm-r3gf) | moderate | Resolved in audit |
| [PostCSS: Quadratic complexity in flat selector parsing allows CPU exhaustion](https://github.com/advisories/GHSA-rj75-hqrm-r3gf) | moderate | Resolved in audit |
| [postcss-selector-parser allows denial of service through uncontrolled AST recursion](https://github.com/advisories/GHSA-w9m9-85wc-3x92) | low | Resolved in audit |
| [postcss-selector-parser allows denial of service through uncontrolled AST recursion](https://github.com/advisories/GHSA-w9m9-85wc-3x92) | low | Resolved in audit |

### qs

Baseline versions: 6.14.2. Exposure: Extension.

| Advisory | Severity | Status |
| --- | --- | --- |
| [qs: Denial of Service via Attacker Controlled isBuffer](https://github.com/advisories/GHSA-4mjr-xmp4-gh2g) | moderate | Resolved in audit |
| [qs : qs.stringify with arrayFormat 'comma' throws an uncaught TypeError on array elements carrying a non-callable own toString (DoS)](https://github.com/advisories/GHSA-6pq8-jhm2-2vcw) | moderate | Resolved in audit |
| [qs has a remotely triggerable DoS: qs.stringify crashes with TypeError on null/undefined entries in comma-format arrays when encodeValuesOnly is set](https://github.com/advisories/GHSA-q8mj-m7cp-5q26) | moderate | Resolved in audit |
| [qs array-limit bypass via bracket-key comma parsing](https://github.com/advisories/GHSA-x5fp-wj9c-mxmx) | moderate | Resolved in audit |

### rollup

Baseline versions: 4.57.1. Exposure: Tooling/transitive.

| Advisory | Severity | Status |
| --- | --- | --- |
| [Rollup 4 has Arbitrary File Write via Path Traversal](https://github.com/advisories/GHSA-mw96-cpmx-2vgc) | high | Resolved in audit |

### semver-regex

Baseline versions: 2.0.0. Exposure: Release/install.

| Advisory | Severity | Status |
| --- | --- | --- |
| [semver-regex Regular Expression Denial of Service (ReDOS)](https://github.com/advisories/GHSA-44c6-4v22-4mhx) | high | Resolved in audit |
| [Regular expression denial of service in semver-regex](https://github.com/advisories/GHSA-4x5v-gmq8-25ch) | low | Resolved in audit |

### serialize-javascript

Baseline versions: 6.0.2. Exposure: Tooling/transitive.

| Advisory | Severity | Status |
| --- | --- | --- |
| [Serialize JavaScript is Vulnerable to RCE via RegExp.flags and Date.prototype.toISOString()](https://github.com/advisories/GHSA-5c6j-r48x-rmvq) | high | Resolved in audit |
| [Serialize JavaScript: Cross-site scripting (XSS) via unescaped </script at the end of a serialized function body](https://github.com/advisories/GHSA-m5mm-p8h7-m29v) | low | Resolved in audit |
| [Serialize JavaScript has CPU Exhaustion Denial of Service via crafted array-like objects](https://github.com/advisories/GHSA-qj8w-gfj5-8c6v) | moderate | Resolved in audit |

### shell-quote

Baseline versions: 1.8.3. Exposure: Tooling/transitive.

| Advisory | Severity | Status |
| --- | --- | --- |
| [shell-quote: Quadratic-complexity Denial of Service in `parse()` (CWE-407)](https://github.com/advisories/GHSA-395f-4hp3-45gv) | high | Resolved in audit |
| [shell-quote quote() does not escape newlines in object .op values](https://github.com/advisories/GHSA-w7jw-789q-3m8p) | critical | Resolved in audit |

### source-map-js

Baseline versions: 1.2.1. Exposure: Tooling/transitive.

| Advisory | Severity | Status |
| --- | --- | --- |
| [source-map-js allows event-loop denial of service through indexed source-map section offsets](https://github.com/advisories/GHSA-68fv-2mgg-jv7q) | high | Resolved in audit |

### tar

Baseline versions: 6.2.1. Exposure: Release/install.

| Advisory | Severity | Status |
| --- | --- | --- |
| [node-tar: Decompression/parse DoS via unlimited input](https://github.com/advisories/GHSA-23hp-3jrh-7fpw) | critical | Resolved in audit |
| [node-tar Vulnerable to Arbitrary File Creation/Overwrite via Hardlink Path Traversal](https://github.com/advisories/GHSA-34x7-hfp2-rc4v) | high | Resolved in audit |
| [Arbitrary File Read/Write via Hardlink Target Escape Through Symlink Chain in node-tar Extraction](https://github.com/advisories/GHSA-83g3-92jg-28cx) | high | Resolved in audit |
| [node-tar is Vulnerable to Arbitrary File Overwrite and Symlink Poisoning via Insufficient Path Sanitization](https://github.com/advisories/GHSA-8qq5-rm4j-mr97) | high | Resolved in audit |
| [node-tar: Negative tar entry size causes infinite loop in archive replace](https://github.com/advisories/GHSA-8x88-c5mf-7j5w) | high | Resolved in audit |
| [node-tar Symlink Path Traversal via Drive-Relative Linkpath](https://github.com/advisories/GHSA-9ppj-qmqm-q256) | high | Resolved in audit |
| [node-tar: Uncaught Exception DoS via NUL byte in PAX path/linkpath records](https://github.com/advisories/GHSA-gvwx-54wh-qm9j) | moderate | Resolved in audit |
| [tar has Hardlink Path Traversal via Drive-Relative Linkpath](https://github.com/advisories/GHSA-qffp-2rhf-9h96) | high | Resolved in audit |
| [node-tar: Uncontrolled recursion in mapHas/filesFilter allows uncatchable stack-overflow DoS via crafted long-path tar with member selection](https://github.com/advisories/GHSA-r292-9mhp-454m) | high | Resolved in audit |
| [Race Condition in node-tar Path Reservations via Unicode Ligature Collisions on macOS APFS](https://github.com/advisories/GHSA-r6q2-hw4h-h46w) | high | Resolved in audit |
| [node-tar applies PAX size override to intermediary GNU long-name/long-link headers, causing tar parser interpretation differential (file smuggling)](https://github.com/advisories/GHSA-vmf3-w455-68vh) | moderate | Resolved in audit |
| [node-tar: Process crash via PAX numeric path type confusion](https://github.com/advisories/GHSA-w8wr-v893-vjvp) | moderate | Resolved in audit |

### tmp

Baseline versions: 0.2.5. Exposure: Tooling/transitive.

| Advisory | Severity | Status |
| --- | --- | --- |
| [tmp has Path Traversal via unsanitized prefix/postfix that enables directory escape](https://github.com/advisories/GHSA-ph9p-34f9-6g65) | high | Resolved in audit |

### trim-newlines

Baseline versions: 1.0.0, 2.0.0. Exposure: Release/install.

| Advisory | Severity | Status |
| --- | --- | --- |
| [Uncontrolled Resource Consumption in trim-newlines](https://github.com/advisories/GHSA-7p7h-4mm5-852v) | high | Resolved in audit |

### underscore

Baseline versions: 1.13.7. Exposure: Tooling/transitive.

| Advisory | Severity | Status |
| --- | --- | --- |
| [Underscore has unlimited recursion in _.flatten and _.isEqual, potential for DoS attack](https://github.com/advisories/GHSA-qpx9-hpmf-5gmw) | high | Resolved in audit |

### undici

Baseline versions: 7.21.0. Exposure: Release/install.

| Advisory | Severity | Status |
| --- | --- | --- |
| [undici vulnerable to response truncation via oversized chunked responses in the dump interceptor](https://github.com/advisories/GHSA-2gqq-gqf2-x968) | low | Resolved in audit |
| [undici vulnerable to cross-user cookie disclosure via Set-Cookie caching in shared caches](https://github.com/advisories/GHSA-2jfj-6hjv-fm6j) | moderate | Resolved in audit |
| [undici vulnerable to TLS certificate validation bypass via dropped tls options in Agent](https://github.com/advisories/GHSA-2m5v-pch6-74hx) | high | Resolved in audit |
| [Undici has an HTTP Request/Response Smuggling issue](https://github.com/advisories/GHSA-2mjp-6q6p-2qxm) | moderate | Resolved in audit |
| [undici vulnerable to HTTP response queue poisoning via keep-alive socket reuse](https://github.com/advisories/GHSA-35p6-xmwp-9g52) | low | Resolved in audit |
| [undici vulnerable to Denial of Service via unbounded decompression of compressed responses](https://github.com/advisories/GHSA-3xpg-4rpp-hhhm) | moderate | Resolved in audit |
| [Undici has CRLF Injection in undici via `upgrade` option](https://github.com/advisories/GHSA-4992-7rv2-5pvq) | moderate | Resolved in audit |
| [undici vulnerable to cross-user information disclosure and parse-time crash via degenerate private cache directives](https://github.com/advisories/GHSA-4cwx-7wf7-3272) | high | Resolved in audit |
| [undici vulnerable to Denial of Service via unbounded memory in the EventSource parser](https://github.com/advisories/GHSA-4qv8-2p9j-2685) | moderate | Resolved in audit |
| [undici vulnerable to cache poisoning and cross-user disclosure via cross-origin redirects](https://github.com/advisories/GHSA-4w7w-5xrc-9h26) | high | Resolved in audit |
| [undici vulnerable to Denial of Service via unhandled exception in the decompress interceptor](https://github.com/advisories/GHSA-55wc-3pg8-jfw6) | moderate | Resolved in audit |
| [undici vulnerable to caching and replay of unsafe HTTP method responses](https://github.com/advisories/GHSA-8436-99hf-9mmv) | low | Resolved in audit |
| [undici vulnerable to downstream response desynchronization via retry interceptor](https://github.com/advisories/GHSA-8xcm-r25x-g524) | moderate | Resolved in audit |
| [undici WebSocket client vulnerable to Denial of Service via unbounded automatic PONG buffering](https://github.com/advisories/GHSA-9fm3-97px-rjf6) | moderate | Resolved in audit |
| [Undici: Malicious WebSocket 64-bit length overflows parser and crashes the client](https://github.com/advisories/GHSA-f269-vfmq-vjvj) | high | Resolved in audit |
| [undici vulnerable to Subresource Integrity bypass via non-lowercase algorithm tokens](https://github.com/advisories/GHSA-f72v-6w45-q472) | moderate | Resolved in audit |
| [undici vulnerable to Set-Cookie SameSite attribute downgrade via permissive substring matching](https://github.com/advisories/GHSA-g8m3-5g58-fq7m) | low | Resolved in audit |
| [undici vulnerable to cross-user information disclosure via whitespace around equals in Cache-Control directives](https://github.com/advisories/GHSA-jr45-8vmc-qm54) | moderate | Resolved in audit |
| [undici vulnerable to CRLF Injection via blob-like body 'type' property](https://github.com/advisories/GHSA-m8rv-5g2x-5cg5) | moderate | Resolved in audit |
| [undici vulnerable to HTTP header injection via Set-Cookie percent-decoding](https://github.com/advisories/GHSA-p88m-4jfj-68fv) | moderate | Resolved in audit |
| [Undici has Unbounded Memory Consumption in its DeduplicationHandler via Response Buffering that leads to DoS](https://github.com/advisories/GHSA-phc3-fgpg-7m6h) | moderate | Resolved in audit |
| [undici vulnerable to Denial of Service via orphaned RetryHandler response body](https://github.com/advisories/GHSA-pmjh-fq2x-6v4x) | moderate | Resolved in audit |
| [undici vulnerable to cross-user information disclosure via shared cache whitespace bypass](https://github.com/advisories/GHSA-pr7r-676h-xcf6) | moderate | Resolved in audit |
| [undici vulnerable to Denial of Service via TLS 1.2 certificate-changing renegotiation](https://github.com/advisories/GHSA-qrxm-fqhp-jwvm) | high | Resolved in audit |
| [undici vulnerable to downstream response splitting via retry interceptor](https://github.com/advisories/GHSA-r53p-7pc4-xj5r) | low | Resolved in audit |
| [undici vulnerable to Denial of Service via unrequested WebSocket subprotocol](https://github.com/advisories/GHSA-rfgv-xxqx-mfg5) | high | Resolved in audit |
| [undici vulnerable to Denial of Service via WebSocketStream unclean close](https://github.com/advisories/GHSA-rx4f-c7p8-82vq) | moderate | Resolved in audit |
| [undici vulnerable to cookie attribute injection via unsanitized domain and unparsed setCookie fields](https://github.com/advisories/GHSA-v3r7-h72x-cjcm) | moderate | Resolved in audit |
| [Undici has Unhandled Exception in WebSocket Client Due to Invalid server_max_window_bits Validation](https://github.com/advisories/GHSA-v9p9-hfj2-hcw8) | high | Resolved in audit |
| [Undici has Unbounded Memory Consumption in WebSocket permessage-deflate Decompression](https://github.com/advisories/GHSA-vrm6-8vpv-qv8q) | high | Resolved in audit |
| [undici WebSocket client vulnerable to denial of service via fragment count bypass](https://github.com/advisories/GHSA-vxpw-j846-p89q) | high | Resolved in audit |
| [undici vulnerable to Denial of Service via unhandled error on excessive content-encodings](https://github.com/advisories/GHSA-xjj6-f33q-929c) | high | Resolved in audit |

### uuid

Baseline versions: 13.0.0, 8.3.2. Exposure: Tooling/transitive.

| Advisory | Severity | Status |
| --- | --- | --- |
| [uuid: Missing buffer bounds check in v3/v5/v6 when buf is provided](https://github.com/advisories/GHSA-w5hq-g745-h8pq) | moderate | Resolved in audit |
| [uuid: Missing buffer bounds check in v3/v5/v6 when buf is provided](https://github.com/advisories/GHSA-w5hq-g745-h8pq) | moderate | Resolved in audit |

### vite

Baseline versions: 5.4.21, 7.3.1. Exposure: Tooling/transitive.

| Advisory | Severity | Status |
| --- | --- | --- |
| [Vite Vulnerable to Path Traversal in Optimized Deps `.map` Handling](https://github.com/advisories/GHSA-4w7w-66w2-5vf9) | moderate | Resolved in audit |
| [Vite Vulnerable to Path Traversal in Optimized Deps `.map` Handling](https://github.com/advisories/GHSA-4w7w-66w2-5vf9) | moderate | Resolved in audit |
| [launch-editor: `fs.existsSync()` existence check can be bypassed on Windows](https://github.com/advisories/GHSA-587h-7wmj-h5pm) | high | Resolved in audit |
| [launch-editor: `fs.existsSync()` existence check can be bypassed on Windows](https://github.com/advisories/GHSA-587h-7wmj-h5pm) | high | Resolved in audit |
| [launch-editor: escapeCmdArgs() omits % escaping on Windows](https://github.com/advisories/GHSA-698v-4r3x-3vcv) | moderate | Resolved in audit |
| [launch-editor: escapeCmdArgs() omits % escaping on Windows](https://github.com/advisories/GHSA-698v-4r3x-3vcv) | moderate | Resolved in audit |
| [Vite: Cross origin script execution through Vite custom middleware](https://github.com/advisories/GHSA-9jrq-w75r-8gcw) | low | Resolved in audit |
| [Vite: Cross origin script execution through Vite custom middleware](https://github.com/advisories/GHSA-9jrq-w75r-8gcw) | low | Resolved in audit |
| [vite: `server.fs.deny` bypass on Windows alternate paths](https://github.com/advisories/GHSA-fx2h-pf6j-xcff) | moderate | Resolved in audit |
| [vite: `server.fs.deny` bypass on Windows alternate paths](https://github.com/advisories/GHSA-fx2h-pf6j-xcff) | moderate | Resolved in audit |
| [Vite Vulnerable to Arbitrary File Read via Vite Dev Server WebSocket](https://github.com/advisories/GHSA-p9ff-h696-f583) | high | Resolved in audit |
| [launch-editor: Editor CLI flag misinterpretation causing arbitrary command execution for some editors](https://github.com/advisories/GHSA-r825-w8mm-5pxw) | moderate | Resolved in audit |
| [launch-editor: Editor CLI flag misinterpretation causing arbitrary command execution for some editors](https://github.com/advisories/GHSA-r825-w8mm-5pxw) | moderate | Resolved in audit |
| [Vite: Files outside `server.fs.allow` could be served when project paths match system paths on non-Windows machine](https://github.com/advisories/GHSA-rq7h-c2jc-7f22) | moderate | Resolved in audit |
| [Vite: Files outside `server.fs.allow` could be served when project paths match system paths on non-Windows machine](https://github.com/advisories/GHSA-rq7h-c2jc-7f22) | moderate | Resolved in audit |
| [Vite: `server.fs.deny` bypassed with queries](https://github.com/advisories/GHSA-v2wj-q39q-566r) | high | Resolved in audit |
| [launch-editor: NTLMv2 hash disclosure via UNC path handling on Windows](https://github.com/advisories/GHSA-v6wh-96g9-6wx3) | moderate | Resolved in audit |
| [launch-editor: NTLMv2 hash disclosure via UNC path handling on Windows](https://github.com/advisories/GHSA-v6wh-96g9-6wx3) | moderate | Resolved in audit |

### vue-i18n

Baseline versions: 11.2.8. Exposure: Webview.

| Advisory | Severity | Status |
| --- | --- | --- |
| [Vue I18n: escapeParameter does not prevent XSS through srcdoc in translation messages](https://github.com/advisories/GHSA-83rm-6c8r-g728) | high | Resolved in audit |
| [Vue I18n: `escapeParameter` does not escape named values when the same call also passes a list](https://github.com/advisories/GHSA-8rc2-428q-7ww3) | low | Resolved in audit |

### vue-template-compiler

Baseline versions: 2.7.16. Exposure: Extension.

| Advisory | Severity | Status |
| --- | --- | --- |
| [vue-template-compiler vulnerable to client-side Cross-Site Scripting (XSS)](https://github.com/advisories/GHSA-g3ch-rx76-35fx) | moderate | Resolved in audit |

### yaml

Baseline versions: 1.10.2, 2.8.2. Exposure: Extension.

| Advisory | Severity | Status |
| --- | --- | --- |
| [yaml is vulnerable to Stack Overflow via deeply nested YAML collections](https://github.com/advisories/GHSA-48c2-rrv3-qjmp) | moderate | Resolved in audit |
| [yaml is vulnerable to Stack Overflow via deeply nested YAML collections](https://github.com/advisories/GHSA-48c2-rrv3-qjmp) | moderate | Resolved in audit |
