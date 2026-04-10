import { getCarByImg } from "./carData";
import type { Car } from "./types";

export const BOOKING_LOCATION = "Banjaluka";
export const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
export const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/;
export const PHONE_RE = /^[0-9+()\/\-\s]{6,30}$/;

export type PricingMode = "standard" | "discount" | "quote";

export interface PriceQuote {
  days: number;
  pricingMode: PricingMode;
  pricePerDay: number | null;
  totalPrice: number | null;
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function parseDateParts(value: string): { year: number; month: number; day: number } | null {
  if (!DATE_RE.test(value)) {
    return null;
  }

  const [yearStr, monthStr, dayStr] = value.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);

  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day) ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31
  ) {
    return null;
  }

  const candidate = new Date(Date.UTC(year, month - 1, day));
  if (
    candidate.getUTCFullYear() !== year ||
    candidate.getUTCMonth() !== month - 1 ||
    candidate.getUTCDate() !== day
  ) {
    return null;
  }

  return { year, month, day };
}

export function isValidDateString(value: string): boolean {
  return parseDateParts(value) !== null;
}

export function parseDateString(value: string): Date | null {
  const parts = parseDateParts(value);
  if (!parts) {
    return null;
  }

  return new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
}

export function toDateString(date: Date): string {
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

export function shiftDate(value: string, amount: number): string | null {
  const date = parseDateString(value);
  if (!date) {
    return null;
  }

  date.setUTCDate(date.getUTCDate() + amount);
  return toDateString(date);
}

export function getTodayDateString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export function diffDays(start: string, end: string): number {
  const startDate = parseDateString(start);
  const endDate = parseDateString(end);

  if (!startDate || !endDate) {
    return 0;
  }

  return Math.round((endDate.getTime() - startDate.getTime()) / 86400000);
}

export function isFutureOrToday(value: string): boolean {
  return isValidDateString(value) && value >= getTodayDateString();
}

export function isDateRangeValid(start: string, end: string): boolean {
  if (!isValidDateString(start) || !isValidDateString(end)) {
    return false;
  }

  return diffDays(start, end) > 0;
}

export function enumerateDateStrings(start: string, end: string): string[] {
  const startDate = parseDateString(start);
  const endDate = parseDateString(end);

  if (!startDate || !endDate || startDate.getTime() > endDate.getTime()) {
    return [];
  }

  const dates: string[] = [];
  const current = new Date(startDate.getTime());

  while (current.getTime() <= endDate.getTime()) {
    dates.push(toDateString(current));
    current.setUTCDate(current.getUTCDate() + 1);
  }

  return dates;
}

export function formatDate(value?: string | null): string {
  if (!value || !isValidDateString(value)) {
    return "-";
  }

  const [year, month, day] = value.split("-");
  return `${day}.${month}.${year}.`;
}

export function normalizeName(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

export function normalizePhone(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function isValidPhone(value: string): boolean {
  return PHONE_RE.test(normalizePhone(value));
}

export function calculateBookingPrice(car: Car, days: number): PriceQuote {
  if (days > 7) {
    return {
      days,
      pricingMode: "quote",
      pricePerDay: null,
      totalPrice: null,
    };
  }

  if (days >= 4) {
    return {
      days,
      pricingMode: "discount",
      pricePerDay: car.price2,
      totalPrice: car.price2 * days,
    };
  }

  return {
    days,
    pricingMode: "standard",
    pricePerDay: car.price1,
    totalPrice: car.price1 * days,
  };
}

export function getQuoteForCar(carImg: string, pickupDate: string, returnDate: string) {
  const car = getCarByImg(carImg);
  if (!car || !isDateRangeValid(pickupDate, returnDate)) {
    return null;
  }

  const days = diffDays(pickupDate, returnDate);
  return {
    car,
    quote: calculateBookingPrice(car, days),
  };
}

export function hasBlockedDates(
  blockedDates: string[],
  pickupDate: string,
  returnDate: string
): boolean {
  if (!isDateRangeValid(pickupDate, returnDate)) {
    return false;
  }

  const blockedSet = new Set(blockedDates);
  return enumerateDateStrings(pickupDate, returnDate).some((date) => blockedSet.has(date));
}
