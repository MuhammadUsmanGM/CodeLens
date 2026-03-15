# RepoIQ — Product Specification
> Version: 1.0.0 | Stack: Next.js 15 | Last Updated: March 2026

---

## 1. Product Overview

RepoIQ is a full-stack AI-powered codebase intelligence tool. Users submit a public GitHub repository URL and receive an interactive chat interface that answers questions about the codebase — its structure, logic, architecture, and implementation details — using Retrieval-Augmented Generation (RAG).

**Core Value Proposition:**
> Drop a GitHub URL. Chat with the code. Understand anything in seconds.

**Target Users:**
- Developers onboarding to unfamiliar codebases
- Engineers doing code reviews or audits
- Technical leads evaluating open-source libraries
- Students learning from real-world projects

---

## 2. Technical Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS |
| Animation | Framer Motion |
| Vector DB | Qdrant Cloud (free tier) |
| Embeddings | Google embedding-001 |
| LLM | Gemini 2.0 Flash |
| GitHub Data | GitHub REST API v3 |
| Deployment | Vercel |
| Package Manager | npm |

---

## 3. Environment Variables

```env
# Required
GOOGLE_API_KEY=            # Google AI Studio API key
QDRANT_URL=                # Qdrant Cloud cluster URL
QDRANT_API_KEY=            # Qdrant Cloud API key
GITHUB_TOKEN=              # GitHub personal access token (read-only)

# Optional
NEXT_PUBLIC_APP_URL=       # Production URL for OG/meta tags
```

### How to Obtain Each

| Variable | Source |
|---|---|
| `GOOGLE_API_KEY` | aistudio.google.com → API Keys |
| `QDRANT_URL` | cloud.qdrant.io → Cluster → URL |
| `QDRANT_API_KEY` | cloud.qdrant.io → Cluster → API Keys |
| `GITHUB_TOKEN` | github.com/settings/tokens → New token → read:public_repo |

---

## 4. Project Structure

```
repoiq/
├── app/
│   ├── layout.tsx                    # Root layout, fonts, theme
│   ├── page.tsx                      # Home — URL input screen
│   ├── globals.css                   # Tailwind base + CSS variables
│   ├── chat/
│   │   └── [repoId]/
│   │       └── page.tsx              # Chat screen
│   └── api/
│       ├── ingest/
│       │   └── route.ts              # POST — clone + embed repo
│       ├── chat/
│       │   └── route.ts              # POST — RAG + stream response
│       └── repo/
│           └── [repoId]/
│               └── route.ts          # GET/DELETE — repo info
│
├── components/
│   ├── RepoInput.tsx                 # URL input form
│   ├── ProcessingScreen.tsx          # Ingestion progress screen
│   ├── ChatWindow.tsx                # Full chat interface
│   ├── MessageBubble.tsx             # Individual message component
│   ├── SourceCitation.tsx            # File reference pill
│   ├── SuggestedQuestions.tsx        # Starter question chips
│   └── ThemeToggle.tsx               # Light/dark/system toggle
│
├── lib/
│   ├── github.ts                     # GitHub API helpers
│   ├── chunker.ts                    # Code splitting logic
│   ├── embedder.ts                   # Google embedding client
│   ├── qdrant.ts                     # Qdrant Cloud client
│   ├── rag.ts                        # Retrieval + prompt building
│   ├── prompts.ts                    # System prompt templates
│   └── constants.ts                  # Shared constants
│
├── types/
│   └── index.ts                      # Shared TypeScript types
│
└── public/
    └── logo.webp                     # RepoIQ logo
```

---

## 5. TypeScript Types

```typescript
// types/index.ts

export type ProcessingStep =
  | "fetching"
  | "filtering"
  | "chunking"
  | "embedding"
  | "complete"
  | "error";

export interface StepStatus {
  id: string;
  label: string;
  status: "waiting" | "processing" | "complete" | "error";
}

export interface SSEProgressEvent {
  step: ProcessingStep;
  message?: string;
  repo_id?: string;
  file_count?: number;
  chunk_count?: number;
  processed?: number;
  total?: number;
}

export interface ChatMessage {
  role: "user" | "bot";
  content: string;
  sources?: string[];
  timestamp?: Date;
}

export interface ChatSSEEvent {
  event: "message" | "sources" | "done" | "error" | "status";
  data: string;
}

export interface RepoChunk {
  content: string;
  filePath: string;
  language: string;
}

export interface QdrantPoint {
  id: number;
  vector: number[];
  payload: {
    content: string;
    filePath: string;
    language: string;
  };
}

export interface RepoInfo {
  repoId: string;
  chunkCount: number;
  status: "ready" | "not_found";
}
```

