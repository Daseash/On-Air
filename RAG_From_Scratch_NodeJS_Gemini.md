# Building RAG From Scratch — Node.js + Express + Gemini
### For your Airbnb Clone Project

> Based on the concepts taught in Krish Naik's *"Complete RAG Crash Course With LangChain"* (data injection pipeline → chunking → embeddings → vector store → retriever → augmentation → generation), re-implemented in **pure Node.js / Express** using **Google Gemini** instead of Python/LangChain/Groq.

---

## 0. What RAG Actually Is (from the video, in short)

A plain LLM has two problems:
1. **Hallucination** — it only knows data up to its training cutoff, so it makes things up for anything newer or private.
2. **No access to your private data** — your Airbnb clone's listings, bookings, policies, FAQs are not in Gemini's training data, and fine-tuning a model every time your data changes is expensive and impractical.

**RAG (Retrieval-Augmented Generation)** solves this without touching the model's weights, by building **two pipelines**:

| Pipeline | Purpose |
|---|---|
| **Data Injection / Ingestion Pipeline** | Data → Parse → Chunk → Embed → Store in Vector DB |
| **Retrieval Pipeline (Augmentation + Generation)** | User query → Embed query → Similarity search in Vector DB → Get context → Build prompt (context + query) → Send to LLM → Answer |

For your Airbnb clone, this means: instead of Gemini guessing about your listings, house rules, cancellation policy, or amenities, it will **only answer using real data you feed it** — massively reducing hallucination and giving accurate, grounded answers (e.g., "Is breakfast included in listing #23?", "What's the cancellation policy for stays in Goa?", "Show me pet-friendly listings under ₹3000/night").

---

## 1. Decide What Your RAG Will Answer (please tell me this so I can tailor Task 4 & 8)

Before wiring this into your real project, I need to know:
1. **What data source?** — MongoDB/Postgres listings collection, static JSON, markdown docs (FAQ/policies), or a mix?
2. **What should users ask?** — "Find me a listing like X", "What's your refund policy", or both?
3. **Where should the RAG live?** — a `/api/chat` endpoint, a support chatbot widget, a smart search bar?

Everything below works standalone — plug in your real data source in Task 4 once you tell me the shape of it (e.g. your Mongoose `Listing` schema).

---

## Architecture Overview

```
airbnb-clone-backend/
├── rag/
│   ├── config.js                 # API keys, model names, chunk size
│   ├── loaders/
│   │   ├── jsonLoader.js         # loads listings/FAQ JSON
│   │   ├── dbLoader.js           # loads from MongoDB/Postgres
│   │   └── textLoader.js         # loads .txt/.md policy docs
│   ├── chunker.js                # recursive text splitter
│   ├── embeddingManager.js       # Gemini embeddings wrapper
│   ├── vectorStore.js            # from-scratch cosine-similarity vector DB
│   ├── ragRetriever.js           # query -> top-k relevant chunks
│   ├── ragSearch.js              # retriever + prompt + Gemini LLM = final answer
│   ├── ingest.js                 # one-time/CLI script: build the vector store
│   └── data/
│       ├── vector_store.json     # persisted vectors (auto-generated)
│       └── raw/                  # your source documents
├── routes/
│   └── rag.routes.js             # Express endpoints
├── server.js
└── .env
```

This directly mirrors the video's modular structure (`embedding_pipeline.py`, `vector_store.py`, `search/search.py`) — just translated to Node.js, and using **Gemini** for both embeddings and generation instead of SentenceTransformers/FAISS/Groq.

---

## Task 1 — Project Setup

```bash
mkdir -p rag/loaders rag/data/raw
npm init -y
npm install express dotenv @google/generative-ai uuid
npm install -D nodemon
```

`.env`
```
GEMINI_API_KEY=your_gemini_api_key_here
PORT=5000
```

