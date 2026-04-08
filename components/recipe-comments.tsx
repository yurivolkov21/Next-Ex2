"use client";

import { useState } from "react";
import type { RecipeComment } from "@/lib/types";
import { CommentForm } from "@/components/comment-form";
import { CommentList } from "@/components/comment-list";

interface RecipeCommentsProps {
  recipeId: string;
  initialComments: RecipeComment[];
}

export function RecipeComments({ recipeId, initialComments }: RecipeCommentsProps) {
  const [comments, setComments] = useState(initialComments);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleCreated(comment: RecipeComment) {
    setComments((previous) => [comment, ...previous]);
  }

  async function handleDelete(commentId: string) {
    if (deletingCommentId) {
      return;
    }

    setDeletingCommentId(commentId);
    setError(null);

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
      });

      const payload = (await response.json()) as { success?: boolean; error?: string };

      if (!response.ok || !payload.success) {
        throw new Error(payload.error ?? "Khong the xoa comment");
      }

      setComments((previous) => previous.filter((comment) => comment.id !== commentId));
    } catch (deleteError: unknown) {
      const message = deleteError instanceof Error ? deleteError.message : "Da xay ra loi";
      setError(message);
    } finally {
      setDeletingCommentId(null);
    }
  }

  return (
    <section className="space-y-4 rounded-2xl border bg-slate-50 p-4">
      <h2 className="text-xl font-semibold">Comments</h2>
      <CommentForm recipeId={recipeId} onCreated={handleCreated} />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <CommentList
        comments={comments}
        deletingCommentId={deletingCommentId}
        onDelete={handleDelete}
      />
    </section>
  );
}
