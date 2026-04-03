// lib/errors.ts — Typed error classes for CodeLens

export class CodeLensError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
  ) {
    super(message);
    this.name = "CodeLensError";
  }
}

export class VectorStoreError extends CodeLensError {
  constructor(message: string, code = "VECTOR_STORE_ERROR", statusCode = 500) {
    super(message, code, statusCode);
    this.name = "VectorStoreError";
  }
}

export class EmbeddingError extends CodeLensError {
  constructor(message: string, code = "EMBEDDING_ERROR", statusCode = 500) {
    super(message, code, statusCode);
    this.name = "EmbeddingError";
  }
}

export class IngestionError extends CodeLensError {
  constructor(message: string, code = "INGESTION_ERROR", statusCode = 500) {
    super(message, code, statusCode);
    this.name = "IngestionError";
  }
}

export class ProviderError extends CodeLensError {
  constructor(message: string, code = "PROVIDER_ERROR", statusCode = 500) {
    super(message, code, statusCode);
    this.name = "ProviderError";
  }
}

export class ConfigError extends CodeLensError {
  constructor(message: string, code = "CONFIG_ERROR", statusCode = 500) {
    super(message, code, statusCode);
    this.name = "ConfigError";
  }
}
