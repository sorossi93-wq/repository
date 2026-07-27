import { NextRequest, NextResponse } from "next/server";
import { sendClaimNotification, type PaymentMethod } from "@/lib/notify-claim";
import { claimGift, getSoldOutClaims } from "@/lib/storage";

const VALID_PAYMENT_METHODS = new Set<PaymentMethod>(["paypal", "revolut", "bank"]);

function parsePaymentMethod(value: unknown): PaymentMethod | undefined {
  return typeof value === "string" && VALID_PAYMENT_METHODS.has(value as PaymentMethod)
    ? (value as PaymentMethod)
    : undefined;
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const soldOut = await getSoldOutClaims();
  return NextResponse.json({
    soldOut: soldOut.map(({ giftId, claimedAt }) => ({ giftId, claimedAt })),
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const giftId = typeof body.giftId === "string" ? body.giftId.trim() : "";
    const giftedBy = typeof body.giftedBy === "string" ? body.giftedBy.trim() : "";

    if (!giftId || !giftedBy) {
      return NextResponse.json({ error: "giftId and giftedBy are required" }, { status: 400 });
    }

    const result = await claimGift(giftId, giftedBy);

    if (result.alreadyClaimed) {
      return NextResponse.json({ success: false, alreadyClaimed: true, entry: result.entry }, { status: 409 });
    }

    if (result.entry) {
      const giftName = typeof body.giftName === "string" ? body.giftName.trim() : undefined;
      const amount = typeof body.amount === "number" ? body.amount : undefined;
      const paymentMethod = parsePaymentMethod(body.paymentMethod);

      void sendClaimNotification({
        giftId,
        giftedBy,
        claimedAt: result.entry.claimedAt,
        giftName: giftName || undefined,
        amount,
        paymentMethod,
      })
        .then((notificationResult) => {
          if (!notificationResult.ok) {
            console.error("[claim-email] Notification failed:", notificationResult.error);
          }
        })
        .catch((err) => {
          console.error("[claim-email] Unexpected error:", err);
        });
    }

    return NextResponse.json({
      success: true,
      entry: result.entry,
    });
  } catch {
    return NextResponse.json({ error: "Failed to claim gift" }, { status: 500 });
  }
}
