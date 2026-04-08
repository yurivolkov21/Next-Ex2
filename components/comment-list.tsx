"use client";

import type { RecipeComment } from "@/lib/types";

interface CommentListProps {
	comments: RecipeComment[];
	deletingCommentId: string | null;
	onDelete: (commentId: string) => void;
}

export function CommentList({ comments, deletingCommentId, onDelete }: CommentListProps) {
	if (comments.length === 0) {
		return <p className="text-sm text-slate-500">No comments yet.</p>;
	}

	return (
		<ul className="space-y-3">
			{comments.map((comment) => (
				<li key={comment.id} className="rounded-lg border bg-white p-3">
					<div className="flex items-start justify-between gap-3">
						<div>
							<p className="text-sm text-slate-800">{comment.content}</p>
							<p className="mt-1 text-xs text-slate-500">
								{new Date(comment.created_at).toLocaleString("en-US")}
							</p>
						</div>

						<button
							type="button"
							onClick={() => onDelete(comment.id)}
							disabled={deletingCommentId === comment.id}
							className="rounded-md border border-red-200 px-2 py-1 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
						>
							{deletingCommentId === comment.id ? "Deleting..." : "Delete"}
						</button>
					</div>
				</li>
			))}
		</ul>
	);
}
