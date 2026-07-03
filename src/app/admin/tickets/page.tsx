import { redirect } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import { getAdminSession } from "@/lib/auth";
import { adminLogoutAction } from "@/lib/actions";
import AdminTicketsClient from "./admin-tickets-client";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminTicketsPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const supabase = getSupabase();
  const { data: tickets, count } = await supabase
    .from("tickets")
    .select("*, users(name)", { count: "exact" })
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {count ?? 0} total tickets
            </span>
            <Link
              href="/"
              className="text-sm text-blue-600 hover:underline"
            >
              Home
            </Link>
            <form action={adminLogoutAction}>
              <button
                type="submit"
                className="text-sm text-red-600 hover:underline"
              >
                Logout
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <AdminTicketsClient initialTickets={tickets ?? []} initialTotal={count ?? 0} />
      </main>
    </div>
  );
}
