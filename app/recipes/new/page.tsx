import { RecipeForm } from "@/components/recipe-form";

export default function NewRecipePage() {
	return (
		<section className="mx-auto w-full max-w-3xl space-y-4">
			<h1 className="text-2xl font-bold tracking-tight">Create New Recipe</h1>
			<p className="text-sm text-slate-600">
				Dien title va description bat buoc, cac truong con lai tuy chon theo de bai.
			</p>
			<RecipeForm />
		</section>
	);
}
