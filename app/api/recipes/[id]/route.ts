import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import type { UpdateRecipeBody } from "@/lib/types";

export const dynamic = "force-dynamic";

function toStringArray(value: unknown): string[] {
	if (!Array.isArray(value)) {
		return [];
	}

	return value
		.map((item) => String(item).trim())
		.filter((item) => item.length > 0);
}

function mapRecipeRow(row: Record<string, unknown>) {
	return {
		id: String(row.id),
		title: String(row.title),
		description: String(row.description),
		ingredients: toStringArray(row.ingredients),
		steps: toStringArray(row.steps),
		image_url: row.image_url ? String(row.image_url) : null,
		created_at: String(row.created_at),
	};
}

export async function GET(
	_request: Request,
	context: { params: Promise<{ id: string }> },
) {
	const { id } = await context.params;

	const recipeResult = await pool.query(
		`SELECT id, title, description, ingredients, steps, image_url, created_at
		 FROM recipes
		 WHERE id = $1`,
		[id],
	);

	if (recipeResult.rows.length === 0) {
		return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
	}

	const likeResult = await pool.query<{ likes: string }>(
		`SELECT COUNT(*)::text AS likes FROM likes WHERE recipe_id = $1`,
		[id],
	);

	return NextResponse.json({
		data: mapRecipeRow(recipeResult.rows[0] as Record<string, unknown>),
		likes: Number(likeResult.rows[0]?.likes ?? 0),
	});
}

export async function PUT(
	request: Request,
	context: { params: Promise<{ id: string }> },
) {
	const { id } = await context.params;
	const body = (await request.json()) as UpdateRecipeBody;

	const existing = await pool.query(
		`SELECT id, title, description, ingredients, steps, image_url, created_at
		 FROM recipes
		 WHERE id = $1`,
		[id],
	);

	if (existing.rows.length === 0) {
		return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
	}

	const current = existing.rows[0] as Record<string, unknown>;
	const title = body.title?.trim() ?? String(current.title);
	const description = body.description?.trim() ?? String(current.description);
	const ingredients = body.ingredients ? toStringArray(body.ingredients) : toStringArray(current.ingredients);
	const steps = body.steps ? toStringArray(body.steps) : toStringArray(current.steps);
	const imageUrl =
		body.image_url === undefined ? (current.image_url ? String(current.image_url) : null) : body.image_url.trim() || null;

	if (!title || !description) {
		return NextResponse.json(
			{ error: "title and description cannot be empty" },
			{ status: 400 },
		);
	}

	const updated = await pool.query(
		`UPDATE recipes
		 SET title = $1,
				 description = $2,
				 ingredients = $3::jsonb,
				 steps = $4::jsonb,
				 image_url = $5
		 WHERE id = $6
		 RETURNING id, title, description, ingredients, steps, image_url, created_at`,
		[title, description, JSON.stringify(ingredients), JSON.stringify(steps), imageUrl, id],
	);

	return NextResponse.json({ data: mapRecipeRow(updated.rows[0] as Record<string, unknown>) });
}

export async function DELETE(
	_request: Request,
	context: { params: Promise<{ id: string }> },
) {
	const { id } = await context.params;

	const deleted = await pool.query("DELETE FROM recipes WHERE id = $1", [id]);

	if (deleted.rowCount === 0) {
		return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
	}

	return NextResponse.json({ success: true });
}
