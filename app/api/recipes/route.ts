import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import type { CreateRecipeBody, RecipeListItem } from "@/lib/types";

export const dynamic = "force-dynamic";

function toStringArray(value: unknown): string[] {
	if (!Array.isArray(value)) {
		return [];
	}

	return value
		.map((item) => String(item).trim())
		.filter((item) => item.length > 0);
}

function mapRecipeRow(row: Record<string, unknown>): RecipeListItem {
	return {
		id: String(row.id),
		title: String(row.title),
		description: String(row.description),
		ingredients: toStringArray(row.ingredients),
		steps: toStringArray(row.steps),
		image_url: row.image_url ? String(row.image_url) : null,
		created_at: String(row.created_at),
		like_count: Number(row.like_count ?? 0),
	};
}

export async function GET(request: NextRequest) {
	const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
	const pageRaw = Number(request.nextUrl.searchParams.get("page") ?? "1");
	const limitRaw = Number(request.nextUrl.searchParams.get("limit") ?? "6");

	const page = Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1;
	const limit = Number.isFinite(limitRaw) && limitRaw > 0 ? Math.min(limitRaw, 30) : 6;
	const offset = (page - 1) * limit;

	const countQuery = await pool.query<{ total: string }>(
		`SELECT COUNT(*)::text AS total
		 FROM recipes r
		 WHERE ($1 = '' OR r.title ILIKE '%' || $1 || '%')`,
		[q],
	);

	const listQuery = await pool.query(
		`SELECT
				r.id,
				r.title,
				r.description,
				r.ingredients,
				r.steps,
				r.image_url,
				r.created_at,
				COALESCE(l.like_count, 0)::int AS like_count
			FROM recipes r
			LEFT JOIN (
				SELECT recipe_id, COUNT(*)::int AS like_count
				FROM likes
				GROUP BY recipe_id
			) l ON l.recipe_id = r.id
			WHERE ($1 = '' OR r.title ILIKE '%' || $1 || '%')
			ORDER BY r.created_at DESC
			LIMIT $2 OFFSET $3`,
		[q, limit, offset],
	);

	return NextResponse.json({
		data: listQuery.rows.map((row) => mapRecipeRow(row as Record<string, unknown>)),
		total: Number(countQuery.rows[0]?.total ?? 0),
		page,
		limit,
	});
}

export async function POST(request: Request) {
	const body = (await request.json()) as Partial<CreateRecipeBody>;

	const title = body.title?.trim() ?? "";
	const description = body.description?.trim() ?? "";
	const ingredients = toStringArray(body.ingredients);
	const steps = toStringArray(body.steps);
	const imageUrl = body.image_url?.trim() || null;

	if (!title || !description) {
		return NextResponse.json(
			{ error: "title and description are required" },
			{ status: 400 },
		);
	}

	const inserted = await pool.query(
		`INSERT INTO recipes (title, description, ingredients, steps, image_url)
		 VALUES ($1, $2, $3::jsonb, $4::jsonb, $5)
		 RETURNING id, title, description, ingredients, steps, image_url, created_at`,
		[title, description, JSON.stringify(ingredients), JSON.stringify(steps), imageUrl],
	);

	const recipe = mapRecipeRow({ ...inserted.rows[0], like_count: 0 } as Record<string, unknown>);
	return NextResponse.json({ data: recipe }, { status: 201 });
}
