import { redirect } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import { getSession } from "@/lib/auth";
import TicketDetailClient from "./ticket-detail-client";

export const dynamic = "force-dynamic";

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { id } = await params;
  const supabase = getSupabase();
  const { data: ticket } = await supabase
    .from("tickets")
    .select("*, users(name)")
    .eq("id", id)
    .single();

  if (!ticket) redirect("/dashboard");

  const { data: comments } = await supabase
    .from("comments")
    .select("*, users(name)")
    .eq("ticket_id", id)
    .order("created_at", { ascending: true });

  return <TicketDetailClient ticket={ticket} comments={comments ?? []} />;
}
