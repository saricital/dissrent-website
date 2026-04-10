import { Resend } from "resend";
import type { Booking } from "./db";

function getResendClient(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured.");
  }

  return new Resend(apiKey);
}

function from(): string {
  const addr = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";
  return `DISS RENT <${addr}>`;
}

function formatDate(s: string | null): string {
  if (!s) return "—";
  const [y, m, d] = s.split("-");
  return `${d}.${m}.${y}.`;
}

/** Prevent HTML injection from user-supplied strings in email templates. */
function esc(str: string | null | undefined): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

export async function sendConfirmEmail(booking: Booking): Promise<void> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  const confirmUrl = `${baseUrl}/booking-action?action=confirm&token=${booking.confirm_token}`;

  const carInfo = booking.car_name
    ? `<p><strong>Auto:</strong> ${esc(booking.car_name)}</p>`
    : "";
  const dateInfo =
    booking.pickup_date && booking.return_date
      ? `<p><strong>Period:</strong> ${esc(formatDate(booking.pickup_date))} – ${esc(formatDate(booking.return_date))} (${Number(booking.days) || 0} dana)</p>`
      : "";
  const priceInfo = booking.total_price
    ? `<p><strong>Ukupna cijena:</strong> ${Number(booking.total_price)} KM</p>`
    : "";

  const toEmail = process.env.TEST_EMAIL_OVERRIDE ?? booking.customer_email;
  console.log(`[EMAIL] Sending confirm email FROM=${from()} TO=${toEmail}${process.env.TEST_EMAIL_OVERRIDE ? ` (TEST override from ${esc(booking.customer_email)})` : ""}`);
  const result = await getResendClient().emails.send({
    from: from(),
    to: toEmail,
    subject: "Potvrdi rezervaciju — DISS RENT",
    html: `
      <div style="font-family:Arial,sans-serif;background:#1a1a1e;color:#fff;padding:32px;border-radius:10px;max-width:560px">
        <h1 style="color:#ffcc00;font-family:Impact,sans-serif;letter-spacing:1px">DISS RENT</h1>
        <h2 style="color:#fff;margin-top:0">Potvrda rezervacije</h2>
        <p>Zdravo <strong>${esc(booking.customer_name)}</strong>,</p>
        <p>Primili smo Vaš zahtjev za rezervaciju. Molimo Vas da potvrdite klikom na dugme ispod.</p>
        <hr style="border-color:#333;margin:24px 0"/>
        ${carInfo}
        ${dateInfo}
        ${priceInfo}
        <p><strong>Lokacija preuzimanja:</strong> ${esc(booking.pickup_location ?? "Banjaluka")}</p>
        <p><strong>Kontakt:</strong> ${esc(booking.customer_phone)} (${esc(booking.contact_preference)})</p>
        <hr style="border-color:#333;margin:24px 0"/>
        <a href="${confirmUrl}" style="display:inline-block;background:linear-gradient(180deg,#ffcc00 0%,#ff5500 100%);color:#000;padding:16px 32px;border-radius:8px;font-family:Impact,sans-serif;font-size:20px;text-decoration:none;letter-spacing:1px">
          POTVRDI REZERVACIJU
        </a>
        <p style="color:#888;font-size:12px;margin-top:24px">Ako niste zatražili ovu rezervaciju, ignorišite ovaj email.</p>
      </div>
    `,
  });

  console.log(`[EMAIL] Resend response:`, JSON.stringify(result));
  if (result.error) {
    console.error("[RESEND] sendConfirmEmail error:", result.error);
    throw new Error(result.error.message);
  }
  console.log(`[EMAIL] Confirm email sent OK, id=${result.data?.id}`);
}

export async function sendAdminEmail(booking: Booking): Promise<void> {
  const adminEmail = process.env.TEST_EMAIL_OVERRIDE ?? process.env.ADMIN_EMAIL;
  if (!adminEmail) return;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  const cancelUrl = `${baseUrl}/booking-action?action=cancel&token=${booking.cancel_token}`;
  const contactPref = booking.contact_preference === "viber" ? "Viber" : "SMS";

  const result = await getResendClient().emails.send({
    from: from(),
    to: adminEmail,
    subject: `Nova rezervacija — ${esc(booking.car_name ?? "DISS RENT")}`,
    html: `
      <div style="font-family:Arial,sans-serif;background:#1a1a1e;color:#fff;padding:32px;border-radius:10px;max-width:560px">
        <h1 style="color:#ffcc00;font-family:Impact,sans-serif;letter-spacing:1px">NOVA POTVRĐENA REZERVACIJA</h1>
        <hr style="border-color:#ffcc00;margin:16px 0"/>
        <table style="width:100%;border-collapse:collapse;font-size:15px">
          <tr><td style="padding:8px 0;color:#aaa;width:160px">Auto</td><td style="color:#fff"><strong>${esc(booking.car_name ?? "—")}</strong></td></tr>
          <tr><td style="padding:8px 0;color:#aaa">Period</td><td style="color:#fff">${esc(formatDate(booking.pickup_date))} – ${esc(formatDate(booking.return_date))} <strong>(${Number(booking.days) || 0} dana)</strong></td></tr>
          <tr><td style="padding:8px 0;color:#aaa">Ukupna cijena</td><td style="color:#ffcc00;font-size:18px"><strong>${booking.total_price ? Number(booking.total_price) + " KM" : "Po dogovoru"}</strong></td></tr>
          <tr><td style="padding:8px 0;color:#aaa">Lokacija</td><td style="color:#fff">${esc(booking.pickup_location ?? "Banjaluka")}</td></tr>
          <tr><td style="padding:8px 0;color:#aaa">Ime i prezime</td><td style="color:#fff"><strong>${esc(booking.customer_name)}</strong></td></tr>
          <tr><td style="padding:8px 0;color:#aaa">Telefon</td><td style="color:#fff">${esc(booking.customer_phone)}</td></tr>
          <tr><td style="padding:8px 0;color:#aaa">Email</td><td style="color:#fff">${esc(booking.customer_email)}</td></tr>
          <tr><td style="padding:8px 0;color:#aaa">Kontakt</td><td style="color:#fff">${esc(contactPref)}</td></tr>
        </table>
        <hr style="border-color:#333;margin:24px 0"/>
        <a href="${cancelUrl}" style="display:inline-block;background:#cc0000;color:#fff;padding:14px 28px;border-radius:8px;font-family:Impact,sans-serif;font-size:18px;text-decoration:none;letter-spacing:1px">
          OTKAŽI REZERVACIJU
        </a>
        <p style="color:#888;font-size:12px;margin-top:16px">Klikom na dugme rezervacija se otkazuje i datumi se automatski oslobađaju.</p>
      </div>
    `,
  });

  if (result.error) {
    console.error("[RESEND] sendAdminEmail error:", result.error);
  }
}
