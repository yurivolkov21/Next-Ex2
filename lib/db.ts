import { Pool } from "pg";

declare global {
	var __recipePool: Pool | undefined;
}

export const pool =
	global.__recipePool ??
	new Pool({
		connectionString: process.env.DATABASE_URL,
	});

if (process.env.NODE_ENV !== "production") {
	global.__recipePool = pool;
}
