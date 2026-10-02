process.env.NODE_ENV = "test";
process.env.SUPABASE_URL = "https://test.invalid";
process.env.SUPABASE_SERVICE_ROLE_KEY = "local-test-service-role";
process.env.APP_JWT_SECRET =
  "local-test-secret-32-characters-minimum-do-not-deploy";
process.env.PI_SECRET_KEY = "local-test-pi-secret";
process.env.OPENROUTER_API_KEY = "local-test-openrouter-key";
delete process.env.TELEGRAM_BOT_TOKEN;
delete process.env.TELEGRAM_CHAT_ID;
