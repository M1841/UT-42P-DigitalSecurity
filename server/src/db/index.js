import { env } from "node:process";

import { drizzle } from "drizzle-orm/neon-http";

export const db = drizzle(env["DATABASE_URL"]);