---

## 6. Constants

```typescript
// lib/constants.ts

export const ALLOWED_EXTENSIONS = new Set([
  ".py", ".ts", ".tsx", ".js", ".jsx",
  ".java", ".go", ".rs", ".cpp", ".c",
  ".h", ".hpp", ".md", ".json", ".yaml",
  ".yml", ".toml", ".sql", ".css", ".html",
  ".env.example", ".sh"
]);

export const SKIP_DIRS = new Set([
  "node_modules", ".git", "__pycache__",
  ".next", "dist", "build", ".venv",
  "venv", ".pytest_cache", "coverage",
  ".idea", ".vscode", "out", ".turbo"
]);

export const MAX_FILES = 500;
export const MAX_FILE_SIZE_BYTES = 100_000;    // 100KB
export const CHUNK_SIZE = 1000;
export const CHUNK_OVERLAP = 200;
export const EMBEDDING_BATCH_SIZE = 100;
export const GITHUB_FETCH_CONCURRENCY = 20;
export const QDRANT_VECTOR_SIZE = 768;
export const RAG_TOP_K = 5;
export const QDRANT_UPSERT_BATCH_SIZE = 100;
```

---

## 7. Library Modules

### 7.1 `lib/github.ts`

```
Responsibilities:
  - Parse and validate GitHub URLs
  - Fetch repository file tree via GitHub API
  - Fetch individual file contents (base64 decoded)
  - Filter files by extension and size
  - Respect rate limits with GITHUB_TOKEN

Key Functions:

  parseGithubUrl(url: string)
    → Returns { owner, repo } or throws on invalid URL
    → Strips https://github.com/ prefix
    → Validates owner/repo format

  getRepoTree(owner: string, repo: string)
    → GET https://api.github.com/repos/{owner}/{repo}/git/trees/HEAD?recursive=1
    → Returns GitTreeItem[] — flat list of all file paths
    → Throws if repo is private or not found

  filterValidFiles(tree: GitTreeItem[])
    → Filters by ALLOWED_EXTENSIONS
    → Skips paths containing SKIP_DIRS
    → Skips files over MAX_FILE_SIZE_BYTES
    → Returns max MAX_FILES items

  fetchFileContent(owner, repo, path, sha)
    → GET https://api.github.com/repos/{owner}/{repo}/contents/{path}
    → Decodes base64 content
    → Returns string | null (null on decode error)

  fetchFilesInParallel(owner, repo, files)
    → Fetches GITHUB_FETCH_CONCURRENCY files at a time
    → Returns { path, content }[]
    → Skips files that return null

Headers for all requests:
  Authorization: Bearer ${GITHUB_TOKEN}
  Accept: application/vnd.github.v3+json
  X-GitHub-Api-Version: 2022-11-28
```

---

### 7.2 `lib/chunker.ts`

```
Responsibilities:
  - Split code files into overlapping chunks
  - Use language-aware separators
  - Preserve file path and language metadata

Key Functions:

  detectLanguage(filePath: string)
    → Returns language string based on extension
    → Mapping:
      .py   → "python"
      .ts   → "typescript"
      .tsx  → "typescript"
      .js   → "javascript"
      .jsx  → "javascript"
      .go   → "go"
      .rs   → "rust"
      .md   → "markdown"
      .sql  → "sql"
      rest  → "text"

  getLanguageSeparators(language: string)
    → Returns string[] of split points
    → python:     ["\nclass ", "\ndef ", "\n\n", "\n"]
    → typescript: ["\nclass ", "\nfunction ", "\nconst ",
                   "\ninterface ", "\ntype ", "\n\n", "\n"]
    → markdown:   ["\n## ", "\n### ", "\n\n", "\n"]
    → default:    ["\n\n", "\n", " "]

  chunkText(text, separators, size, overlap)
    → Recursive character splitting
    → Returns string[]

  chunkFile(filePath: string, content: string)
    → Returns RepoChunk[]
    → Each chunk: { content, filePath, language }

  chunkFiles(files: { path, content }[])
    → Maps chunkFile over all files
    → Returns flat RepoChunk[]
```

---

### 7.3 `lib/embedder.ts`

