import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { VALID_CAR_IMGS } from "@/lib/carData";

export async function GET(req: NextRequest) {
  const carImg = req.nextUrl.searchParams.get("carImg");
  if (!carImg || !VALID_CAR_IMGS.includes(carImg)) {
    return NextResponse.json({ blockedDates: [] });
  }

  const blockedDates = db.getBlockedDatesForCar(carImg);
  return NextResponse.json(
    { blockedDates },
    { headers: { "Cache-Control": "no-store" } }
  );
}
