export const ENV = {
  appId: process.env.VITE_APP_ID ?? "codexai",
  jwtSecret: process.env.JWT_SECRET ?? "change-me-in-production",
  databaseUrl: process.env.DATABASE_URL ?? "",
  isProduction: process.env.NODE_ENV === "production",
  
  // Optional external services
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  
  // LLM Configuration (support both Forge and OpenAI)
  llmProvider: process.env.LLM_PROVIDER ?? "openai", // "openai" or "forge"
  openaiApiKey: process.env.OPENAI_API_KEY ?? "",
  openaiBaseUrl: process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  
  // Storage Configuration
  storageProvider: process.env.STORAGE_PROVIDER ?? "local", // "s3" or "local"
  s3Bucket: process.env.S3_BUCKET ?? "",
  s3Region: process.env.S3_REGION ?? "us-east-1",
  s3AccessKey: process.env.S3_ACCESS_KEY ?? "",
  s3SecretKey: process.env.S3_SECRET_KEY ?? "",
  localStoragePath: process.env.LOCAL_STORAGE_PATH ?? "./storage",
};