```
Responsibilities:
  - Initialize Google Generative AI client
  - Embed arrays of text in batches
  - Embed single query strings

Key Functions:

  getEmbeddingModel()
    → Singleton GoogleGenerativeAI instance
    → model: "models/embedding-001"

  embedTexts(texts: string[])
    → Batches by EMBEDDING_BATCH_SIZE (100)
    → Returns number[][] — 768-dim vectors
    → Throws on API error

  embedQuery(query: string)
    → Single text embedding
    → Returns number[]

Error Handling:
  → Retry once on 429 rate limit
  → Throw on all other errors
  → Log batch progress to console
```

---

### 7.4 `lib/qdrant.ts`

```
Responsibilities:
  - Manage Qdrant Cloud connection
  - Create/delete collections per repo
  - Upsert embedding vectors with metadata
  - Semantic similarity search

Key Functions:

  getClient()
    → Singleton QdrantClient
    → url: QDRANT_URL
    → apiKey: QDRANT_API_KEY

  collectionExists(repoId: string)
    → Returns boolean
    → collection name: repo_{repoId}

  createCollection(repoId: string)
    → Creates if not exists
    → VectorParams: size=768, distance=Cosine

  upsertPoints(repoId, points: QdrantPoint[])
    → Batches by QDRANT_UPSERT_BATCH_SIZE
    → Each point: { id, vector, payload }

  searchSimilar(repoId, queryVector, topK)
    → Cosine similarity search
    → Returns hits with payload
    → Returns [] if collection not found

  deleteCollection(repoId: string)
    → Deletes repo_{repoId} collection
    → Silent fail if not found

  getCollectionInfo(repoId: string)
    → Returns { pointsCount } or null
```

---

### 7.5 `lib/rag.ts`

```
Responsibilities:
  - Orchestrate full RAG pipeline
  - Format context for LLM injection
  - Build final system prompt

Key Functions:

  retrieveChunks(repoId, query, topK=RAG_TOP_K)
    → embedQuery(query)
    → searchSimilar(repoId, vector, topK)
    → Returns { content, filePath }[]

  buildContext(chunks: RepoChunk[])
    → Formats as:
      "File: path/to/file.ts

       {content}

       ---"
    → Joins all chunks
    → Returns single context string

  buildSystemPrompt(context: string)
    → Injects context into SYSTEM_PROMPT
    → Returns complete prompt string
```

---

### 7.6 `lib/prompts.ts`

```typescript
export const SYSTEM_PROMPT = `
You are REPOIQ, an AI assistant specialized in analyzing
and explaining GitHub codebases. You answer questions
about code structure, logic, architecture, and
implementation details based strictly on the indexed
repository context provided to you.

<instructions>
1. Answer only questions about the indexed codebase.
2. Always reference the exact file path when citing code.
3. If the answer is not in the context, say:
   "I couldn't find that in the indexed codebase.
    Try rephrasing or ask about a specific file."
4. Keep answers concise — 3-5 sentences unless the
   user asks for detailed explanation.
5. Format code in markdown code blocks with language tag.
6. Never fabricate file paths or logic not in context.
7. If asked anything unrelated, respond:
   "I'm only able to answer questions about the
    indexed repository."
</instructions>

<output_format>
- Lead with a direct answer (1-2 sentences)
- Support with specific file path references
- End with a code snippet if relevant
- Do NOT output a raw sources section — the UI handles this
</output_format>

<retrieved_context>
{context}
</retrieved_context>
`;
```

---

## 8. API Routes

### 8.1 `POST /api/ingest`

```
Request Body:
  { github_url: string }

Response:
  ReadableStream — SSE text/event-stream

Route Config:
  export const maxDuration = 60
  export const dynamic = "force-dynamic"

Flow:
  1. Validate + parse GitHub URL
  2. Stream: { step: "fetching" }
  3. getRepoTree(owner, repo)
  4. filterValidFiles(tree)
  5. Stream: { step: "filtering", message: "N files found" }
  6. fetchFilesInParallel(owner, repo, files)
  7. Stream: { step: "chunking" }
  8. chunkFiles(files) → all chunks
  9. Stream: { step: "embedding" }
  10. embedTexts(chunk contents) → vectors
  11. createCollection(repoId)
  12. upsertPoints(repoId, points)
  13. Stream: { step: "complete", repo_id, file_count, chunk_count }

Error Handling:
  → Catch all errors
  → Stream: { step: "error", message: string }
  → Never throw unhandled

SSE Format:
  data: {"step":"fetching","message":"..."}\n\n
```

---

### 8.2 `POST /api/chat`

