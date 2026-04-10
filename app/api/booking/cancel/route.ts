import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
}

function redirectToStatus(status: string): NextResponse {
  return NextResponse.redirect(`${getBaseUrl()}/booking-action?status=${status}`);
}

async function readToken(req: NextRequest): Promise<string | null> {
  const contentType = req.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const body = (await req.json().catch(() => null)) as { token?: unknown } | null;
    return typeof body?.token === "string" ? body.token : null;
  }

  const formData = await req.formData().catch(() => null);
  const token = formData?.get("token");
  return typeof token === "string" ? token : null;
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token || token.length < 10) {
    return redirectToStatus("invalid");
  }

  return NextResponse.redirect(
    `${getBaseUrl()}/booking-action?action=cancel&token=${encodeURIComponent(token)}`
  );
}

export async function POST(req: NextRequest) {
  const token = await readToken(req);
  if (!token || token.length < 10) {
    return redirectToStatus("invalid");
  }

  const booking = db.getBookingByCancelToken(token);
  if (!booking || booking.status !== "confirmed") {
    return redirectToStatus("invalid");
  }

  db.cancelBooking(booking.id);
  return redirectToStatus("cancelled");
}
