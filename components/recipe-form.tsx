"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

function splitLines(value: string): string[] {
	return value
		.split("\n")
		.map((line) => line.trim())
		.filter((line) => line.length > 0);
}

export function RecipeForm() {
	const router = useRouter();
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [ingredients, setIngredients] = useState("");
	const [steps, setSteps] = useState("");
	const [imageUrl, setImageUrl] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setError(null);

		if (!title.trim() || !description.trim()) {
			setError("Title va description la bat buoc.");
			return;
		}

		setIsSubmitting(true);

		try {
			const response = await fetch("/api/recipes", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					title: title.trim(),
					description: description.trim(),
					ingredients: splitLines(ingredients),
					steps: splitLines(steps),
					image_url: imageUrl.trim() || undefined,
				}),
			});

			const payload = (await response.json()) as {
				data?: { id: string };
				error?: string;
			};

			if (!response.ok) {
				throw new Error(payload.error ?? "Khong the tao recipe");
			}

			router.push(`/recipes/${payload.data?.id ?? ""}`);
			router.refresh();
		} catch (submitError: unknown) {
			const message = submitError instanceof Error ? submitError.message : "Da xay ra loi";
			setError(message);
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border bg-white p-5 shadow-sm">
			<div>
				<label htmlFor="title" className="mb-1 block text-sm font-medium text-slate-700">
					Title *
				</label>
				<input
					id="title"
					value={title}
					onChange={(event) => setTitle(event.target.value)}
					required
					className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
				/>
			</div>

			<div>
				<label htmlFor="description" className="mb-1 block text-sm font-medium text-slate-700">
					Description *
				</label>
				<textarea
					id="description"
					value={description}
					onChange={(event) => setDescription(event.target.value)}
					required
					rows={4}
					className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
				/>
			</div>

			<div>
				<label htmlFor="ingredients" className="mb-1 block text-sm font-medium text-slate-700">
					Ingredients (moi dong 1 nguyen lieu)
				</label>
				<textarea
					id="ingredients"
					value={ingredients}
					onChange={(event) => setIngredients(event.target.value)}
					rows={5}
					className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
				/>
			</div>

			<div>
				<label htmlFor="steps" className="mb-1 block text-sm font-medium text-slate-700">
					Steps (moi dong 1 buoc)
				</label>
				<textarea
					id="steps"
					value={steps}
					onChange={(event) => setSteps(event.target.value)}
					rows={5}
					className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
				/>
			</div>

			<div>
				<label htmlFor="image_url" className="mb-1 block text-sm font-medium text-slate-700">
					Image URL
				</label>
				<input
					id="image_url"
					value={imageUrl}
					onChange={(event) => setImageUrl(event.target.value)}
					className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
				/>
			</div>

			{error ? <p className="text-sm text-red-600">{error}</p> : null}

			<button
				type="submit"
				disabled={isSubmitting}
				className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
			>
				{isSubmitting ? "Dang tao..." : "Create Recipe"}
			</button>
		</form>
	);
}
