import { readFileSync } from "fs";
import { resolve } from "path";

interface SentinelConfig {
  ignoredPatterns: string[];
  excludedContainers: string[];
}

const loadConfig = (): SentinelConfig => {
  try {
    const path = resolve(process.cwd(), "sentinel.config.json");
    const raw = readFileSync(path, "utf-8");
    return JSON.parse(raw);
  } catch {
    console.warn(
      "[Config] sentinel.config.json not found, default configuration used.",
    );
    return {
      ignoredPatterns: [],
      excludedContainers: ["docker-sentinel"],
    };
  }
};

export const config = loadConfig();
