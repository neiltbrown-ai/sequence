import { type NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/admin";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  const { admin, userId: adminId } = auth;

  const { id } = await params;
  const body = await request.json();
  const { note } = body;

  if (!note || typeof note !== "string" || !note.trim()) {
    return NextResponse.json(
      { error: "Note text is required" },
      { status: 400 }
    );
  }

  const { data, error } = await admin
    .from("admin_notes")
    .insert({
      user_id: id,
      admin_id: adminId,
      note: note.trim(),
    })
    .select("*, admin:profiles!admin_notes_admin_id_fkey(full_name)")
    .single();

  if (error) {
    console.error("Error creating admin note:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
