import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function DELETE(
	_request: Request,
	context: { params: Promise<{ id: string }> },
) {
	const { id } = await context.params;

	const result = await pool.query("DELETE FROM comments WHERE id = $1", [id]);

	if (result.rowCount === 0) {
		return NextResponse.json({ error: "Comment not found" }, { status: 404 });
	}

	return NextResponse.json({ success: true });
}
