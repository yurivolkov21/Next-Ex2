import { notFound } from "next/navigation";
import { pool } from "@/lib/db";
import { LikeButton } from "@/components/like-button";
import { RecipeComments } from "@/components/recipe-comments";
import type { RecipeComment } from "@/lib/types";

export const dynamic = "force-dynamic";

function toStringArray(value: unknown): string[] {
	if (!Array.isArray(value)) {
		return [];
	}

	return value.map((item) => String(item));
}

export default async function RecipeDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;

	const recipeResult = await pool.query(
		`SELECT id, title, description, ingredients, steps, image_url, created_at
		 FROM recipes
		 WHERE id = $1`,
		[id],
	);

	if (recipeResult.rows.length === 0) {
		notFound();
	}

	const likesResult = await pool.query<{ likes: string }>(
		"SELECT COUNT(*)::text AS likes FROM likes WHERE recipe_id = $1",
		[id],
	);

	const commentsResult = await pool.query(
		`SELECT id, recipe_id, content, created_at
		 FROM comments
		 WHERE recipe_id = $1
		 ORDER BY created_at DESC`,
		[id],
	);

	const row = recipeResult.rows[0] as {
		id: string;
		title: string;
		description: string;
		ingredients: unknown;
		steps: unknown;
		image_url: string | null;
		created_at: string;
	};

	const comments: RecipeComment[] = commentsResult.rows.map((commentRow) => ({
		id: String(commentRow.id),
		recipe_id: String(commentRow.recipe_id),
		content: String(commentRow.content),
		created_at: String(commentRow.created_at),
	}));

	const ingredients = toStringArray(row.ingredients);
	const steps = toStringArray(row.steps);
	const likes = Number(likesResult.rows[0]?.likes ?? 0);

	return (
		<section className="mx-auto flex w-full max-w-4xl flex-col gap-6">
			<article className="space-y-4 rounded-2xl border bg-white p-5 shadow-sm">
				{row.image_url ? (
					// eslint-disable-next-line @next/next/no-img-element
					<img
						src={row.image_url}
						alt={row.title}
						className="aspect-video w-full rounded-xl object-cover"
					/>
				) : null}

				<h1 className="text-3xl font-bold tracking-tight">{row.title}</h1>
				<p className="whitespace-pre-wrap text-slate-700">{row.description}</p>

				<LikeButton recipeId={row.id} initialLikes={likes} />

				<div className="grid gap-4 sm:grid-cols-2">
					<div className="rounded-xl border bg-slate-50 p-4">
						<h2 className="mb-2 text-lg font-semibold">Ingredients</h2>
						{ingredients.length === 0 ? (
							<p className="text-sm text-slate-500">Chua co du lieu.</p>
						) : (
							<ul className="list-disc space-y-1 pl-4 text-sm text-slate-700">
								{ingredients.map((ingredient, index) => (
									<li key={`${ingredient}-${index}`}>{ingredient}</li>
								))}
							</ul>
						)}
					</div>

					<div className="rounded-xl border bg-slate-50 p-4">
						<h2 className="mb-2 text-lg font-semibold">Steps</h2>
						{steps.length === 0 ? (
							<p className="text-sm text-slate-500">Chua co du lieu.</p>
						) : (
							<ol className="list-decimal space-y-1 pl-4 text-sm text-slate-700">
								{steps.map((step, index) => (
									<li key={`${step}-${index}`}>{step}</li>
								))}
							</ol>
						)}
					</div>
				</div>
			</article>

			<RecipeComments recipeId={row.id} initialComments={comments} />
		</section>
	);
}
