// Charge .env.local / .env pour les scripts lancés hors de Next (tsx).
import { existsSync } from "node:fs";

export function loadEnv() {
  for (const file of [".env.local", ".env"]) {
    if (existsSync(file)) process.loadEnvFile(file);
  }
}