`rag/config.js`
```js
require('dotenv').config();

module.exports = {
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  EMBEDDING_MODEL: 'text-embedding-004',   // Gemini embedding model
  GENERATION_MODEL: 'gemini-2.0-flash',    // fast + cheap, good for RAG answers
  CHUNK_SIZE: 500,        // characters per chunk
  CHUNK_OVERLAP: 50,      // overlap between chunks (context continuity)
  TOP_K: 4,                // how many chunks to retrieve per query
  SCORE_THRESHOLD: 0.55,  // min cosine similarity to accept a chunk
  VECTOR_STORE_PATH: __dirname + '/data/vector_store.json'
};
```

> Get your key from https://aistudio.google.com/apikey — free tier is enough to build and test this.

---

## Task 2 — Data Loaders (the "Data Parsing" step)

Just like the video showed `TextLoader`, `DirectoryLoader`, `PyPDFLoader` all converting different formats into a common `Document { pageContent, metadata }` shape — we do the same in JS.

`rag/loaders/jsonLoader.js` (for listings data)
```js
const fs = require('fs');

/**
 * Converts an array of listing objects into RAG "documents".
 * Each listing becomes one natural-language paragraph + metadata.
 */
function loadListingsFromJSON(filePath) {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const listings = JSON.parse(raw);

  return listings.map((listing) => ({
    pageContent: `Listing: ${listing.title}. Location: ${listing.city}, ${listing.country}. ` +
      `Price: ₹${listing.pricePerNight}/night. Type: ${listing.propertyType}. ` +
      `Guests: ${listing.maxGuests}. Amenities: ${(listing.amenities || []).join(', ')}. ` +
      `Description: ${listing.description}`,
    metadata: {
      source: 'listings.json',
      listingId: listing._id || listing.id,
      city: listing.city,
      price: listing.pricePerNight
    }
  }));
}

module.exports = { loadListingsFromJSON };
```

`rag/loaders/dbLoader.js` (for MongoDB — Mongoose example, swap model as needed)
```js
/**
 * Pulls listings directly from your live MongoDB collection.
 * Pass in your Mongoose model so this stays decoupled from your schema.
 */
async function loadListingsFromDB(ListingModel) {
  const listings = await ListingModel.find({}).lean();

  return listings.map((listing) => ({
    pageContent: `Listing: ${listing.title}. Location: ${listing.city}, ${listing.country}. ` +
      `Price: ₹${listing.pricePerNight}/night. Type: ${listing.propertyType}. ` +
      `Guests: ${listing.maxGuests}. Amenities: ${(listing.amenities || []).join(', ')}. ` +
      `Description: ${listing.description}`,
    metadata: {
      source: 'mongodb',
      listingId: String(listing._id),
      city: listing.city
    }
  }));
}

module.exports = { loadListingsFromDB };
```

`rag/loaders/textLoader.js` (for FAQ/policy `.md` or `.txt` files)
```js
const fs = require('fs');
const path = require('path');

function loadTextFiles(dirPath) {
  const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.txt') || f.endsWith('.md'));

  return files.map((file) => {
    const fullPath = path.join(dirPath, file);
    return {
      pageContent: fs.readFileSync(fullPath, 'utf-8'),
      metadata: { source: file }
    };
  });
}

module.exports = { loadTextFiles };
```

---

## Task 3 — Chunking

The video stressed: **"if you crack chunking, RAG becomes easy."** We replicate `RecursiveCharacterTextSplitter` — split on paragraphs first, then sentences, then words, only if needed, with overlap so context isn't cut mid-thought.

