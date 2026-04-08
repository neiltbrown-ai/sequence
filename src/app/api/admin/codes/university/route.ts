import { type NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe/client";

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  const { admin } = auth;

  const { data, error } = await admin
    .from("university_codes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching university codes:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  const { admin } = auth;

  const body = await request.json();
  const { code, university_name, discount_percent, max_uses, expires_at } = body;

  if (!code || !university_name) {
    return NextResponse.json(
      { error: "code and university_name are required" },
      { status: 400 }
    );
  }

  // Create a Stripe coupon ($10 off, making Library $2/yr)
  let stripeCouponId: string | null = null;
  try {
    const stripe = getStripe();
    const coupon = await stripe.coupons.create({
      amount_off: 1000, // $10.00 in cents
      currency: "usd",
      duration: "forever",
      name: `University: ${university_name}`,
    });
    stripeCouponId = coupon.id;
  } catch (err) {
    console.error("Error creating Stripe coupon:", err);
    // Continue without coupon — admin can retry or create manually
  }

  const { data, error } = await admin
    .from("university_codes")
    .insert({
      code,
      university_name,
      discount_percent: discount_percent ?? 100,
      stripe_coupon_id: stripeCouponId,
      ...(max_uses != null && { max_uses }),
      ...(expires_at && { expires_at }),
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating university code:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  const { admin } = auth;

  const body = await request.json();
  const { id, ...updates } = body;

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const { data, error } = await admin
    .from("university_codes")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating university code:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  const { admin } = auth;

  const { searchParams } = request.nextUrl;
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  // Get the code first to check for Stripe coupon
  const { data: codeData } = await admin
    .from("university_codes")
    .select("stripe_coupon_id")
    .eq("id", id)
    .maybeSingle();

  // Delete Stripe coupon if it exists
  if (codeData?.stripe_coupon_id) {
    try {
      const stripe = getStripe();
      await stripe.coupons.del(codeData.stripe_coupon_id);
    } catch (err) {
      console.error("Error deleting Stripe coupon:", err);
      // Continue with deletion even if coupon cleanup fails
    }
  }

  const { error } = await admin.from("university_codes").delete().eq("id", id);

  if (error) {
    console.error("Error deleting university code:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
