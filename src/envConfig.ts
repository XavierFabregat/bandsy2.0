import nextEnv from "@next/env";

const projectDir = process.cwd();

// Only load env config if available (prevents build-time errors)
if (nextEnv?.loadEnvConfig) {
  nextEnv.loadEnvConfig(projectDir);
}
