import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE = "handels_user";
const YEAR = 60 * 60 * 24 * 365;

function secret(): string {
  return process.env.SESSION_SECRET || "dev-only-change-me";
}

function macFor(id: string): string {
  return createHmac("sha256", secret()).update(id).digest("base64url");
}

function readId(token: string | undefined): number | null {
  if (!token) return null;
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;
  const id = token.slice(0, dot);
  const mac = token.slice(dot + 1);
  const expected = macFor(id);
  const actualBuffer = Buffer.from(mac);
  const expectedBuffer = Buffer.from(expected);
  if (actualBuffer.length !== expectedBuffer.length || !timingSafeEqual(actualBuffer, expectedBuffer)) {
    return null;
  }
  const parsed = Number(id);
  if (!Number.isInteger(parsed) || parsed <= 0) return null;
  return parsed;
}

export async function readSessionUserId(): Promise<number | null> {
  const jar = await cookies();
  return readId(jar.get(COOKIE)?.value);
}

export async function setSession(userId: number): Promise<void> {
  const jar = await cookies();
  jar.set(COOKIE, `${userId}.${macFor(String(userId))}`, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: YEAR,
    secure: process.env.COOKIE_SECURE === "true",
  });
}

export async function clearSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE);
}
