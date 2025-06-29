import { type Config } from "drizzle-kit";

import { env } from "@/env";

export default {
  schema: "./src/server/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: env.NODE_ENV === "test" ? env.TEST_DATABASE_URL : env.DATABASE_URL,
  },
  tablesFilter: ["bandsy_*"],
} satisfies Config;
