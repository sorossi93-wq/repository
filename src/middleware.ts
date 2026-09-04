import { NextRequest, NextResponse } from "next/server";

/** PayPal sometimes POSTs back to /thank-you. Next.js pages only render GET. */
export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === "/thank-you" && request.method === "POST") {
    return NextResponse.redirect(request.nextUrl, 303);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/thank-you"],
};