`rag/chunker.js`
```js
const { CHUNK_SIZE, CHUNK_OVERLAP } = require('./config');

/**
 * Recursively splits text on the largest separator that keeps chunks
 * under CHUNK_SIZE. Falls back to smaller separators when needed.
 */
function splitText(text, chunkSize = CHUNK_SIZE, overlap = CHUNK_OVERLAP) {
  const separators = ['\n\n', '\n', '. ', ' ', ''];
  return recursiveSplit(text, separators, chunkSize, overlap);
}

function recursiveSplit(text, separators, chunkSize, overlap) {
  if (text.length <= chunkSize) return [text];

  const [sep, ...rest] = separators;
  const parts = sep ? text.split(sep) : text.split('');

  const chunks = [];
  let current = '';

  for (const part of parts) {
    const candidate = current ? current + sep + part : part;
    if (candidate.length > chunkSize) {
      if (current) chunks.push(current);
      // part itself might still be too big -> recurse with smaller separators
      if (part.length > chunkSize && rest.length) {
        chunks.push(...recursiveSplit(part, rest, chunkSize, overlap));
        current = '';
      } else {
        current = part;
      }
    } else {
      current = candidate;
    }
  }
  if (current) chunks.push(current);

  // add overlap between consecutive chunks
  return addOverlap(chunks, overlap);
}

function addOverlap(chunks, overlap) {
  if (overlap <= 0) return chunks;
  return chunks.map((chunk, i) => {
    if (i === 0) return chunk;
    const prevTail = chunks[i - 1].slice(-overlap);
    return prevTail + chunk;
  });
}

/**
 * Turns raw "documents" (from loaders) into chunked documents,
 * preserving metadata + adding a chunk index.
 */
function chunkDocuments(documents, chunkSize, overlap) {
  const chunked = [];
  for (const doc of documents) {
    const pieces = splitText(doc.pageContent, chunkSize, overlap);
    pieces.forEach((piece, idx) => {
      chunked.push({
        pageContent: piece,
        metadata: { ...doc.metadata, chunkIndex: idx }
      });
    });
  }
  return chunked;
}

module.exports = { splitText, chunkDocuments };
```

---

## Task 4 — Embeddings (Gemini)

This replaces the video's SentenceTransformer/`all-MiniLM-L6-v2` with **Gemini's `text-embedding-004`** — same concept: text → vector of numbers so we can do similarity search.

`rag/embeddingManager.js`
```js
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { GEMINI_API_KEY, EMBEDDING_MODEL } = require('./config');

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

class EmbeddingManager {
  constructor(modelName = EMBEDDING_MODEL) {
    this.model = genAI.getGenerativeModel({ model: modelName });
  }

  /** Embed a single string -> number[] */
  async embedText(text) {
    const result = await this.model.embedContent(text);
    return result.embedding.values;
  }

  /** Embed many strings, batched to avoid rate limits */
  async embedBatch(texts, batchSize = 20) {
    const embeddings = [];
    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      const results = await Promise.all(batch.map((t) => this.embedText(t)));
      embeddings.push(...results);
      console.log(`Embedded ${Math.min(i + batchSize, texts.length)}/${texts.length}`);
    }
    return embeddings;
  }
}

module.exports = { EmbeddingManager };
```

---

## Task 5 — Vector Store (From Scratch — no external vector DB needed)

The video used FAISS with a persistent `.index` + `.pickle` metadata file. Here's the **from-scratch JS equivalent**: a JSON-backed store with cosine similarity search. (You can later swap this for Pinecone/Chroma/pgvector without touching the rest of the pipeline — same interface.)

`rag/vectorStore.js`
```js
const fs = require('fs');
const { v4: uuid } = require('uuid');
const { VECTOR_STORE_PATH } = require('./config');

function cosineSimilarity(a, b) {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

class VectorStore {
  constructor(storePath = VECTOR_STORE_PATH) {
    this.storePath = storePath;
    this.records = []; // { id, embedding, pageContent, metadata }
  }

  /** Add chunks + their pre-computed embeddings */
  addDocuments(chunks, embeddings) {
    chunks.forEach((chunk, i) => {
      this.records.push({
        id: uuid(),
        embedding: embeddings[i],
        pageContent: chunk.pageContent,
        metadata: chunk.metadata
      });
    });
  }

  /** Persist to disk so we don't re-embed every server restart */
  save() {
    fs.writeFileSync(this.storePath, JSON.stringify(this.records));
    console.log(`Saved ${this.records.length} records to ${this.storePath}`);
  }

  load() {
    if (!fs.existsSync(this.storePath)) {
      throw new Error('No vector store found — run ingest.js first.');
    }
    this.records = JSON.parse(fs.readFileSync(this.storePath, 'utf-8'));
    console.log(`Loaded ${this.records.length} records from ${this.storePath}`);
  }

  exists() {
    return fs.existsSync(this.storePath);
  }

  get size() {
    return this.records.length;
  }

  /** Core similarity search */
  search(queryEmbedding, topK = 4, scoreThreshold = 0) {
    const scored = this.records.map((r) => ({
      ...r,
      score: cosineSimilarity(queryEmbedding, r.embedding)
    }));

    return scored
      .filter((r) => r.score >= scoreThreshold)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }
}

module.exports = { VectorStore };
```

