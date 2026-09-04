import { NextRequest, NextResponse } from "next/server";
import { getBDState, resetBDState, saveBDState } from "@/lib/bd/storage";
import type { Meeting } from "@/lib/bd/types";

export async function GET() {
  const state = await getBDState();
  return NextResponse.json(state);
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      meetings?: Meeting[];
      updatedBy?: string;
      action?: "reset";
    };

    if (body.action === "reset") {
      const state = await resetBDState();
      return NextResponse.json(state);
    }

    if (!Array.isArray(body.meetings)) {
      return NextResponse.json({ error: "meetings array required" }, { status: 400 });
    }

    const state = await saveBDState(body.meetings, body.updatedBy);
    return NextResponse.json(state);
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
