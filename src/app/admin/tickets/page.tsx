import { redirect } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import { getAdminSession } from "@/lib/auth";
import { adminLogoutAction } from "@/lib/actions";
import TicketTable from "./ticket-table";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminTicketsPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const supabase = getSupabase();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: tickets } = await (supabase.from("tickets") as any)
    .select("*, users(name)")
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">
              {tickets?.length ?? 0} total tickets
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
        <TicketTable tickets={tickets ?? []} />
      </main>
    </div>
  );
}
