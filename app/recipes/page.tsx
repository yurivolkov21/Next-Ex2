import Link from "next/link";
import { pool } from "@/lib/db";
import type { RecipeListItem } from "@/lib/types";
import { RecipeCard } from "@/components/recipe-card";

export const dynamic = "force-dynamic";

type SearchParams = {
	q?: string;
	page?: string;
	limit?: string;
};

function toStringArray(value: unknown): string[] {
	if (!Array.isArray(value)) {
		return [];
	}

	return value.map((item) => String(item));
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

export default async function RecipesPage({
	searchParams,
}: {
	searchParams: Promise<SearchParams>;
}) {
	const params = await searchParams;
	const q = params.q?.trim() ?? "";
	const pageRaw = Number(params.page ?? "1");
	const limitRaw = Number(params.limit ?? "6");

	const page = Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1;
	const limit = Number.isFinite(limitRaw) && limitRaw > 0 ? Math.min(limitRaw, 30) : 6;
	const offset = (page - 1) * limit;

	const countQuery = await pool.query<{ total: string }>(
		`SELECT COUNT(*)::text AS total
		 FROM recipes
		 WHERE ($1 = '' OR title ILIKE '%' || $1 || '%')`,
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

	const total = Number(countQuery.rows[0]?.total ?? 0);
	const totalPages = Math.max(1, Math.ceil(total / limit));
	const recipes = listQuery.rows.map((row) => mapRecipeRow(row as Record<string, unknown>));

	return (
		<section className="space-y-6">
			<div className="flex flex-col gap-4 rounded-2xl border bg-white p-5 sm:flex-row sm:items-end sm:justify-between">
				<form action="/recipes" className="flex flex-1 flex-col gap-2 sm:max-w-md">
					<label htmlFor="q" className="text-sm font-medium text-slate-700">
						Search by title
					</label>
					<input
						id="q"
						name="q"
						defaultValue={q}
						placeholder="Enter recipe title..."
						className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
					/>
					<input type="hidden" name="limit" value={String(limit)} />
					<button
						type="submit"
						className="w-fit rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
					>
						Search
					</button>
				</form>

				<Link
					href="/recipes/new"
					className="inline-flex w-fit items-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
				>
					+ New Recipe
				</Link>
			</div>

			{recipes.length === 0 ? (
				<div className="rounded-xl border border-dashed bg-white p-8 text-center text-slate-600">
					No recipes found.
				</div>
			) : (
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
					{recipes.map((recipe) => (
						<RecipeCard key={recipe.id} recipe={recipe} />
					))}
				</div>
			)}

			<div className="flex items-center justify-between rounded-xl border bg-white p-4 text-sm">
				<p className="text-slate-600">
					Page {page}/{totalPages} - Total {total} recipes
				</p>
				<div className="flex items-center gap-2">
					<Link
						href={`/recipes?q=${encodeURIComponent(q)}&page=${Math.max(1, page - 1)}&limit=${limit}`}
						className={`rounded-md border px-3 py-1 ${
							page <= 1 ? "pointer-events-none opacity-40" : "hover:bg-slate-100"
						}`}
					>
						Prev
					</Link>
					<Link
						href={`/recipes?q=${encodeURIComponent(q)}&page=${Math.min(totalPages, page + 1)}&limit=${limit}`}
						className={`rounded-md border px-3 py-1 ${
							page >= totalPages ? "pointer-events-none opacity-40" : "hover:bg-slate-100"
						}`}
					>
						Next
					</Link>
				</div>
			</div>
		</section>
	);
}
