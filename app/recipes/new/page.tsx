import { RecipeForm } from "@/components/recipe-form";

export default function NewRecipePage() {
	return (
		<section className="mx-auto w-full max-w-3xl space-y-4">
			<h1 className="text-2xl font-bold tracking-tight">Create New Recipe</h1>
			<p className="text-sm text-slate-600">
				Title and description are required. The remaining fields are optional.
			</p>
			<RecipeForm />
		</section>
	);
}
