export const ENV = {
  appId: process.env.VITE_APP_ID ?? "codexai",
  jwtSecret: process.env.JWT_SECRET ?? "change-me-in-production",
  databaseUrl: process.env.DATABASE_URL ?? "",
  isProduction: process.env.NODE_ENV === "production",
  
  // Optional external services
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  
  // LLM Configuration
  // Supports: openai, forge, ollama, or custom (any OpenAI-compatible API)
  llmProvider: process.env.LLM_PROVIDER ?? "openai",
  
  // OpenAI Configuration
  openaiApiKey: process.env.OPENAI_API_KEY ?? "",
  openaiBaseUrl: process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1",
  openaiModel: process.env.OPENAI_MODEL ?? "gpt-4",
  openaiEmbeddingModel: process.env.OPENAI_EMBEDDING_MODEL ?? "text-embedding-3-small",
  
  // Manus Forge Configuration (optional)
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  
  // Ollama Configuration (for local open-source LLMs)
  ollamaBaseUrl: process.env.OLLAMA_BASE_URL ?? "http://localhost:11434/v1",
  ollamaModel: process.env.OLLAMA_MODEL ?? "llama3",
  ollamaEmbeddingModel: process.env.OLLAMA_EMBEDDING_MODEL ?? "nomic-embed-text",
  
  // Custom OpenAI-compatible API Configuration
  customLlmBaseUrl: process.env.CUSTOM_LLM_BASE_URL ?? "",
  customLlmApiKey: process.env.CUSTOM_LLM_API_KEY ?? "",
  customLlmModel: process.env.CUSTOM_LLM_MODEL ?? "gpt-3.5-turbo",
  customLlmEmbeddingModel: process.env.CUSTOM_LLM_EMBEDDING_MODEL ?? "text-embedding-ada-002",
  
  // Storage Configuration
  storageProvider: process.env.STORAGE_PROVIDER ?? "local", // "s3" or "local"
  s3Bucket: process.env.S3_BUCKET ?? "",
  s3Region: process.env.S3_REGION ?? "us-east-1",
  s3AccessKey: process.env.S3_ACCESS_KEY ?? "",
  s3SecretKey: process.env.S3_SECRET_KEY ?? "",
  localStoragePath: process.env.LOCAL_STORAGE_PATH ?? "./storage",
  
  // Encryption Configuration
  encryptionKey: process.env.ENCRYPTION_KEY ?? "default-encryption-key-change-in-production",
};
