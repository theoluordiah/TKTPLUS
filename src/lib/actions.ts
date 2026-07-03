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
import { VALID_CATEGORIES, VALID_PRIORITIES, VALID_STATUSES } from "./types";

export async function registerAction(_prev: unknown, formData: FormData) {
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

export async function loginAction(_prev: unknown, formData: FormData) {
  const name = (formData.get("name") as string)?.trim();
  const code = formData.get("code") as string;

  if (!name || !code) return { error: "Both fields are required" };
  if (!/^\d{4}$/.test(code)) return { error: "Code must be exactly 4 digits" };

  const result = await loginUser(name, code);
  if (result.error) return { error: result.error };

  await setSession(result.user!.id, result.user!.name);
  redirect("/submit");
}

export async function submitTicketAction(_prev: unknown, formData: FormData) {
  const session = await getSession();
  if (!session) return { error: "Not authenticated" };

  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const category = formData.get("category") as string;
  const priority = formData.get("priority") as string;

  if (!title || !description || !category || !priority) {
    return { error: "All fields are required" };
  }

  if (!VALID_CATEGORIES.includes(category as never)) return { error: "Invalid category" };
  if (!VALID_PRIORITIES.includes(priority as never)) return { error: "Invalid priority" };

  const supabase = getSupabase();
  const { error } = await supabase
    .from("tickets")
    .insert({
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

export async function adminLoginAction(_prev: unknown, formData: FormData) {
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
  const { data } = await supabase
    .from("tickets")
    .select("*")
    .eq("user_id", session.userId)
    .order("created_at", { ascending: false });

  return { tickets: data ?? [] };
}

export async function getTicketByIdAction(ticketId: string) {
  const session = await getSession();
  if (!session) return { ticket: null };

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("tickets")
    .select("*, users(name)")
    .eq("id", ticketId)
    .single();

  if (error || !data) return { ticket: null };
  return { ticket: data };
}

export async function getCommentsAction(ticketId: string) {
  const session = await getSession();
  if (!session) return { comments: [] };

  const supabase = getSupabase();
  const { data } = await supabase
    .from("comments")
    .select("*, users(name)")
    .eq("ticket_id", ticketId)
    .order("created_at", { ascending: true });

  return { comments: data ?? [] };
}

export async function addCommentAction(_prev: unknown, formData: FormData) {
  const session = await getSession();
  if (!session) return { error: "Not authenticated" };

  const ticketId = formData.get("ticketId") as string;
  const content = (formData.get("content") as string)?.trim();

  if (!ticketId || !content) return { error: "All fields are required" };

  const supabase = getSupabase();
  const { error } = await supabase
    .from("comments")
    .insert({
      ticket_id: ticketId,
      user_id: session.userId,
      content,
    });

  if (error) return { error: "Failed to add comment. Please try again." };

  revalidatePath(`/tickets/${ticketId}`);
  return { success: true };
}

export async function getAllTicketsAction() {
  const session = await getAdminSession();
  if (!session) return { tickets: [], total: 0 };

  const supabase = getSupabase();
  const { data, count } = await supabase
    .from("tickets")
    .select("*, users(name)", { count: "exact" })
    .order("created_at", { ascending: false });

  return { tickets: data ?? [], total: count ?? 0 };
}

export async function getFilteredTicketsAction(params: {
  search?: string;
  status?: string;
  category?: string;
  priority?: string;
  page?: number;
  pageSize?: number;
}) {
  const session = await getAdminSession();
  if (!session) return { tickets: [], total: 0 };

  const { search, status, category, priority, page = 1, pageSize = 20 } = params;
  const supabase = getSupabase();

  let query = supabase
    .from("tickets")
    .select("*, users(name)", { count: "exact" });

  if (status && VALID_STATUSES.includes(status as never)) {
    query = query.eq("status", status);
  }
  if (category && VALID_CATEGORIES.includes(category as never)) {
    query = query.eq("category", category);
  }
  if (priority && VALID_PRIORITIES.includes(priority as never)) {
    query = query.eq("priority", priority);
  }
  if (search) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, count, error } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) return { tickets: [], total: 0 };
  return { tickets: data ?? [], total: count ?? 0 };
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

  if (!VALID_STATUSES.includes(status as never)) return { error: "Invalid status" };

  const supabase = getSupabase();
  const { error } = await supabase
    .from("tickets")
    .update({ status })
    .eq("id", ticketId);

  if (error) return { error: "Failed to update status" };

  revalidatePath("/admin/tickets");
  return { success: true };
}
