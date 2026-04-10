import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";

export const ADMIN_COOKIE_NAME = "admin_auth";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

function safeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

export function isAdminConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD && process.env.ADMIN_SESSION_SECRET);
}

function signSession(expiresAt: string): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    return "";
  }

  return createHmac("sha256", secret)
    .update(`admin:${expiresAt}`)
    .digest("hex");
}

export function verifyAdminPassword(input: string): boolean {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    return false;
  }

  return safeEqual(input, password);
}

export function createAdminSessionValue(now = Date.now()): string | null {
  if (!isAdminConfigured()) {
    return null;
  }

  const expiresAt = String(now + SESSION_TTL_SECONDS * 1000);
  const signature = signSession(expiresAt);
  return `${expiresAt}.${signature}`;
}

export function isValidAdminSession(value: string | undefined): boolean {
  if (!value || !isAdminConfigured()) {
    return false;
  }

  const [expiresAt, signature] = value.split(".");
  if (!expiresAt || !signature || !/^\d+$/.test(expiresAt)) {
    return false;
  }

  if (Number(expiresAt) < Date.now()) {
    return false;
  }

  const expectedSignature = signSession(expiresAt);
  return safeEqual(signature, expectedSignature);
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const jar = await cookies();
  return isValidAdminSession(jar.get(ADMIN_COOKIE_NAME)?.value);
}
