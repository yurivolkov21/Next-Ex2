import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
	const client = await pool.connect();

	try {
		const sqlPath = path.join(process.cwd(), "app/scripts", "init.sql");
		const sqlRaw = await fs.readFile(sqlPath, "utf8");
		const sql = sqlRaw.trim();

		await client.query(sql);

		return NextResponse.json({
			success: true,
			message: "Executed app/scripts/init.sql",
		});
	} catch (err: unknown) {
		const message = err instanceof Error ? err.message : String(err);
		console.error("Seed error:", message, err);
		return NextResponse.json({ error: message }, { status: 500 });
	} finally {
		client.release();
	}
}
