# Engineering contributions — Hamed Minaei

**Project:** Knowledge Workbench  
**Role:** Runtime modernization, local ingestion and retrieval design, source provenance, evaluation and workbench UI implementation  
**Portfolio:** https://github.com/hamed665

I developed this portfolio edition as an extension of Supabase community's Next.js doc-search template. The original foundation, copyright, license notices and Git ancestry are preserved. The work described below is my added integration and application development.

## My implementation

Bounded document ingestion, stable chunk identities, source citations, abstention and retrieval evaluation.

**Primary code:** `lib/ingestion.ts`, `lib/retrieval.ts`, `app/`, evaluation and ingestion scripts, tests and CI.

## Review the work

- [Implementation pull request](https://github.com/hamed665/enterprise-rag-knowledge-base/pull/1): inspect the actual added code and reviewable history.
- [Testing instructions](README.md#testing): reproduce the relevant checks.
- **Verification evidence:** 7 tests; TypeScript/build/API smoke; 2 real browser scenarios; isolated runtime package audit.
- **Demonstration:** Local knowledge workbench with synthetic documents and actual CI screenshots.

## Engineering boundary

The working preview uses lexical retrieval. Embeddings, LLM-generated answers, enterprise authorization and a new Supabase integration are not implemented; the original cloud application is preserved in `legacy/`.

This is a portfolio preview. The test evidence describes the checks performed and does not establish production readiness.

## Foundation and attribution

Supabase community's Next.js doc-search template supplies the original project foundation. My contribution is the extension and integration scope above; I do not claim original authorship of the upstream platform, SDKs or conversion libraries. See [Attribution](README.md#attribution), the retained root license and the project's dependency-license notes for exact provenance and applicable terms.
