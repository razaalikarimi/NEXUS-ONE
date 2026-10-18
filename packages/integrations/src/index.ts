// ============================================================
// @nexus-one/integrations — Provider Adapter Interfaces
// ============================================================
// Defines interfaces for external service integrations.
// Concrete implementations are added in Phase 11.
// ============================================================

// ---- LLM Provider ----

export interface LlmMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LlmCompletionOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  stopSequences?: string[];
}

export interface LlmCompletionResult {
  content: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  finishReason: string;
}

export interface LlmProvider {
  readonly name: string;
  readonly isConfigured: boolean;
  complete(
    messages: LlmMessage[],
    options?: LlmCompletionOptions,
  ): Promise<LlmCompletionResult>;
}

// ---- Embedding Provider ----

export interface EmbeddingResult {
  embedding: number[];
  model: string;
  tokenCount: number;
}

export interface EmbeddingProvider {
  readonly name: string;
  readonly isConfigured: boolean;
  readonly dimensions: number;
  embed(text: string): Promise<EmbeddingResult>;
  embedBatch(texts: string[]): Promise<EmbeddingResult[]>;
}

// ---- Storage Provider ----

export interface StorageUploadOptions {
  contentType?: string;
  metadata?: Record<string, string>;
}

export interface StorageProvider {
  readonly name: string;
  readonly isConfigured: boolean;
  upload(key: string, data: Buffer, options?: StorageUploadOptions): Promise<string>;
  download(key: string): Promise<Buffer>;
  delete(key: string): Promise<void>;
  getSignedUrl(key: string, expiresInSeconds?: number): Promise<string>;
}

// ---- Email Provider ----

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface EmailProvider {
  readonly name: string;
  readonly isConfigured: boolean;
  send(message: EmailMessage): Promise<void>;
}

// ---- Cloud Provider (CloudPilot) ----

export interface CloudCostRecord {
  provider: string;
  account: string;
  service: string;
  region: string;
  resource: string;
  usagePeriodStart: Date;
  usagePeriodEnd: Date;
  amount: number;
  currency: string;
  unit: string;
  quantity: number;
}

export interface CloudProvider {
  readonly name: string;
  readonly isConfigured: boolean;
  fetchCosts(startDate: Date, endDate: Date): Promise<CloudCostRecord[]>;
  validateCredentials(): Promise<boolean>;
}
