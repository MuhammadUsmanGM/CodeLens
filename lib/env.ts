// lib/env.ts
import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { homedir } from "os";
import { ConfigError } from "./errors";

/** Load ~/.codelens/.env into process.env.
 * Always re-reads from disk so tokens saved via the Settings UI
 * are picked up without requiring a server restart.
 */
export function loadCodeLensEnv() {
  const envPath = join(homedir(), ".codelens", ".env");
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf-8").split("\n")) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    // Always overwrite so updates via the Settings UI take effect immediately
    if (m) {
      process.env[m[1].trim()] = m[2].trim();
    }
  }
}

function getRequiredEnv(name: string): string {
  loadCodeLensEnv();
  const value = process.env[name];
  if (!value) {
    throw new ConfigError(
      `Missing required environment variable: ${name}. Run "codelens" to set up, or add it to ~/.codelens/.env`,
      "MISSING_ENV_VAR",
    );
  }
  return value;
}

export function getGoogleApiKey(): string {
  return getRequiredEnv("GOOGLE_API_KEY");
}

export function getQdrantConfig() {
  return {
    url: getRequiredEnv("QDRANT_URL"),
    apiKey: getRequiredEnv("QDRANT_API_KEY"),
  };
}

export function getGithubToken(): string | undefined {
  loadCodeLensEnv();
  return process.env.GITHUB_TOKEN || undefined;
}

export function getGeminiModel(): string {
  loadCodeLensEnv();
  return process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";
}

export function getHfToken(): string | undefined {
  loadCodeLensEnv();
  return process.env.HF_TOKEN || undefined;
}

export function getVectorStoreType(): "lancedb" | "qdrant" {
  loadCodeLensEnv();
  const explicit = process.env.VECTOR_STORE?.toLowerCase();
  if (explicit === "qdrant") return "qdrant";
  if (explicit === "lancedb") return "lancedb";
  // Backward compat: if Qdrant credentials exist and no explicit choice, default to qdrant
  if (process.env.QDRANT_URL && process.env.QDRANT_API_KEY) return "qdrant";
  return "lancedb";
}

export function getQdrantConfigOptional(): { url?: string; apiKey?: string } {
  loadCodeLensEnv();
  return {
    url: process.env.QDRANT_URL || undefined,
    apiKey: process.env.QDRANT_API_KEY || undefined,
  };
}
