import { NextRequest, NextResponse } from "next/server";
import { findGiftById } from "@/data/gifts";
import { getPayPalEmail, getPayPalUsername } from "@/lib/config";
import { buildPayPalMeUrl, buildPayPalXclickUrl } from "@/lib/paypal";
import { isGiftSoldOut } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const giftId = typeof body.giftId === "string" ? body.giftId.trim() : "";
    const guestName = typeof body.guestName === "string" ? body.guestName.trim() : "";

    if (!giftId || !guestName) {
      return NextResponse.json({ error: "giftId and guestName are required" }, { status: 400 });
    }

    const found = findGiftById(giftId);
    if (!found) {
      return NextResponse.json({ error: "Gift not found" }, { status: 404 });
    }

    if (await isGiftSoldOut(giftId)) {
      return NextResponse.json({ error: "This gift has already been claimed" }, { status: 409 });
    }

    const url = buildPayPalMeUrl(found.gift.price);
    const fallbackUrl = buildPayPalXclickUrl(
      found.gift.price,
      found.gift.name,
      guestName,
      giftId
    );

    return NextResponse.json({
      url,
      fallbackUrl,
      email: getPayPalEmail(),
      username: getPayPalUsername(),
    });
  } catch (err) {
    console.error("[paypal-url] Failed", err);
    return NextResponse.json({ error: "Failed to build PayPal URL" }, { status: 500 });
  }
}
