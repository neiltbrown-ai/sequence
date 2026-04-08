import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("bookmarks")
    .select("content_type, slug, created_at")
    .order("created_at", { ascending: false });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ bookmarks: data });
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { content_type, slug } = await req.json();
  if (!content_type || !slug)
    return NextResponse.json({ error: "Missing content_type or slug" }, { status: 400 });

  const { error } = await supabase.from("bookmarks").upsert(
    { user_id: user.id, content_type, slug },
    { onConflict: "user_id,content_type,slug" }
  );

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ saved: true }, { status: 201 });
}

export async function DELETE(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { content_type, slug } = await req.json();
  if (!content_type || !slug)
    return NextResponse.json({ error: "Missing content_type or slug" }, { status: 400 });

  const { error } = await supabase
    .from("bookmarks")
    .delete()
    .eq("content_type", content_type)
    .eq("slug", slug);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ removed: true });
}