---

## Task 6 — The Ingestion Script (build the vector store once)

This is the CLI script you run whenever your data changes — exactly like the video's "build from documents" step.

`rag/ingest.js`
```js
const { chunkDocuments } = require('./chunker');
const { EmbeddingManager } = require('./embeddingManager');
const { VectorStore } = require('./vectorStore');
const { loadListingsFromJSON } = require('./loaders/jsonLoader');
const { loadTextFiles } = require('./loaders/textLoader');
const path = require('path');

async function ingest() {
  console.log('Step 1/4: Loading raw documents...');
  const listingDocs = loadListingsFromJSON(path.join(__dirname, 'data/raw/listings.json'));
  const policyDocs = loadTextFiles(path.join(__dirname, 'data/raw'));
  const allDocs = [...listingDocs, ...policyDocs];
  console.log(`Loaded ${allDocs.length} raw documents.`);

  console.log('Step 2/4: Chunking...');
  const chunks = chunkDocuments(allDocs);
  console.log(`Created ${chunks.length} chunks.`);

  console.log('Step 3/4: Generating embeddings (Gemini)...');
  const embeddingManager = new EmbeddingManager();
  const embeddings = await embeddingManager.embedBatch(chunks.map((c) => c.pageContent));

  console.log('Step 4/4: Saving to vector store...');
  const vectorStore = new VectorStore();
  vectorStore.addDocuments(chunks, embeddings);
  vectorStore.save();

  console.log('✅ Ingestion complete.');
}

ingest().catch((err) => {
  console.error('❌ Ingestion failed:', err);
  process.exit(1);
});
```

Run it:
```bash
node rag/ingest.js
```

Put a sample `rag/data/raw/listings.json` and `rag/data/raw/policies.md` in place first — I can generate these for you once I know your real schema/policies.

---

## Task 7 — Retriever (query → relevant chunks)

`rag/ragRetriever.js`
```js
const { TOP_K, SCORE_THRESHOLD } = require('./config');

class RAGRetriever {
  constructor(vectorStore, embeddingManager) {
    this.vectorStore = vectorStore;
    this.embeddingManager = embeddingManager;
  }

  async retrieve(query, topK = TOP_K, scoreThreshold = SCORE_THRESHOLD) {
    const queryEmbedding = await this.embeddingManager.embedText(query);
    const results = this.vectorStore.search(queryEmbedding, topK, scoreThreshold);

    return results.map((r) => ({
      content: r.pageContent,
      metadata: r.metadata,
      score: r.score
    }));
  }
}

module.exports = { RAGRetriever };
```

---

## Task 8 — RAG Search (Augmentation + Generation with Gemini)

This is where "context + query → prompt → LLM → answer" happens — the final step from the video.

`rag/ragSearch.js`
```js
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { GEMINI_API_KEY, GENERATION_MODEL } = require('./config');

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

class RAGSearch {
  constructor(retriever) {
    this.retriever = retriever;
    this.model = genAI.getGenerativeModel({ model: GENERATION_MODEL });
  }

  buildPrompt(query, contextChunks) {
    const context = contextChunks
      .map((c, i) => `[${i + 1}] ${c.content}`)
      .join('\n\n');

    return `You are a helpful assistant for an Airbnb-style booking platform.
Answer the user's question using ONLY the context below. If the answer isn't
in the context, say you don't have that information — do not make anything up.

Context:
${context}

Question: ${query}