```
Request Body:
  {
    repo_id: string,
    message: string,
    history: { role: "user"|"assistant", content: string }[]
  }

Response:
  ReadableStream — SSE text/event-stream

Route Config:
  export const maxDuration = 30
  export const dynamic = "force-dynamic"

Flow:
  1. retrieveChunks(repo_id, message)
  2. buildContext(chunks)
  3. buildSystemPrompt(context)
  4. Extract unique file paths → sources
  5. Stream sources immediately:
     event: sources
     data: ["path1", "path2"]
  6. Initialize Gemini with system instruction
  7. Reconstruct chat history for Gemini format
  8. model.generateContentStream(message)
  9. Stream each token:
     event: message
     data: {token}
  10. Stream completion:
      event: done
      data: [DONE]

Error Handling:
  → Stream error event on failure
  → Handle Gemini safety filter blocks gracefully

SSE Format:
  event: sources\ndata: [...]\n\n
  event: message\ndata: token\n\n
  event: done\ndata: [DONE]\n\n
```

---

### 8.3 `GET /api/repo/[repoId]`

```
Response:
  {
    repoId: string,
    chunkCount: number,
    status: "ready" | "not_found"
  }

Flow:
  1. collectionExists(repoId)
  2. If not found → { status: "not_found" }
  3. getCollectionInfo(repoId)
  4. Return info
```

### 8.4 `DELETE /api/repo/[repoId]`

```
Response:
  { status: "deleted", repoId: string }

Flow:
  1. deleteCollection(repoId)
  2. Return confirmation
```

---

## 9. UI Pages

### 9.1 `app/page.tsx` — Home

```
State:
  isAnalyzing: boolean
  repoName: string
  progress: number
  steps: StepStatus[]
  error: string | null

Render:
  if !isAnalyzing → <RepoInput />
  if isAnalyzing  → <ProcessingScreen />
  if error        → error toast bottom center

On submit:
  1. Set isAnalyzing = true
  2. POST /api/ingest with github_url
  3. Parse SSE stream
  4. Update steps + progress per event
  5. On complete → router.push(/chat/{repo_id})
  6. On error → show error, reset state
```

---

### 9.2 `app/chat/[repoId]/page.tsx` — Chat

```
On mount:
  1. GET /api/repo/{repoId}
  2. If not_found → redirect to home
  3. Set repoInfo state

State:
  messages: ChatMessage[]
  input: string
  isLoading: boolean
  error: string | null
  repoInfo: RepoInfo | null

Layout:
  Full height flex column
  Header: repo name + file count + home button
  ChatWindow: flex-1, scrollable
  Input bar: pinned bottom

On send:
  1. Add user message
  2. POST /api/chat
  3. Parse SSE stream
  4. Stream tokens into bot message
  5. Apply sources on sources event
  6. Stop loading on done event
```

---

## 10. Component Specs

### `RepoInput.tsx`
```
Props: { onAnalyze: (url) => void, isAnalyzing: boolean }

Elements:
  Logo image (120x120, rounded-2xl)
  H1: "Chat with any Codebase"
       "Codebase" → amber
  Subtitle: muted, max-w-lg
  Form:
    GitHub icon + text input + Analyze button
    Ambient amber glow behind form
  Trust signals: 3 items below form

Centering fix:
  Parent page: min-h-screen flex items-center justify-center
  This component: NO min-h-screen on wrapper div
```

---

### `ProcessingScreen.tsx`
```
Props: { steps, progress, repoName }

Elements:
  "Analyzing Codebase" amber pill badge
  Repo name in Bebas Neue
  Step list: icon + label + status
  Progress bar: amber fill, animated width
  Percentage counter top right of bar
```

---

### `ChatWindow.tsx`
```
Props: { repoId: string }

SSE Parser — CORRECT implementation:
  Parse line by line
  Track currentEvent separately
  Never use indexOf for parsing

Elements:
  Messages area: flex-col, overflow-y-auto
  Auto scroll on new message
  Typing indicator when isLoading + empty bot message
  Suggested questions when messages.length === 1
  Input form at bottom
  Error banner above input
```

---

### `MessageBubble.tsx`
```
Props: { message: ChatMessage }

Bot bubble:
  Left aligned
  bg-card, border-border
  Amber sparkle icon left
  Renders markdown code blocks
  Source citations below

User bubble:
  Right aligned
  bg-amber-500, text-black
  User icon right
```

---

