# Changelog

All notable changes to CodeLens will be documented in this file.

---

## [1.0.1] - 2025-04-03

### Bug Fixes
- Fixed noop `if (!extractor) extractor = null` in embedder that had no effect
- Fixed skip message showing ">100KB" when actual limit is 1MB
- Removed dead code: `getVectorStoreType()`, `getQdrantConfigOptional()` from env.ts
- Removed dead code: unused `isValidFile()` from providers.ts
- Removed dead code: unused `existingSize` vector config read in qdrant.ts
- Fixed logger format evaluated once at module load instead of per-call
- Fixed HF token changes via Settings UI requiring a server restart — now re-patches automatically
- Fixed `error.status` check in ingest error handler — corrected to `error.statusCode` matching `CodeLensError`
- Fixed `getGitlabToken()` and `getBitbucketCredentials()` not calling `loadCodeLensEnv()`, causing Settings-UI-saved tokens to not load

### Security & Stability
- Added request body size limits on `/api/ingest` (1KB) and `/api/chat` (500KB)
- Added abort signal support for chat streaming — cancels Gemini stream when client disconnects
- Added Qdrant connectivity pre-check before ingestion with clear error messages
- Added input validation: URL type + length limit, chat history array guard

### Performance
- Added 5-second TTL cache on `loadCodeLensEnv()` — avoids redundant disk reads during a single request
- Replaced magic 1-second delay after Qdrant collection deletion with retry-based polling

### Features
- **First-run setup guidance** — auto-opens Settings modal with step-by-step instructions when API keys are not configured
- **Inline setup guides** — each Settings field shows where to get the key, with direct links to Google AI Studio, Qdrant Cloud, GitHub tokens, etc.
- **Early embedding provider mismatch detection** — caught at page load via `/api/repo/[repoId]` instead of mid-conversation
- **GitLab token support** in Settings UI
- **Bitbucket username + app password support** in Settings UI
- **Auto port detection** — default port changed from 3000 to 4983; automatically finds next free port if busy
- **Dynamic CLI banner** — box width now adapts to URL length instead of being hardcoded

### Documentation
- Added Mermaid architecture diagram showing Ingestion, Chat, and Incremental Indexing pipelines
- Added Configuration reference table with all keys and setup links
- Added Technical Specs table (limits, dimensions, languages, rate limits)
- Added Multi-Platform Support, Incremental Indexing, and Dual Embedding sections
- Updated Ecosystem table with Embeddings, Chunking, and multi-platform connectivity
- Added this CHANGELOG

### Internal
- Version bumped to 1.0.1 in package.json and Settings modal

---

## [1.0.0] - 2025-03-28

### Initial Release
- Neural RAG pipeline with hybrid retrieval (full context + vector search)
- AST-aware structural chunking for 40+ programming languages
- Dual embedding providers: Google Gemini API and Local Xenova
- Incremental indexing via SHA-256 file hash tracking
- LLM-based re-ranking of search candidates
- Context-aware query rewriting from chat history
- Multi-platform support: GitHub, GitLab, Bitbucket with branch/tag support
- Qdrant vector database integration with cosine similarity
- Streaming chat responses via Server-Sent Events
- Settings UI for API key and model management
- Rate limiting middleware (ingest: 5/min, chat: 30/min, repo: 60/min)
- Security headers (HSTS, X-Frame-Options, CSP)
- CLI launcher with first-run setup wizard
- Premium glassmorphic UI with dark/light theme
