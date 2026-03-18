// lib/embedder.ts
// Uses Google's free text-embedding-004 model via Gemini API

import { getGoogleApiKey } from "./env";
import { EMBEDDING_BATCH_SIZE } from "./constants";

const GOOGLE_EMBED_URL = "https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:batchEmbedContents";

/**
 * Embed texts in batches using Google's text-embedding-004 (free tier).
 * Max 100 texts per batch, 768-dim output.
 */
export async function embedTexts(
  texts: string[],
  onProgress?: (current: number, total: number) => void
): Promise<number[][]> {
  const apiKey = getGoogleApiKey();
  const embeddings: number[][] = [];

  for (let i = 0; i < texts.length; i += EMBEDDING_BATCH_SIZE) {
    const batch = texts.slice(i, i + EMBEDDING_BATCH_SIZE);

    const response = await fetch(`${GOOGLE_EMBED_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        requests: batch.map((text) => ({
          model: "models/text-embedding-004",
          content: { parts: [{ text }] },
          taskType: "RETRIEVAL_DOCUMENT",
        })),
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Embedding API error: ${response.status} — ${err}`);
    }

    const data = await response.json();
    for (const embedding of data.embeddings) {
      embeddings.push(embedding.values);
    }

    if (onProgress) {
      onProgress(Math.min(i + batch.length, texts.length), texts.length);
    }
  }

  return embeddings;
}

export async function embedQuery(query: string): Promise<number[]> {
  const apiKey = getGoogleApiKey();

  const response = await fetch(`${GOOGLE_EMBED_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      requests: [
        {
          model: "models/text-embedding-004",
          content: { parts: [{ text: query }] },
          taskType: "RETRIEVAL_QUERY",
        },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Embedding API error: ${response.status} — ${err}`);
  }

  const data = await response.json();
  return data.embeddings[0].values;
}
