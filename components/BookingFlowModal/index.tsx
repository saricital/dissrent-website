"use client";

import React, { useEffect, useState } from "react";
import DatePicker from "../DatePicker";
import type { BookingContext } from "@/lib/types";
import {
  EMAIL_RE,
  calculateBookingPrice,
  diffDays,
  formatDate,
  getTodayDateString,
  hasBlockedDates,
  isDateRangeValid,
  isValidPhone,
  normalizeEmail,
  normalizeName,
  normalizePhone,
  shiftDate,
} from "@/lib/booking";
import {
  Overlay,
  Modal,
  CloseX,
  Title,
  Subtitle,
  Steps,
  Step,
  SummaryBox,
  SummaryLine,
  Notice,
  DateRow,
  Field,
  Label,
  Input,
  ContactLabel,
  RadioGroup,
  RadioOption,
  RadioInput,
  RadioIcon,
  RadioText,
  ErrorText,
  ConfirmButton,
  SuccessBox,
  SuccessTitle,
  SuccessText,
} from "./styles";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  bookingContext?: BookingContext;
}

function getPriceSummary(ctx?: BookingContext, pickupDate?: string, returnDate?: string) {
  if (!ctx?.price1 || !ctx?.price2 || !pickupDate || !returnDate || !isDateRangeValid(pickupDate, returnDate)) {
    return { days: 0, totalPrice: null as number | null, pricingMode: "quote" as const };
  }

  const days = diffDays(pickupDate, returnDate);
  const quote = calculateBookingPrice(
    { name: ctx.carName ?? "", img: ctx.carImg ?? "", price1: ctx.price1, price2: ctx.price2 },
    days
  );

  return {
    days,
    totalPrice: quote.totalPrice,
    pricingMode: quote.pricingMode,
  };
}

