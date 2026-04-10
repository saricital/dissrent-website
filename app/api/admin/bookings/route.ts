import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/adminAuth";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const bookings = db.getAllBookings();
  return NextResponse.json({ bookings });
}

export async function PATCH(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { id?: unknown; action?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Nevažeći zahtjev." }, { status: 400 });
  }

  const { id, action } = body;

  if (typeof id !== "string" || !id) {
    return NextResponse.json({ error: "id je obavezan." }, { status: 400 });
  }
  if (action !== "confirm" && action !== "cancel") {
    return NextResponse.json({ error: "action mora biti 'confirm' ili 'cancel'." }, { status: 400 });
  }

  const booking = db.getBookingById(id);
  if (!booking) {
    return NextResponse.json({ error: "Rezervacija nije pronađena." }, { status: 404 });
  }

  if (action === "confirm") {
    const result = db.confirmBookingIfAvailable(id);
    if (!result.success) {
      if (result.reason === "conflict") {
        return NextResponse.json(
          { error: "Termin je u medjuvremenu zauzet. Osvjezite listu prije potvrde." },
          { status: 409 }
        );
      }

      return NextResponse.json({ error: "Rezervacija nije u statusu pending." }, { status: 400 });
    }
  } else {
    if (booking.status === "cancelled") {
      return NextResponse.json({ error: "Rezervacija je već otkazana." }, { status: 400 });
    }
    db.cancelBooking(id);
  }

  return NextResponse.json({ success: true });
}
