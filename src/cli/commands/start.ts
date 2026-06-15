import { config as dotenvConfig } from "dotenv";
import { resolve } from "path";

export const runStart = async () => {
  // Load environment variables from .env
  dotenvConfig({ path: resolve(process.cwd(), ".env") });

  // Start the sentinel
  await import("../../index.js");
};
