import React from "react";
import Link from "next/link";
import db from "@/lib/db";
import { formatDate } from "@/lib/booking";

interface PageProps {
  searchParams: Promise<{ status?: string; action?: string; token?: string }>;
}

export default async function BookingActionPage({ searchParams }: PageProps) {
  const { status, action, token } = await searchParams;

  const booking =
    action === "confirm" && token
      ? db.getBookingByToken(token)
      : action === "cancel" && token
        ? db.getBookingByCancelToken(token)
        : undefined;

  const isSuccess = status === "success";
  const isCancelled = status === "cancelled";
  const isUnavailable = status === "unavailable";
  const canConfirm = action === "confirm" && booking?.status === "pending";
  const canCancel = action === "cancel" && booking?.status === "confirmed";
  const showActionCard = !status && token && (canConfirm || canCancel);
  const borderColor = isSuccess
    ? "var(--yellow-bar)"
    : isCancelled || isUnavailable
      ? "#ff6600"
      : showActionCard
        ? "var(--yellow-bar)"
        : "#ff4444";

  const priceText =
    booking?.total_price != null ? `${booking.total_price} KM` : "Cijena po dogovoru";
  const actionEndpoint = canConfirm ? "/api/booking/confirm" : "/api/booking/cancel";

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 0",
      }}
    >
      <div
        style={{
          background: "#111114",
          border: `3px solid ${borderColor}`,
          borderRadius: 10,
          padding: "48px 40px",
          maxWidth: 560,
          width: "90%",
          textAlign: "center",
        }}
      >
        {showActionCard && booking ? (
          <>
            <div style={{ fontSize: 56, marginBottom: 16 }}>{canConfirm ? "?" : "!"}</div>
            <h1
              style={{
                fontFamily: "Impact, sans-serif",
                fontSize: 38,
                color: "var(--yellow-bar)",
                letterSpacing: 1,
                transform: "scaleX(0.88)",
                display: "inline-block",
                marginBottom: 16,
              }}
            >
              {canConfirm ? "POTVRDITE REZERVACIJU" : "OTKAZITE REZERVACIJU"}
            </h1>
            <p
              style={{
                fontFamily: "Arial, sans-serif",
                color: "#ccc",
                fontSize: 15,
                lineHeight: 1.7,
                marginBottom: 24,
              }}
            >
              {canConfirm
                ? "Pregledajte detalje ispod i finalno potvrdite rezervaciju."
                : "Otkazivanje odmah oslobadja termin i zaustavlja ovu rezervaciju."}
            </p>

            <div
              style={{
                textAlign: "left",
                border: "1px solid rgba(255, 204, 0, 0.2)",
                background: "rgba(255, 204, 0, 0.06)",
                borderRadius: 8,
                padding: 18,
                marginBottom: 24,
                fontFamily: "Arial, sans-serif",
                color: "#ddd",
                lineHeight: 1.8,
              }}
            >
              <p>
                <strong style={{ color: "#fff" }}>Auto:</strong> {booking.car_name ?? "-"}
              </p>
              <p>
                <strong style={{ color: "#fff" }}>Period:</strong>{" "}
                {formatDate(booking.pickup_date)} - {formatDate(booking.return_date)} (
                {booking.days ?? 0} dana)
              </p>
              <p>
                <strong style={{ color: "#fff" }}>Cijena:</strong> {priceText}
              </p>
              <p>
                <strong style={{ color: "#fff" }}>Kontakt:</strong> {booking.customer_name} /{" "}
                {booking.customer_phone}
              </p>
            </div>

            <form action={actionEndpoint} method="post" style={{ marginBottom: 18 }}>
              <input type="hidden" name="token" value={token} />
              <button
                type="submit"
                style={{
                  width: "100%",
                  border: "none",
                  borderRadius: 8,
                  background: canConfirm
                    ? "linear-gradient(180deg, #ffcc00 0%, #ff5500 100%)"
                    : "linear-gradient(180deg, #ff7a00 0%, #c53b00 100%)",
                  color: "#000",
                  padding: "14px 20px",
                  fontFamily: "Impact, sans-serif",
                  fontSize: 24,
                  letterSpacing: 1,
                  cursor: "pointer",
                }}
              >
                {canConfirm ? "POTVRDI REZERVACIJU" : "OTKAZI REZERVACIJU"}
              </button>
            </form>
          </>
        ) : isSuccess ? (
          <>
            <div style={{ fontSize: 64, marginBottom: 16 }}>OK</div>
            <h1
              style={{
                fontFamily: "Impact, sans-serif",
                fontSize: 42,
                color: "var(--yellow-bar)",
                letterSpacing: 1,
                transform: "scaleX(0.88)",
                display: "inline-block",
                marginBottom: 16,
              }}
            >
              REZERVACIJA POTVRDJENA
            </h1>
            <p
              style={{
                fontFamily: "Arial, sans-serif",
                color: "#ccc",
                fontSize: 15,
                lineHeight: 1.7,
                marginBottom: 28,
              }}
            >
              Vasa rezervacija je uspjesno potvrdjena.
              <br />
              Kontaktiracemo Vas uskoro sa detaljima.
            </p>
          </>
        ) : isCancelled ? (
          <>
            <div style={{ fontSize: 64, marginBottom: 16 }}>X</div>
            <h1
              style={{
                fontFamily: "Impact, sans-serif",
                fontSize: 42,
                color: "#ff6600",
                letterSpacing: 1,
                transform: "scaleX(0.88)",
                display: "inline-block",
                marginBottom: 16,
              }}
            >
              REZERVACIJA OTKAZANA
            </h1>
            <p
              style={{
                fontFamily: "Arial, sans-serif",
                color: "#ccc",
                fontSize: 15,
                lineHeight: 1.7,
                marginBottom: 28,
              }}
            >
              Rezervacija je uspjesno otkazana i termin je ponovo slobodan.
            </p>
          </>
        ) : isUnavailable ? (
          <>
            <div style={{ fontSize: 64, marginBottom: 16 }}>!</div>
            <h1
              style={{
                fontFamily: "Impact, sans-serif",
                fontSize: 38,
                color: "#ff6600",
                letterSpacing: 1,
                transform: "scaleX(0.88)",
                display: "inline-block",
                marginBottom: 16,
              }}
            >
              TERMIN VISE NIJE DOSTUPAN
            </h1>
            <p
              style={{
                fontFamily: "Arial, sans-serif",
                color: "#ccc",
                fontSize: 15,
                lineHeight: 1.7,
                marginBottom: 28,
              }}
            >
              Neko je u medjuvremenu potvrdio isti period.
              <br />
              Vratite se na pocetnu i odaberite drugi termin.
            </p>
          </>
        ) : (
          <>
            <div style={{ fontSize: 64, marginBottom: 16 }}>X</div>
            <h1
              style={{
                fontFamily: "Impact, sans-serif",
                fontSize: 42,
                color: "#ff4444",
                letterSpacing: 1,
                transform: "scaleX(0.88)",
                display: "inline-block",
                marginBottom: 16,
              }}
            >
              NEVAZECI LINK
            </h1>
            <p
              style={{
                fontFamily: "Arial, sans-serif",
                color: "#ccc",
                fontSize: 15,
                lineHeight: 1.7,
                marginBottom: 28,
              }}
            >
              Ovaj link vise nije vazeci ili je vec iskoristen.
            </p>
          </>
        )}

        <Link
          href="/"
          style={{
            display: "inline-block",
            background: "linear-gradient(180deg, #ffcc00 0%, #ff5500 100%)",
            color: "#000",
            padding: "12px 32px",
            borderRadius: 8,
            fontFamily: "Impact, sans-serif",
            fontSize: 22,
            textDecoration: "none",
            letterSpacing: 1,
          }}
        >
          NAZAD NA POCETNU
        </Link>
      </div>
    </div>
  );
}
