// lib/env.ts
import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { homedir } from "os";
import { ConfigError } from "./errors";

/** Load ~/.codelens/.env into process.env.
 * Re-reads from disk at most every 5 seconds so tokens saved via
 * the Settings UI are picked up without requiring a server restart,
 * while avoiding redundant synchronous disk reads during a single request.
 */
let _envLastLoaded = 0;
const ENV_TTL_MS = 5_000;

export function loadCodeLensEnv() {
  const now = Date.now();
  if (now - _envLastLoaded < ENV_TTL_MS) return;
  _envLastLoaded = now;

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