Answer clearly and concisely, mentioning specific listings/details when relevant.`;
  }

  async search(query) {
    const contextChunks = await this.retriever.retrieve(query);

    if (contextChunks.length === 0) {
      return {
        answer: "I couldn't find anything relevant in our listings/policies for that. Could you rephrase or ask something else?",
        sources: []
      };
    }

    const prompt = this.buildPrompt(query, contextChunks);
    const result = await this.model.generateContent(prompt);

    return {
      answer: result.response.text(),
      sources: contextChunks.map((c) => c.metadata)
    };
  }
}

module.exports = { RAGSearch };
```

---

## Task 9 — Express Integration

`routes/rag.routes.js`
```js
const express = require('express');
const router = express.Router();

const { VectorStore } = require('../rag/vectorStore');
const { EmbeddingManager } = require('../rag/embeddingManager');
const { RAGRetriever } = require('../rag/ragRetriever');
const { RAGSearch } = require('../rag/ragSearch');

// Initialize once at server startup, reuse across requests
const vectorStore = new VectorStore();
vectorStore.load(); // requires ingest.js to have run at least once

const embeddingManager = new EmbeddingManager();
const retriever = new RAGRetriever(vectorStore, embeddingManager);
const ragSearch = new RAGSearch(retriever);

router.post('/chat', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query || !query.trim()) {
      return res.status(400).json({ error: 'query is required' });
    }

    const result = await ragSearch.search(query);
    res.json(result);
  } catch (err) {
    console.error('RAG chat error:', err);
    res.status(500).json({ error: 'Something went wrong processing your question.' });
  }
});

module.exports = router;
```

`server.js` (wire it in)
```js
const express = require('express');
const cors = require('cors');
const ragRoutes = require('./routes/rag.routes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/rag', ragRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

Test it:
```bash
curl -X POST http://localhost:5000/api/rag/chat \
  -H "Content-Type: application/json" \
  -d '{"query": "Do you have any pet-friendly listings under 3000 rupees a night?"}'
```

---

## Task 10 — Keeping the Vector Store Fresh

Your listings change constantly (new hosts, price updates, delisted properties) — unlike a static PDF knowledge base, this needs a refresh strategy:

1. **Simplest:** re-run `node rag/ingest.js` on a schedule (cron job) or after any listing create/update/delete.
2. **Better:** call `vectorStore.addDocuments()` incrementally right inside your existing `POST /listings` / `PUT /listings/:id` controllers, so new listings are embedded the moment they're created — no full re-ingestion needed.
3. **Delete handling:** when a listing is deleted, filter it out of `vectorStore.records` by `metadata.listingId` and re-save.

---

## Task 11 — Testing Checklist

- [ ] `node rag/ingest.js` runs without errors and creates `rag/data/vector_store.json`
- [ ] Ask a question that IS covered by your data → get a grounded, specific answer with sources
- [ ] Ask something NOT in your data (e.g. "what's the weather in Paris") → it should say it doesn't know, not hallucinate
- [ ] Check `sources` in the response map back to real `listingId`s
- [ ] Load-test with concurrent requests — Gemini free tier has rate limits, so consider a small queue if traffic is high

---

## Roadmap Beyond This (once basic RAG works)

- **Hybrid search** — combine keyword search (e.g. MongoDB text index) with vector similarity for better recall
- **Re-ranking** — use a second pass to re-score top-k chunks before sending to the LLM
- **Streaming responses** — use Gemini's `generateContentStream` so answers appear token-by-token in your chat UI
- **Conversation memory** — pass last N turns into the prompt for follow-up questions
- **Agentic RAG** — let Gemini decide whether to query listings, bookings, or policies depending on intent (function calling)

---

## What I Need From You To Wire This Into Your Real Project

1. Your **Listing schema** (Mongoose/Prisma model or sample document) so Task 2's loader matches your real fields.
2. Any **policy/FAQ text** you want searchable (cancellation policy, host guidelines, etc.).
3. Confirmation of **where in your Express app** this should live (new route file is assumed above).

Send those over and I'll adapt Tasks 2, 4, and 9 to your actual codebase and give you the final wired-in files.
