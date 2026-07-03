import { cookies } from "next/headers";
import { getSupabase } from "./supabase";

const SESSION_COOKIE = "session";
const ADMIN_COOKIE = "admin_session";

export type Session = { userId: string; userName: string } | null;
export type AdminSession = { isAdmin: true } | null;

function encode(obj: Record<string, unknown>) {
  return Buffer.from(JSON.stringify(obj)).toString("base64");
}

function decode(str: string): Record<string, unknown> | null {
  try {
    return JSON.parse(Buffer.from(str, "base64").toString());
  } catch {
    return null;
  }
}

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

export async function registerUser(name: string, code: string) {
  const supabase = getSupabase();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from("users") as any)
    .insert({ name, code })
    .select("id, name")
    .single() as { data: { id: string; name: string } | null; error: any };

  if (error) {
    if (error.code === "23505") return { error: "A user with this name already exists" };
    return { error: "Registration failed. Please try again." };
  }

  if (!data) return { error: "Registration failed. Please try again." };
  return { user: data };
}

export async function loginUser(name: string, code: string) {
  const supabase = getSupabase();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from("users") as any)
    .select("id, name")
    .eq("name", name)
    .eq("code", code)
    .single() as { data: { id: string; name: string } | null; error: any };

  if (error || !data) return { error: "Invalid name or code" };
  return { user: data };
}