export default function BookingFlowModal({ isOpen, onClose, bookingContext }: Props) {
  const [contact, setContact] = useState("viber");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [blockedDates, setBlockedDates] = useState<string[]>([]);

  const today = getTodayDateString();
  const needsDates = !bookingContext?.pickupDate || !bookingContext?.returnDate;
  const effectivePickupDate = bookingContext?.pickupDate ?? pickupDate;
  const effectiveReturnDate = bookingContext?.returnDate ?? returnDate;
  const priceSummary = getPriceSummary(bookingContext, effectivePickupDate, effectiveReturnDate);
  const firstBlockedAfterPickup = pickupDate ? blockedDates.find((date) => date > pickupDate) : undefined;
  const returnMaxDate = firstBlockedAfterPickup ? shiftDate(firstBlockedAfterPickup, -1) ?? undefined : undefined;
  const returnMinDate = pickupDate ? shiftDate(pickupDate, 1) ?? today : today;
  const liveConflict =
    effectivePickupDate &&
    effectiveReturnDate &&
    hasBlockedDates(blockedDates, effectivePickupDate, effectiveReturnDate);

  useEffect(() => {
    if (!isOpen || !bookingContext?.carImg) {
      setBlockedDates([]);
      return;
    }

    fetch(`/api/availability?carImg=${encodeURIComponent(bookingContext.carImg)}`)
      .then((response) => response.json())
      .then((data) => setBlockedDates(data.blockedDates ?? []))
      .catch(() => setBlockedDates([]));
  }, [isOpen, bookingContext?.carImg]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setContact("viber");
        setName("");
        setPhone("");
        setEmail("");
        setSubmitting(false);
        setSuccess(false);
        setError("");
        setPickupDate("");
        setReturnDate("");
        setBlockedDates([]);
      }, 250);
    }
  }, [isOpen]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  async function handleSubmit() {
    const normalizedName = normalizeName(name);
    const normalizedPhone = normalizePhone(phone);
    const normalizedEmail = normalizeEmail(email);

    if (!bookingContext?.carImg) {
      setError("Automobil nije pravilno odabran. Zatvorite prozor i pokusajte ponovo.");
      return;
    }

    if (!effectivePickupDate || !effectiveReturnDate || !isDateRangeValid(effectivePickupDate, effectiveReturnDate)) {
      setError("Odaberite ispravan datum preuzimanja i datum povratka.");
      return;
    }

    if (liveConflict) {
      setError("Ovaj termin je u medjuvremenu zauzet. Izaberite drugi period.");
      return;
    }

    if (normalizedName.length < 2) {
      setError("Unesite ime i prezime.");
      return;
    }

    if (!isValidPhone(normalizedPhone)) {
      setError("Unesite ispravan broj telefona.");
      return;
    }

    if (!EMAIL_RE.test(normalizedEmail)) {
      setError("Unesite ispravnu email adresu.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: normalizedName,
          customerPhone: normalizedPhone,
          customerEmail: normalizedEmail,
          contactPreference: contact,
          carImg: bookingContext.carImg,
          pickupDate: effectivePickupDate,
          returnDate: effectiveReturnDate,
        }),
      });

      if (response.ok) {
        const data = await response.json().catch(() => ({}));
        if (data.emailWarning) {
          setError(data.emailWarning);
        }
        setSuccess(true);
        return;
      }

      const data = await response.json().catch(() => ({}));
      setError(data.error ?? "Doslo je do greske. Pokusajte ponovo.");
    } catch {
      setError("Doslo je do greske. Provjerite internet vezu.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Overlay
      $open={isOpen}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <Modal $open={isOpen}>
        <CloseX onClick={onClose} aria-label="Zatvori rezervaciju">
          &times;
        </CloseX>

        {success ? (
          <SuccessBox>
            <SuccessTitle>REZERVACIJA PRIMLJENA</SuccessTitle>
            <SuccessText>
              Poslali smo email na <strong>{email}</strong>.
              <br />
              Rezervacija postaje vazeca tek nakon potvrde linka iz email poruke.
            </SuccessText>
          </SuccessBox>
        ) : (
          <>
            <Title>ZAVRSI REZERVACIJU</Title>
            <Subtitle>
              Tok je sada jednostavan: pregled termina, kontakt podaci i finalna potvrda preko emaila.
            </Subtitle>

            <Steps>
              <Step $active>{bookingContext?.carName ?? "AUTO"}</Step>
              <Step $active={!needsDates || pickupDate !== ""}>TERMIN</Step>
              <Step $active={name !== "" || phone !== "" || email !== ""}>KONTAKT</Step>
            </Steps>

            <SummaryBox>
              <SummaryLine>
                <span>Automobil</span>
                <strong>{bookingContext?.carName ?? "-"}</strong>
              </SummaryLine>
              <SummaryLine>
                <span>Termin</span>
                <strong>
                  {effectivePickupDate && effectiveReturnDate
                    ? `${formatDate(effectivePickupDate)} - ${formatDate(effectiveReturnDate)}`
                    : "Odaberite datume"}
                </strong>
              </SummaryLine>
              <SummaryLine>
                <span>Trajanje</span>
                <strong>{priceSummary.days > 0 ? `${priceSummary.days} dana` : "-"}</strong>
              </SummaryLine>
              <SummaryLine>
                <span>Cijena</span>
                <strong>
                  {priceSummary.days === 0
                    ? "-"
                    : priceSummary.totalPrice == null
                      ? "Cijena po dogovoru"
                      : `${priceSummary.totalPrice} KM`}
                </strong>
              </SummaryLine>
            </SummaryBox>

            <Notice>
              Ako je termin zauzet u trenutku slanja, odmah cete dobiti jasnu poruku i necemo napraviti
              losu rezervaciju.
            </Notice>

            {needsDates && (
              <DateRow>
                <div>
                  <Label as="span">DATUM PREUZIMANJA</Label>
                  <DatePicker
                    key={`modal-pickup-${pickupDate || today}`}
                    value={pickupDate}
                    onChange={(date) => {
                      setPickupDate(date);
                      setError("");
                      if (returnDate && returnDate <= date) {
                        setReturnDate("");
                      }
                    }}
                    placeholder="Odaberite datum"
                    minDate={today}
                    rangeStart={pickupDate}
                    rangeEnd={returnDate}
                    blockedDates={blockedDates}
                  />
                </div>
                <div>
                  <Label as="span">DATUM POVRATKA</Label>
                  <DatePicker
                    key={`modal-return-${returnDate || returnMinDate}`}
                    value={returnDate}
                    onChange={(date) => {
                      setReturnDate(date);
                      setError("");
                    }}
                    placeholder="Odaberite datum"
                    minDate={returnMinDate}
                    maxDate={returnMaxDate}
                    rangeStart={pickupDate}
                    rangeEnd={returnDate}
                    blockedDates={blockedDates}
                  />
                </div>
              </DateRow>
            )}

            <Field>
              <Label htmlFor="booking-name">IME I PREZIME</Label>
              <Input
                id="booking-name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </Field>

            <Field>
              <Label htmlFor="booking-phone">BROJ TELEFONA</Label>
              <Input
                id="booking-phone"
                type="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
              />
            </Field>

            <Field>
              <Label htmlFor="booking-email">EMAIL</Label>
              <Input
                id="booking-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </Field>

            <ContactLabel>NACIN KONTAKTA</ContactLabel>
            <RadioGroup>
              <RadioOption>
                <RadioInput
                  type="radio"
                  name="contact"
                  value="viber"
                  checked={contact === "viber"}
                  onChange={() => setContact("viber")}
                />
                <RadioIcon className="fa-brands fa-viber" />
                <RadioText>Viber</RadioText>
              </RadioOption>
              <RadioOption>
                <RadioInput
                  type="radio"
                  name="contact"
                  value="sms"
                  checked={contact === "sms"}
                  onChange={() => setContact("sms")}
                />
                <RadioIcon className="fa-regular fa-comment-dots" />
                <RadioText>SMS</RadioText>
              </RadioOption>
            </RadioGroup>

            {error && <ErrorText>{error}</ErrorText>}

            <ConfirmButton type="button" onClick={handleSubmit} disabled={submitting}>
              {submitting
                ? "SALJEM..."
                : priceSummary.totalPrice == null && priceSummary.days > 7
                  ? "POSALJI UPIT"
                  : "POSALJI REZERVACIJU"}
            </ConfirmButton>
          </>
        )}
      </Modal>
    </Overlay>
  );
}
