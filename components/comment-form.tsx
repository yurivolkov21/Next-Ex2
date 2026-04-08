"use client";

import { useState } from "react";
import type { RecipeComment } from "@/lib/types";

interface CommentFormProps {
	recipeId: string;
	onCreated: (comment: RecipeComment) => void;
}

export function CommentForm({ recipeId, onCreated }: CommentFormProps) {
	const [content, setContent] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();

		if (!content.trim()) {
			setError("Noi dung comment khong duoc de trong");
			return;
		}

		setError(null);
		setIsSubmitting(true);

		try {
			const response = await fetch(`/api/recipes/${recipeId}/comments`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ content: content.trim() }),
			});

			const payload = (await response.json()) as {
				data?: RecipeComment;
				error?: string;
			};

			if (!response.ok || !payload.data) {
				throw new Error(payload.error ?? "Khong the tao comment");
			}

			onCreated(payload.data);
			setContent("");
		} catch (submitError: unknown) {
			const message = submitError instanceof Error ? submitError.message : "Da xay ra loi";
			setError(message);
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-2">
			<label htmlFor="comment-content" className="text-sm font-medium text-slate-700">
				Them comment
			</label>
			<textarea
				id="comment-content"
				value={content}
				onChange={(event) => setContent(event.target.value)}
				rows={3}
				className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
			/>
			<div className="flex items-center gap-3">
				<button
					type="submit"
					disabled={isSubmitting}
					className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
				>
					{isSubmitting ? "Dang gui..." : "Send"}
				</button>
				{error ? <p className="text-xs text-red-600">{error}</p> : null}
			</div>
		</form>
	);
}
