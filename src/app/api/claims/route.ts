import { NextRequest, NextResponse } from "next/server";
import { findGiftById } from "@/data/gifts";
import { sendClaimNotification, type PaymentMethod } from "@/lib/notify-claim";
import { claimGift, getSoldOutClaims } from "@/lib/storage";

const VALID_PAYMENT_METHODS = new Set<PaymentMethod>(["revolut", "bank"]);

function parsePaymentMethod(value: unknown): PaymentMethod | undefined {
  return typeof value === "string" && VALID_PAYMENT_METHODS.has(value as PaymentMethod)
    ? (value as PaymentMethod)
    : undefined;
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 20;

export async function GET() {
  try {
    const soldOut = await getSoldOutClaims();
    return NextResponse.json(
      {
        soldOut: soldOut.map(({ giftId, claimedAt }) => ({ giftId, claimedAt })),
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    console.error("[claims] GET failed", err);
    return NextResponse.json({ soldOut: [] }, { headers: { "Cache-Control": "no-store" } });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const giftId = typeof body.giftId === "string" ? body.giftId.trim() : "";
    const giftedBy = typeof body.giftedBy === "string" ? body.giftedBy.trim() : "";

    if (!giftId || !giftedBy) {
      return NextResponse.json({ error: "giftId and giftedBy are required" }, { status: 400 });
    }

    const found = findGiftById(giftId);
    if (!found) {
      return NextResponse.json({ error: "Gift not found" }, { status: 404 });
    }

    const result = await claimGift(giftId, giftedBy);

    if (result.alreadyClaimed) {
      return NextResponse.json(
        { success: false, alreadyClaimed: true, entry: result.entry },
        { status: 409 }
      );
    }

    let emailNotification: Awaited<ReturnType<typeof sendClaimNotification>> | undefined;
    if (result.entry) {
      const giftName =
        (typeof body.giftName === "string" && body.giftName.trim()) || found.gift.name;
      const amount = typeof body.amount === "number" ? body.amount : found.gift.price;
      const paymentMethod = parsePaymentMethod(body.paymentMethod);

      emailNotification = await sendClaimNotification({
        giftId,
        giftedBy,
        claimedAt: result.entry.claimedAt,
        giftName,
        amount,
        paymentMethod,
      });

      if (!emailNotification.ok) {
        console.error("[claim-email] Notification failed:", emailNotification.error);
      }
    }

    return NextResponse.json({
      success: true,
      entry: result.entry,
      emailNotification,
    });
  } catch (err) {
    console.error("[claims] POST failed", err);
    return NextResponse.json({ error: "Failed to claim gift" }, { status: 500 });
  }
}
