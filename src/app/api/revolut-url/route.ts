import { NextRequest, NextResponse } from "next/server";
import { findGiftById } from "@/data/gifts";
import { buildRevolutPaymentDetails } from "@/lib/revolut";
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

    const details = buildRevolutPaymentDetails(found.gift.price, found.gift.name, guestName);
    return NextResponse.json(details);
  } catch (err) {
    console.error("[revolut-url] Failed", err);
    return NextResponse.json({ error: "Failed to build Revolut URL" }, { status: 500 });
  }
}
