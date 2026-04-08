import Link from "next/link";
import type { RecipeListItem } from "@/lib/types";

interface RecipeCardProps {
	recipe: RecipeListItem;
}

function truncate(text: string, maxLength: number) {
	if (text.length <= maxLength) {
		return text;
	}

	return `${text.slice(0, maxLength).trim()}...`;
}

export function RecipeCard({ recipe }: RecipeCardProps) {
	return (
		<Link
			href={`/recipes/${recipe.id}`}
			className="group block overflow-hidden rounded-xl border bg-white transition hover:-translate-y-0.5 hover:shadow-md"
		>
			<div className="aspect-16/10 w-full bg-slate-100">
				{recipe.image_url ? (
					// eslint-disable-next-line @next/next/no-img-element
					<img
						src={recipe.image_url}
						alt={recipe.title}
						className="h-full w-full object-cover transition group-hover:scale-[1.02]"
					/>
				) : (
					<div className="flex h-full items-center justify-center text-sm text-slate-500">
						No image
					</div>
				)}
			</div>

			<div className="space-y-2 p-4">
				<h3 className="line-clamp-1 text-lg font-semibold text-slate-900">{recipe.title}</h3>
				<p className="text-sm text-slate-600">{truncate(recipe.description, 110)}</p>
				<p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
					Likes: {recipe.like_count}
				</p>
			</div>
		</Link>
	);
}
