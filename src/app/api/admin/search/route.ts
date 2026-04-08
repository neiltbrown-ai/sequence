import { type NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  const { admin } = auth;

  const q = request.nextUrl.searchParams.get("q")?.trim() || "";
  if (q.length < 2) return NextResponse.json([]);

  const results: Array<{
    id: string;
    label: string;
    sublabel: string;
    type: string;
    href: string;
  }> = [];

  // Search members (profiles)
  const { data: members } = await admin
    .from("profiles")
    .select("id, full_name, email")
    .or(`full_name.ilike.%${q}%,email.ilike.%${q}%`)
    .limit(8);

  if (members) {
    for (const m of members) {
      results.push({
        id: m.id,
        label: m.full_name || m.email,
        sublabel: m.full_name ? m.email : "",
        type: "member",
        href: `/admin/members/${m.id}`,
      });
    }
  }

  // Search discount codes
  const { data: discountCodes } = await admin
    .from("discount_codes")
    .select("id, code, description")
    .or(`code.ilike.%${q}%,description.ilike.%${q}%`)
    .limit(5);

  if (discountCodes) {
    for (const c of discountCodes) {
      results.push({
        id: c.id,
        label: c.code,
        sublabel: c.description || "Discount code",
        type: "discount_code",
        href: "/admin/codes",
      });
    }
  }

  // Search university codes
  const { data: uniCodes } = await admin
    .from("university_codes")
    .select("id, code, university_name")
    .or(`code.ilike.%${q}%,university_name.ilike.%${q}%`)
    .limit(5);

  if (uniCodes) {
    for (const c of uniCodes) {
      results.push({
        id: c.id,
        label: c.code,
        sublabel: c.university_name || "University code",
        type: "university_code",
        href: "/admin/codes",
      });
    }
  }

  return NextResponse.json(results);
}
