// lib/qdrant.ts

import { QdrantClient } from "@qdrant/js-client-rest";
import { QdrantPoint } from "@/types";
import { QDRANT_VECTOR_SIZE, QDRANT_UPSERT_BATCH_SIZE } from "./constants";
import { getQdrantConfig } from "./env";

function sanitizeUtf8(str: string): string {
  // Removes lone surrogates that break JSON stringification
  return str.replace(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/g, '');
}

let client: QdrantClient | null = null;

export function getQdrantClient() {
  if (!client) {
    const { url, apiKey } = getQdrantConfig();
    client = new QdrantClient({ url, apiKey });
  }
  return client;
}

export function getCollectionName(repoId: string) {
  // Collection names must be alphanumeric/underscores/dashes
  const safeId = repoId.replace(/[^a-zA-Z0-9_-]/g, "_");
  return `repo_${safeId}`;
}

export async function collectionExists(repoId: string): Promise<boolean> {
  const collectionName = getCollectionName(repoId);
  try {
    await getQdrantClient().getCollection(collectionName);
    return true;
  } catch (error) {
    return false;
  }
}

export async function createCollection(repoId: string) {
  const collectionName = getCollectionName(repoId);
  const client = getQdrantClient();

  try {
    const info = await client.getCollection(collectionName);
    const vectorsConfig = info.config.params.vectors;

    // Handle both single vector and multiple vector configurations
    const existingSize = (vectorsConfig as any).size || (Object.values(vectorsConfig as any)[0] as any).size;

    // Always delete and recreate to ensure fresh data (avoids stale/duplicate chunks on re-ingest)
    await client.deleteCollection(collectionName);
    await new Promise(r => setTimeout(r, 1000));
  } catch (error) {
    // Collection doesn't exist yet — will create below
  }

  await client.createCollection(collectionName, {
    vectors: {
      size: QDRANT_VECTOR_SIZE,
      distance: "Cosine",
    },
  });
}

export async function upsertPoints(repoId: string, points: QdrantPoint[], onProgress?: (current: number, total: number) => void) {
  const collectionName = getCollectionName(repoId);
  
  for (let i = 0; i < points.length; i += QDRANT_UPSERT_BATCH_SIZE) {
    const batch = points.slice(i, i + QDRANT_UPSERT_BATCH_SIZE);
    
    // Clean data check
    batch.forEach(p => {
      if (p.vector.some(v => isNaN(v) || !isFinite(v))) {
        throw new Error(`Neural anomaly detected in chunk ${p.id}: vector contains non-finite values`);
      }
    });

    try {
      // Sanitize payloads to prevent lone surrogate JSON errors
      const sanitizedBatch = batch.map(p => ({
        ...p,
        payload: {
          ...p.payload,
          content: p.payload?.content ? sanitizeUtf8(p.payload.content as string) : ""
        }
      }));

      await getQdrantClient().upsert(collectionName, {
        wait: true,
        points: sanitizedBatch,
      });
    } catch (error: any) {
      throw error;
    }
    
    if (onProgress) onProgress(Math.min(i + QDRANT_UPSERT_BATCH_SIZE, points.length), points.length);
  }
}

export async function searchSimilar(repoId: string, queryVector: number[], topK: number) {
  const collectionName = getCollectionName(repoId);
  try {
    const results = await getQdrantClient().search(collectionName, {
      vector: queryVector,
      limit: topK,
      with_payload: true,
    });
    return results;
  } catch (error) {
    return [];
  }
}

export async function deleteCollection(repoId: string) {
  const collectionName = getCollectionName(repoId);
  try {
    await getQdrantClient().deleteCollection(collectionName);
  } catch (error) {
    // Silent fail if not found
  }
}

export async function getCollectionInfo(repoId: string) {
  const collectionName = getCollectionName(repoId);
  try {
    const info = await getQdrantClient().getCollection(collectionName);
    return { pointsCount: info.points_count };
  } catch (error) {
    return null;
  }
}
