// lib/env.ts

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. Check your .env file.`
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
  return process.env.GITHUB_TOKEN || undefined;
}
