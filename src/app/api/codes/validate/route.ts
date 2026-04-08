import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * POST /api/codes/validate
 *
 * Validates a discount or university code without redeeming it.
 * Public endpoint — no auth required (used during signup flow).
 */
export async function POST(request: Request) {
  let code: string;
  let type: "discount" | "university";

  try {
    const body = await request.json();
    code = body.code?.trim();
    type = body.type;
  } catch {
    return NextResponse.json({ valid: false, error: "Invalid request" }, { status: 400 });
  }

  if (!code || !type || !["discount", "university"].includes(type)) {
    return NextResponse.json(
      { valid: false, error: "code and type (discount|university) are required" },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();
  const now = new Date().toISOString();

  if (type === "discount") {
    const { data, error } = await supabase
      .from("discount_codes")
      .select("id, code, description, discount_type, discount_value, max_uses, current_uses, active, expires_at")
      .ilike("code", code)
      .maybeSingle();

    if (error || !data) {
      return NextResponse.json({ valid: false, error: "Invalid code" });
    }

    if (!data.active) {
      return NextResponse.json({ valid: false, error: "This code is no longer active" });
    }

    if (data.expires_at && data.expires_at < now) {
      return NextResponse.json({ valid: false, error: "This code has expired" });
    }

    if (data.max_uses && data.current_uses >= data.max_uses) {
      return NextResponse.json({ valid: false, error: "This code has reached its usage limit" });
    }

    const isFull = data.discount_type === "percent" && data.discount_value >= 100;

    return NextResponse.json({
      valid: true,
      code_id: data.id,
      code_type: "discount",
      code_value: data.code,
      discount_type: data.discount_type,
      discount_value: data.discount_value,
      description: data.description,
      is_full_discount: isFull,
      plan_granted: isFull ? "full_access" : null,
    });
  }

  // University code
  const { data, error } = await supabase
    .from("university_codes")
    .select("id, code, university_name, discount_percent, max_uses, current_uses, active, expires_at, stripe_coupon_id")
    .ilike("code", code)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ valid: false, error: "Invalid code" });
  }

  if (!data.active) {
    return NextResponse.json({ valid: false, error: "This code is no longer active" });
  }

  if (data.expires_at && data.expires_at < now) {
    return NextResponse.json({ valid: false, error: "This code has expired" });
  }

  if (data.max_uses && data.current_uses >= data.max_uses) {
    return NextResponse.json({ valid: false, error: "This code has reached its usage limit" });
  }

  return NextResponse.json({
    valid: true,
    code_id: data.id,
    code_type: "university",
    code_value: data.code,
    university_name: data.university_name,
    discount_percent: data.discount_percent,
    stripe_coupon_id: data.stripe_coupon_id,
  });
}
