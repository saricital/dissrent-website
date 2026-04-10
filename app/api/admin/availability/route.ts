import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { DATE_RE } from "@/lib/booking";
import { VALID_CAR_IMGS } from "@/lib/carData";

function isValidDate(s: string): boolean {
  if (!DATE_RE.test(s)) return false;
  const d = new Date(`${s}T00:00:00Z`);
  return !isNaN(d.getTime());
}

export async function GET(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const start = req.nextUrl.searchParams.get("start") ?? "";
  const end = req.nextUrl.searchParams.get("end") ?? "";

  if (!start || !end) {
    return NextResponse.json({ error: "start and end required" }, { status: 400 });
  }

  if (!isValidDate(start) || !isValidDate(end)) {
    return NextResponse.json({ error: "Nevažeći format datuma (YYYY-MM-DD)." }, { status: 400 });
  }

  if (new Date(start) > new Date(end)) {
    return NextResponse.json({ error: "start mora biti <= end." }, { status: 400 });
  }

  // Max 2-year range to prevent resource exhaustion
  const diffDays = (new Date(end).getTime() - new Date(start).getTime()) / 86400000;
  if (diffDays > 730) {
    return NextResponse.json({ error: "Raspon datuma ne može biti veći od 2 godine." }, { status: 400 });
  }

  const blocked = db.getBlockedDates(start, end);
  return NextResponse.json({ blocked });
}

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { carImg?: unknown; date?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Nevažeći zahtjev." }, { status: 400 });
  }

  const { carImg, date } = body;

  if (!carImg || !date) {
    return NextResponse.json({ error: "carImg and date required" }, { status: 400 });
  }

  if (typeof carImg !== "string" || !VALID_CAR_IMGS.includes(carImg)) {
    return NextResponse.json({ error: "Nevažeći auto." }, { status: 400 });
  }

  if (typeof date !== "string" || !isValidDate(date)) {
    return NextResponse.json({ error: "Nevažeći format datuma (YYYY-MM-DD)." }, { status: 400 });
  }

  const result = db.toggleBlockedDate(carImg, date);
  if (result === "reserved") {
    return NextResponse.json(
      { error: "Datum je vec vezan za potvrdjenu rezervaciju." },
      { status: 409 }
    );
  }

  return NextResponse.json({ result });
}
