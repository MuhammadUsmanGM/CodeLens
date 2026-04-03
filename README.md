<div align="center">

<img src="./public/logo.webp" alt="CodeLens Logo" width="180" height="180" style="border-radius: 40px; margin-bottom: 30px; box-shadow: 0 20px 50px rgba(0,0,0,0.3);" />

# CODELENS
### The Neural Bridge Between Developer & Codebase

[![NPM Version](https://img.shields.io/npm/v/%40muhammadusmangm%2Fcodelens?style=for-the-badge&color=CB3837&logo=npm)]()
[![Intelligence](https://img.shields.io/badge/Intelligence-Gemini_Flash--Lite-white?style=for-the-badge&logo=googlegemini&logoColor=8E75B2)]()
[![Performance](https://img.shields.io/badge/Performance-Vector_Accelerated-black?style=for-the-badge&logo=qdrant&logoColor=FF4B4B)]()
[![Status](https://img.shields.io/badge/Status-Operational-00FF00?style=for-the-badge)]()

**CodeLens is not just a tool; it is a cognitive layer for software engineering.** By synthesizing vast amounts of repository data into a neural index, it enables developers to transcend traditional keyword search and engage in meaningful, semantic dialogue with their own creation.

</div>

---

## 🚀 Deployment

CodeLens is distributed as a global CLI tool, allowing you to launch your private architectural autopilot anywhere.

### Option 1: Zero-Installation (Recommended)
Launch CodeLens instantaneously using `npx`:
```bash
npx @muhammadusmangm/codelens
```

### Option 2: Global Installation
For high-frequency use, install the binary globally:
```bash
npm install -g @muhammadusmangm/codelens
```
Then simply execute:
```bash
codelens
```

> On first launch, a setup wizard will prompt for your API keys. You can also configure everything later via the Settings icon in the UI.

---

## 🛰 The Vision

In an era of exponentially growing complexity, the bottleneck for innovation is no longer *writing* code, but *comprehending* it. CodeLens was engineered to dissolve this barrier. It serves as an **Architecture Autopilot**, providing a high-fidelity mental map of even the most dense repositories.

### 🧠 The Intelligence Core
CodeLens operates on a sophisticated **Neural RAG (Retrieval-Augmented Generation)** pipeline. Unlike standard LLMs that "hallucinate" based on general knowledge, CodeLens grounds every response in the objective truth of your specific codebase.

- **Semantic Synthesis**: Understands the *intent* behind the logic, not just the syntax.
- **Contextual Anchoring**: Every insight is linked directly to the relevant source file, ensuring transparency and trust.
- **Vectorized Memory**: Utilizes high-dimensional vector spaces to find relationships between disparate modules that traditional search would miss.

---

## 🏗 How It Works

```mermaid
flowchart TB
    subgraph INGEST["📥 Ingestion Pipeline"]
        A[Repository URL] --> B[Platform Detection<br/>GitHub · GitLab · Bitbucket]
        B --> C[Download & Extract ZIP]
        C --> D[Filter Files<br/>50+ extensions · skip dirs · 1MB limit]
        D --> E[AST-Aware Chunking<br/>Functions · Classes · Modules]
        E --> F[Generate Embeddings<br/>Google API or Local Xenova]
        F --> G[(Qdrant Vector DB<br/>768-dim cosine similarity)]
    end

    subgraph CHAT["💬 Chat Pipeline"]
        H[User Question] --> I{Has Chat History?}
        I -- Yes --> J[Query Rewriting<br/>Resolve pronouns via context]
        I -- No --> K[Use Original Query]
        J --> K
        K --> L{Repo Size?}
        L -- "< 80K tokens" --> M[Full Context Mode<br/>Send entire codebase]
        L -- "> 80K tokens" --> N[RAG Mode<br/>Vector search + LLM re-ranking]
        M --> O[Build System Prompt<br/>+ File Tree + Code Context]
        N --> O
        O --> P[Gemini Streaming Response]
        P --> Q[SSE Stream to Client<br/>Sources + Message + Done]
    end

    subgraph INCREMENTAL["🔄 Incremental Indexing"]
        R[Re-ingest Request] --> S[Compare File Hashes<br/>SHA-256 per file]
        S --> T{Changes Detected?}
        T -- Yes --> U[Re-embed only<br/>changed/new files]
        T -- No --> V[Skip — index is current]
        U --> G
    end

    G --> N
    G --> M

    style INGEST fill:#1a1a2e,stroke:#f5a623,color:#fff
    style CHAT fill:#1a1a2e,stroke:#00d4ff,color:#fff
    style INCREMENTAL fill:#1a1a2e,stroke:#00ff88,color:#fff
```

---

## 💎 Capabilities

### ⚡ Architectural Discovery
Instantaneously map out the structural integrity and logic flow of a repository. From onboarding new developers to auditing complex legacy systems, CodeLens provides the high-level perspective required for strategic decision-making.

### 🛡 Neural Security
Engineered with a "Security-First" ethos. CodeLens operates with read-only permissions, ensuring your codebase's integrity is never compromised while providing deep analytical insights.

### 🔍 Conversational Logic
Query your codebase like you would a senior architect.
- *"Where is the primary state management handled for user authentication?"*
- *"Explain the data flow between the ingestion worker and the vector database."*
- *"Identify potential bottlenecks in our middleware implementation."*

### 🌐 Multi-Platform Support
Analyze repositories from **GitHub**, **GitLab**, and **Bitbucket** — including specific branches and tags. Private repos are supported via configurable access tokens.

### 🔄 Incremental Indexing
Re-indexing a repository only processes changed and new files using SHA-256 hash tracking. No redundant embedding costs on unchanged code.

### 🧩 Dual Embedding Providers
Choose between **Google API** (fast, cloud-based) or **Local Xenova** (offline, no rate limits) — switch anytime via Settings.

---

## ⚙️ The Ecosystem

| Pillar | Technology | Role |
| :--- | :--- | :--- |
| **Cognition** | Gemini Next-Gen | The reasoning engine providing lightspeed architectural inference. |
| **Memory** | Qdrant Vector DB | High-performance neural retrieval for sub-millisecond context delivery. |
| **Embeddings** | Google / Xenova | Dual-provider embedding — cloud speed or offline privacy. |
| **Interface** | Next.js & Framer | A premium, glassmorphic UI designed for high-focus engineering. |
| **Connectivity** | GitHub · GitLab · Bitbucket | Multi-platform repo access with branch/tag support. |
| **Chunking** | AST-Aware Engine | Language-aware structural chunking for 40+ programming languages. |

---

## 🔧 Configuration

All settings are stored locally in `~/.codelens/.env` and can be managed via the Settings UI.

| Key | Required | Description |
| :--- | :---: | :--- |
| `GOOGLE_API_KEY` | Yes | Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey) |
| `QDRANT_URL` | Yes | Qdrant cluster URL from [Qdrant Cloud](https://cloud.qdrant.io/) |
| `QDRANT_API_KEY` | Yes | Qdrant API key from your cluster dashboard |
| `GITHUB_TOKEN` | No | For private GitHub repos & higher rate limits |
| `GITLAB_TOKEN` | No | For accessing GitLab repositories |
| `BITBUCKET_USERNAME` | No | Bitbucket username for authentication |
| `BITBUCKET_APP_PASSWORD` | No | Bitbucket app password for authentication |
| `HF_TOKEN` | No | Hugging Face token for gated local models |
| `GEMINI_MODEL` | No | Model override (default: `gemini-2.5-flash-lite`) |
| `EMBEDDING_PROVIDER` | No | `google` (default) or `local` |

---

## 📊 Technical Specs

| Parameter | Value |
| :--- | :--- |
| Max files per repo | 3,000 |
| Max file size | 1 MB |
| Chunk size | 1,000 chars (200 overlap) |
| Vector dimensions | 768 (cosine similarity) |
| Full context threshold | < 80,000 tokens |
| RAG top-K results | 15 (from 30 candidates, re-ranked) |
| Supported languages | 40+ (JS/TS, Python, Java, Go, Rust, Ruby, PHP, Swift, Dart, SQL, and more) |
| Rate limits | Ingest: 5/min · Chat: 30/min · Repo: 60/min |

---

## 🌐 The Ethos

**Privacy Focused.** **Performance Driven.** **Developer Centric.**

CodeLens is designed for the modern engineer who demands both depth and speed. It is a commitment to reducing cognitive load and empowering developers to focus on what truly matters: **Creation.**

---

<div align="center">

### Orchestrated by Muhammad Usman
[Explore the Intelligence](https://github.com/MuhammadUsmanGM) · [Connect on LinkedIn](https://www.linkedin.com/in/muhammad-usman-ai-dev)

</div>
