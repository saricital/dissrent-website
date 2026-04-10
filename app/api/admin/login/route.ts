import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  createAdminSessionValue,
  isAdminConfigured,
  verifyAdminPassword,
} from "@/lib/adminAuth";
import { checkRateLimit } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  if (!isAdminConfigured()) {
    return NextResponse.json(
      { error: "Admin pristup nije konfigurisan na serveru." },
      { status: 503 }
    );
  }

  // Rate limit: 5 attempts per IP per 15 minutes
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  const rl = checkRateLimit(`login:${ip}`, 5, 15 * 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Previše pokušaja prijave. Pokušajte ponovo za malo." },
      {
        status: 429,
        headers: { "Retry-After": String(rl.retryAfter ?? 60) },
      }
    );
  }

  let body: { password?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Nevažeći zahtjev." }, { status: 400 });
  }

  const { password } = body;

  if (typeof password !== "string" || password.length === 0) {
    return NextResponse.json({ error: "Lozinka je obavezna." }, { status: 400 });
  }

  const sessionValue = createAdminSessionValue();
  if (!sessionValue) {
    return NextResponse.json({ error: "Admin sesija nije mogla biti kreirana." }, { status: 500 });
  }

  if (!verifyAdminPassword(password)) {
    return NextResponse.json({ error: "Pogrešna lozinka." }, { status: 401 });
  }

  const res = NextResponse.json({ success: true });
  res.cookies.set(ADMIN_COOKIE_NAME, sessionValue, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
    priority: "high",
  });
  return res;
}
