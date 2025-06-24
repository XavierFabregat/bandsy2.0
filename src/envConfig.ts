import nextEnv from "@next/env";

const projectDir = process.cwd();
console.log("Next Env  ==> ", nextEnv);
nextEnv.loadEnvConfig(projectDir);
