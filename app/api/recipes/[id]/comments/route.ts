import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export const dynamic = "force-dynamic";

function mapComment(row: Record<string, unknown>) {
	return {
		id: String(row.id),
		recipe_id: String(row.recipe_id),
		content: String(row.content),
		created_at: String(row.created_at),
	};
}

export async function GET(
	_request: Request,
	context: { params: Promise<{ id: string }> },
) {
	const { id } = await context.params;

	const comments = await pool.query(
		`SELECT id, recipe_id, content, created_at
		 FROM comments
		 WHERE recipe_id = $1
		 ORDER BY created_at DESC`,
		[id],
	);

	return NextResponse.json({
		data: comments.rows.map((row) => mapComment(row as Record<string, unknown>)),
	});
}

export async function POST(
	request: Request,
	context: { params: Promise<{ id: string }> },
) {
	const { id } = await context.params;
	const body = (await request.json()) as { content?: string };
	const content = body.content?.trim() ?? "";

	if (!content) {
		return NextResponse.json({ error: "content is required" }, { status: 400 });
	}

	const recipeExists = await pool.query("SELECT id FROM recipes WHERE id = $1", [id]);

	if (recipeExists.rows.length === 0) {
		return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
	}

	const inserted = await pool.query(
		`INSERT INTO comments (recipe_id, content)
		 VALUES ($1, $2)
		 RETURNING id, recipe_id, content, created_at`,
		[id, content],
	);

	return NextResponse.json(
		{ data: mapComment(inserted.rows[0] as Record<string, unknown>) },
		{ status: 201 },
	);
}