### `SourceCitation.tsx`
```
Props: { filePath: string, onClick?: () => void }

Pill button:
  FileCode icon (amber)
  File path text (truncated max-w-[200px])
  ExternalLink icon on hover
  Hover: border-amber-500/50
```

---

### `SuggestedQuestions.tsx`
```
Questions:
  "Explain the project structure"
  "How is authentication handled?"
  "What are the main API endpoints?"
  "Identify potential security risks"
  "Summarize the core logic"

Each: pill button, hover amber
onClick → calls onSelect(question)
Shows only when messages.length === 1
```

---

## 11. Design System

```css
/* CSS Variables — globals.css */

:root {
  /* Light theme */
  --background: #F7F4EF;
  --foreground: #0A0A0A;
  --card: #EDEAE3;
  --border: #D6D1C8;
  --muted: #8A8480;
  --accent: #C9960C;
}

.dark {
  /* Dark theme */
  --background: #0A0A0A;
  --foreground: #F0EDE6;
  --card: #111111;
  --border: #1E1E1E;
  --muted: #6B6866;
  --accent: #F5A623;
}
```

```
Typography:
  Display: Bebas Neue (Google Fonts)
  Body:    DM Sans (Google Fonts)

Radius:
  Cards:   rounded-2xl
  Buttons: rounded-xl
  Pills:   rounded-lg

Spacing:
  Page padding: px-6 md:px-12
  Section gap:  gap-8
```

---

## 12. Error Handling Strategy

```
Level 1 — GitHub API:
  404 → "Repository not found or is private"
  403 → "Rate limit hit. Try again in an hour"
  422 → "Repository is too large to index"

Level 2 — Embedding:
  429 → Retry once after 1s, then fail
  500 → "Embedding service unavailable"

Level 3 — Qdrant:
  Connection → "Vector database unavailable"
  Not found  → Redirect to home

Level 4 — Gemini:
  Safety block → "Response blocked by safety filters"
  500          → "AI service unavailable. Try again."

All errors:
  → Stream as SSE error event during ingest
  → Return as error SSE event during chat
  → Display user-friendly message in UI
  → Log technical details to console only
```

---

## 13. Performance Considerations

```
GitHub API:
  Fetch files in parallel batches of 20
  Not all at once — avoids rate limits

Embeddings:
  Batch 100 texts per API call
  Not one by one — 100x faster

Qdrant upsert:
  Batch 100 points per upsert
  Not one by one

Vercel:
  maxDuration: 60s for ingest
  maxDuration: 30s for chat
  dynamic: "force-dynamic" on all routes

Large repos:
  Hard cap at 500 files
  Hard cap at 100KB per file
  Keeps processing under timeout
```

---

## 14. Deployment

### Vercel Setup
```
1. Push to GitHub
2. Import repo on vercel.com
3. Add environment variables (all 4)
4. Deploy

Build command:  next build (default)
Output:         .next (default)
Node version:   18.x or higher
```

### Qdrant Cloud Setup
```
1. cloud.qdrant.io → Create account
2. Create cluster → Free tier (1GB)
3. Copy cluster URL → QDRANT_URL
4. API Keys → Create key → QDRANT_API_KEY
5. Collections are created automatically per repo
```

---

## 15. README Structure (for GitHub)

```markdown
# RepoIQ

Chat with any GitHub codebase using AI.

## What It Does
## Tech Stack
## Getting Started
  ### Prerequisites
  ### Environment Setup
  ### Run Locally
## How It Works
## Deployment
## License
```

---

## 16. Build Order

```
Phase 1 — Foundation (Day 1)
  ✅ lib/constants.ts
  ✅ types/index.ts
  ✅ lib/github.ts
  ✅ lib/chunker.ts

Phase 2 — AI Pipeline (Day 2)
  ✅ lib/embedder.ts
  ✅ lib/qdrant.ts
  ✅ lib/rag.ts
  ✅ lib/prompts.ts

Phase 3 — API Routes (Day 3)
  ✅ app/api/ingest/route.ts
  ✅ app/api/chat/route.ts
  ✅ app/api/repo/[repoId]/route.ts

Phase 4 — Frontend (Day 4)
  ✅ app/page.tsx
  ✅ app/chat/[repoId]/page.tsx
  ✅ All components wired to new API routes

Phase 5 — Polish + Deploy (Day 5)
  ✅ Error handling review
  ✅ Mobile responsive check
  ✅ README written
  ✅ Deploy to Vercel
  ✅ Test with 5 real repos
```
