import { cookies } from "next/headers";
import { createHash, createHmac } from "crypto";
import bcrypt from "bcryptjs";
import { getSupabase } from "./supabase";
import type { User } from "./types";

const SESSION_COOKIE = "session";
const ADMIN_COOKIE = "admin_session";

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET environment variable is required");
  return secret;
}

function sign(payload: string): string {
  const hmac = createHmac("sha256", getSessionSecret());
  hmac.update(payload);
  return hmac.digest("hex");
}

function encode(obj: Record<string, unknown>): string {
  const json = JSON.stringify(obj);
  const encoded = Buffer.from(json).toString("base64");
  const sig = sign(encoded);
  return `${encoded}.${sig}`;
}

function decode(str: string): Record<string, unknown> | null {
  const parts = str.split(".");
  if (parts.length !== 2) return null;
  const [encoded, sig] = parts;
  const expectedSig = sign(encoded);
  if (!compareSignatures(sig, expectedSig)) return null;
  try {
    return JSON.parse(Buffer.from(encoded, "base64").toString());
  } catch {
    return null;
  }
}

function compareSignatures(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return createHmac("sha256", getSessionSecret())
    .update(a)
    .digest() === createHmac("sha256", getSessionSecret())
    .update(b)
    .digest();
}

export type Session = { userId: string; userName: string } | null;
export type AdminSession = { isAdmin: true } | null;

export async function getSession(): Promise<Session> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  const data = decode(raw);
  if (!data?.userId || !data?.userName) return null;
  return { userId: data.userId as string, userName: data.userName as string };
}

export async function setSession(userId: string, userName: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, encode({ userId, userName }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getAdminSession(): Promise<AdminSession> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(ADMIN_COOKIE)?.value;
  if (!raw) return null;
  const data = decode(raw);
  return data?.isAdmin ? { isAdmin: true } : null;
}

export async function setAdminSession() {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, encode({ isAdmin: true }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE);
}

export async function hashCode(code: string): Promise<string> {
  return bcrypt.hash(code, 10);
}

export async function verifyCode(code: string, hash: string): Promise<boolean> {
  return bcrypt.compare(code, hash);
}

export async function registerUser(name: string, code: string) {
  const supabase = getSupabase();
  const hashedCode = await hashCode(code);
  const { data, error } = await supabase
    .from("users")
    .insert({ name, code: hashedCode })
    .select("id, name")
    .single();

  if (error) {
    if (error.code === "23505") return { error: "A user with this name already exists" };
    return { error: "Registration failed. Please try again." };
  }

  if (!data) return { error: "Registration failed. Please try again." };
  return { user: data as unknown as { id: string; name: string } };
}

export async function loginUser(name: string, code: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("users")
    .select("id, name, code")
    .eq("name", name)
    .single();

  if (error || !data) return { error: "Invalid name or code" };

  const valid = await verifyCode(code, (data as unknown as { code: string }).code);
  if (!valid) return { error: "Invalid name or code" };

  return { user: { id: (data as unknown as { id: string }).id, name: (data as unknown as { name: string }).name } };
}
