# Verification — 2026-10-19

Upstream SHA: 50d6bb71706b50a83c2a52dc4a7d3e426ac34adf (2026-05-12). Apache-2.0 license retained. The original lockfile is v6 and the app pins Next 13.2.4/OpenAI 3.x/AI SDK 2.x.

Baseline attempts: frozen install failed under pnpm 11 because the lockfile is incompatible. A pnpm 8 retry failed because upstream pnpm-workspace.yaml contains settings but no packages field. Original runtime therefore could not be measured beyond source review; cloud execution also requires external credentials. These are recorded failures, not a passing baseline.

The new root runtime is isolated from legacy packages. Frozen dependencies, typecheck, seven unit tests, optimized Next build and built-server HTTP smoke passed locally. The three-case fixture evaluation returns accuracy 1 and MRR 1. Root registry audit reports zero known vulnerabilities at review time. Browser scenarios are authored but require Chromium/CI; no local visual QA is claimed.

HTTP smoke confirms root 200; source-cited search 200; unknown-query abstention; malformed JSON 400; payload >4096 bytes 413; GET search 405.

No Supabase account, SQL schema, production data, OpenAI key or live inference endpoint was accessed. Supabase's current changelog was consulted, but no new Supabase integration is implemented. Legacy schema/auth correctness is unverified. The new extractor does not use credentials or inherit the legacy service-role endpoint.

Remaining work: semantic embeddings, grounded generation and faithfulness eval, production authorization/storage/rate limits, broader independently labeled evaluation data, browser QA and any hosted deployment. Do not present the preview as a complete enterprise RAG service.
