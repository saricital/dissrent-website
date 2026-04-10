import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { sendConfirmEmail } from "@/lib/email";
import { checkRateLimit } from "@/lib/rateLimit";
import { getCarByImg, VALID_CAR_IMGS } from "@/lib/carData";
import {
  BOOKING_LOCATION,
  getQuoteForCar,
  isDateRangeValid,
  isFutureOrToday,
  isValidPhone,
  normalizeEmail,
  normalizeName,
  normalizePhone,
} from "@/lib/booking";

const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const VALID_PREFS = ["viber", "sms"] as const;

// Valid car images — must match car.img paths in carData (public paths with leading slash)

export async function POST(req: NextRequest) {
  // Rate limit: 10 bookings per IP per hour
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  const rl = checkRateLimit(`booking:${ip}`, 10, 60 * 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Previše zahtjeva. Pokušajte ponovo za malo." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter ?? 60) } }
    );
  }

  try {
    const body = await req.json();
    const {
      customerName,
      customerPhone,
      customerEmail,
      contactPreference,
      carImg,
      days,
      pickupDate,
      returnDate,
    } = body;

    const normalizedName = typeof customerName === "string" ? normalizeName(customerName) : "";
    const normalizedPhone = typeof customerPhone === "string" ? normalizePhone(customerPhone) : "";
    const normalizedEmail = typeof customerEmail === "string" ? normalizeEmail(customerEmail) : "";
    const car = typeof carImg === "string" ? getCarByImg(carImg) : undefined;

    // ── Required field presence ──────────────────────────────────────────────
    if (
      !customerName ||
      !customerPhone ||
      !customerEmail ||
      !contactPreference ||
      !carImg ||
      !pickupDate ||
      !returnDate
    ) {
      return NextResponse.json({ error: "Sva polja su obavezna." }, { status: 400 });
    }

    // ── Type checks ──────────────────────────────────────────────────────────
    if (
      typeof customerName !== "string" ||
      typeof customerPhone !== "string" ||
      typeof customerEmail !== "string" ||
      typeof contactPreference !== "string" ||
      typeof carImg !== "string" ||
      typeof pickupDate !== "string" ||
      typeof returnDate !== "string"
    ) {
      return NextResponse.json({ error: "Nevažeći tipovi podataka." }, { status: 400 });
    }

    // ── Length limits ────────────────────────────────────────────────────────
    if (normalizedName.length < 2 || normalizedName.length > 100) {
      return NextResponse.json({ error: "Ime mora biti između 2 i 100 znakova." }, { status: 400 });
    }
    if (normalizedPhone.length > 30 || !isValidPhone(normalizedPhone)) {
      return NextResponse.json({ error: "Telefon je predugačak." }, { status: 400 });
    }
    if (normalizedEmail.length > 254) {
      return NextResponse.json({ error: "Email je predugačak." }, { status: 400 });
    }

    // ── Email format ─────────────────────────────────────────────────────────
    if (!EMAIL_RE.test(normalizedEmail)) {
      return NextResponse.json({ error: "Nevažeća email adresa." }, { status: 400 });
    }

    // ── Contact preference enum ──────────────────────────────────────────────
    if (!VALID_PREFS.includes(contactPreference as typeof VALID_PREFS[number])) {
      return NextResponse.json({ error: "Nevažeća kontakt preferencija." }, { status: 400 });
    }

    // ── Date format (if provided) ────────────────────────────────────────────
    if (pickupDate && !DATE_RE.test(pickupDate)) {
      return NextResponse.json({ error: "Nevažeći format datuma preuzimanja." }, { status: 400 });
    }
    if (returnDate && !DATE_RE.test(returnDate)) {
      return NextResponse.json({ error: "Nevažeći format datuma povratka." }, { status: 400 });
    }
    if (!isDateRangeValid(pickupDate, returnDate) || !isFutureOrToday(pickupDate)) {
      return NextResponse.json({ error: "Datum povratka mora biti poslije datuma preuzimanja." }, { status: 400 });
    }

    // ── Days sanity ──────────────────────────────────────────────────────────
    if (days !== null && days !== undefined) {
      const daysNum = Number(days);
      if (!Number.isInteger(daysNum) || daysNum < 1 || daysNum > 365) {
        return NextResponse.json({ error: "Nevažeći broj dana." }, { status: 400 });
      }
    }

    // ── Car image (if provided) ──────────────────────────────────────────────
    if (!VALID_CAR_IMGS.includes(carImg) || !car) {
      return NextResponse.json({ error: "Nevažeći auto." }, { status: 400 });
    }

    const pricing = getQuoteForCar(carImg, pickupDate, returnDate);
    if (!pricing || pricing.quote.days > 365) {
      return NextResponse.json({ error: "NevaÅ¾eÄ‡i termin rezervacije." }, { status: 400 });
    }

    if (db.hasBlockingConflict(carImg, pickupDate, returnDate)) {
      return NextResponse.json(
        { error: "Odabrani termin je upravo zauzet. Izaberite drugi period." },
        { status: 409 }
      );
    }

    const id = crypto.randomUUID();
    const confirmToken = crypto.randomUUID();
    const cancelToken = crypto.randomUUID();

    const booking = {
      id,
      car_name: car.name,
      car_img: carImg,
      pickup_date: pickupDate,
      return_date: returnDate,
      days: pricing.quote.days,
      pickup_location: BOOKING_LOCATION,
      customer_name: normalizedName,
      customer_phone: normalizedPhone,
      customer_email: normalizedEmail,
      contact_preference: contactPreference,
      total_price: pricing.quote.totalPrice,
      confirm_token: confirmToken,
      cancel_token: cancelToken,
      created_at: new Date().toISOString(),
    };

    // Save to DB first — always succeeds
    db.createBooking(booking);

    // Send email — if it fails, booking is still saved
    try {
      await sendConfirmEmail({ ...booking, status: "pending" });
    } catch (emailErr) {
      console.error("[EMAIL] Failed to send confirmation email:", emailErr);
      return NextResponse.json({
        success: true,
        emailWarning: "Rezervacija je primljena, ali slanje emaila nije uspjelo. Kontaktirajte nas direktno.",
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Booking error:", err);
    return NextResponse.json({ error: "Interna greška servera." }, { status: 500 });
  }
}
