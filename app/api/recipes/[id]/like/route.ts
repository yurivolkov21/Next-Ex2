import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(
	request: Request,
	context: { params: Promise<{ id: string }> },
) {
	const { id } = await context.params;
	const body = (await request.json()) as { fingerprint?: string };
	const fingerprint = body.fingerprint?.trim() ?? "";

	if (!fingerprint) {
		return NextResponse.json({ error: "fingerprint is required" }, { status: 400 });
	}

	const recipeExists = await pool.query("SELECT id FROM recipes WHERE id = $1", [id]);

	if (recipeExists.rows.length === 0) {
		return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
	}

	await pool.query(
		`INSERT INTO likes (recipe_id, fingerprint)
		 VALUES ($1, $2)
		 ON CONFLICT (recipe_id, fingerprint) DO NOTHING`,
		[id, fingerprint],
	);

	const likeResult = await pool.query<{ likes: string }>(
		"SELECT COUNT(*)::text AS likes FROM likes WHERE recipe_id = $1",
		[id],
	);

	return NextResponse.json({
		success: true,
		likes: Number(likeResult.rows[0]?.likes ?? 0),
	});
}
