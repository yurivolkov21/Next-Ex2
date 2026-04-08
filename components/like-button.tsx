"use client";

import { useMemo, useState } from "react";

interface LikeButtonProps {
	recipeId: string;
	initialLikes: number;
}

function getFingerprint(recipeId: string): string {
	const key = `recipe-fingerprint-${recipeId}`;
	const cached = localStorage.getItem(key);

	if (cached) {
		return cached;
	}

	const fingerprint = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
	localStorage.setItem(key, fingerprint);
	return fingerprint;
}

export function LikeButton({ recipeId, initialLikes }: LikeButtonProps) {
	const [likes, setLikes] = useState(initialLikes);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const buttonLabel = useMemo(() => `Like (${likes})`, [likes]);

	async function handleLike() {
		if (isSubmitting) {
			return;
		}

		setIsSubmitting(true);
		setError(null);

		try {
			const response = await fetch(`/api/recipes/${recipeId}/like`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					fingerprint: getFingerprint(recipeId),
				}),
			});

			const payload = (await response.json()) as { likes?: number; error?: string };

			if (!response.ok) {
				throw new Error(payload.error ?? "Could not like this recipe");
			}

			setLikes(Number(payload.likes ?? likes));
		} catch (likeError: unknown) {
			const message = likeError instanceof Error ? likeError.message : "Something went wrong";
			setError(message);
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<div className="space-y-2">
			<button
				type="button"
				onClick={handleLike}
				disabled={isSubmitting}
				className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
			>
				{isSubmitting ? "Liking..." : buttonLabel}
			</button>
			{error ? <p className="text-xs text-red-600">{error}</p> : null}
		</div>
	);
}
