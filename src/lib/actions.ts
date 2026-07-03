"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getSupabase } from "./supabase";
import {
  registerUser,
  loginUser,
  setSession,
  setAdminSession,
  getSession,
  getAdminSession,
} from "./auth";

export async function registerAction(formData: FormData) {
  const name = (formData.get("name") as string)?.trim();
  const code = formData.get("code") as string;
  const confirm = formData.get("confirm") as string;

  if (!name || !code || !confirm) return { error: "All fields are required" };
  if (name.length < 2) return { error: "Name must be at least 2 characters" };
  if (!/^\d{4}$/.test(code)) return { error: "Code must be exactly 4 digits" };
  if (code !== confirm) return { error: "Codes do not match" };

  const result = await registerUser(name, code);
  if (result.error) return { error: result.error };

  await setSession(result.user!.id, result.user!.name);
  redirect("/submit");
}

export async function loginAction(formData: FormData) {
  const name = (formData.get("name") as string)?.trim();
  const code = formData.get("code") as string;

  if (!name || !code) return { error: "Both fields are required" };
  if (!/^\d{4}$/.test(code)) return { error: "Code must be exactly 4 digits" };

  const result = await loginUser(name, code);
  if (result.error) return { error: result.error };

  await setSession(result.user!.id, result.user!.name);
  redirect("/submit");
}

export async function submitTicketAction(formData: FormData) {
  const session = await getSession();
  if (!session) return { error: "Not authenticated" };

  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const category = formData.get("category") as string;
  const priority = formData.get("priority") as string;

  if (!title || !description || !category || !priority) {
    return { error: "All fields are required" };
  }

  const validCategories = ["Bug", "Feature Request", "Support", "Other"];
  const validPriorities = ["Low", "Medium", "High", "Critical"];

  if (!validCategories.includes(category)) return { error: "Invalid category" };
  if (!validPriorities.includes(priority)) return { error: "Invalid priority" };

  const supabase = getSupabase();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("tickets") as any).insert({
    user_id: session.userId,
    title,
    description,
    category,
    priority,
  });

  if (error) return { error: "Failed to submit ticket. Please try again." };

  revalidatePath("/submit");
  return { success: true };
}

export async function adminLoginAction(formData: FormData) {
  const password = formData.get("password") as string;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) return { error: "Admin password not configured" };
  if (password !== adminPassword) return { error: "Invalid password" };

  await setAdminSession();
  redirect("/admin/tickets");
}

export async function getUserTicketsAction() {
  const session = await getSession();
  if (!session) return { tickets: [] };

  const supabase = getSupabase();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase.from("tickets") as any)
    .select("*")
    .eq("user_id", session.userId)
    .order("created_at", { ascending: false });

  return { tickets: data ?? [] };
}

export async function adminLogoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
  redirect("/");
}

export async function userLogoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
  redirect("/");
}

export async function updateTicketStatusAction(ticketId: string, status: string) {
  const session = await getAdminSession();
  if (!session) return { error: "Not authorized" };

  const validStatuses = ["Open", "In Progress", "Resolved"];
  if (!validStatuses.includes(status)) return { error: "Invalid status" };

  const supabase = getSupabase();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("tickets") as any)
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", ticketId);

  if (error) return { error: "Failed to update status" };

  revalidatePath("/admin/tickets");
  return { success: true };
}
