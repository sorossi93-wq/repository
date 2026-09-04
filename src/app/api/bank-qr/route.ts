import { toDataURL as qrToDataURL } from "qrcode";
import { NextRequest, NextResponse } from "next/server";
import { buildEpcQrPayload, EPC_QR_RENDER_OPTIONS } from "@/lib/bank";
import { getBankAccountName, getBankBic, getBankIban } from "@/lib/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const amountRaw = searchParams.get("amount");
    const reference = searchParams.get("reference") || "";
    const amount = amountRaw ? Number.parseFloat(amountRaw) : Number.NaN;

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: "Valid amount is required" }, { status: 400 });
    }

    const payload = buildEpcQrPayload({
      bic: getBankBic(),
      beneficiaryName: getBankAccountName(),
      iban: getBankIban(),
      amount,
      reference,
    });

    const pngDataUrl = await qrToDataURL(payload, EPC_QR_RENDER_OPTIONS);
    const base64 = pngDataUrl.replace(/^data:image\/png;base64,/, "");
    const png = Uint8Array.from(Buffer.from(base64, "base64"));
    return new NextResponse(png, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to generate QR code" }, { status: 500 });
  }
}
