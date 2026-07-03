"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getUserTicketsAction, userLogoutAction } from "@/lib/actions";
import { STATUS_COLORS, PRIORITY_COLORS, STATUS_COLORS as SC } from "@/lib/types";
import type { Ticket, TicketStatus, TicketPriority } from "@/lib/types";

function TicketList({ tickets }: { tickets: Ticket[] }) {
  if (tickets.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        <p className="text-lg">No tickets yet</p>
        <Link href="/submit" className="text-blue-600 hover:underline text-sm mt-2 inline-block">
          Submit your first ticket
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tickets.map((ticket) => (
        <Link
          key={ticket.id}
          href={`/tickets/${ticket.id}`}
          className="block bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h3 className="font-medium text-gray-900 dark:text-white truncate">{ticket.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{ticket.description}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                {new Date(ticket.created_at).toLocaleDateString("en-US", {
                  month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit",
                })}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${PRIORITY_COLORS[ticket.priority as TicketPriority]}`}>
                {ticket.priority}
              </span>
              <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${STATUS_COLORS[ticket.status as TicketStatus]}`}>
                {ticket.status}
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserTicketsAction().then((res) => {
      setTickets(res.tickets);
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">My Dashboard</h1>
          <div className="flex items-center gap-4">
            <Link href="/submit" className="text-sm text-blue-600 hover:underline">
              Submit Ticket
            </Link>
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              Home
            </Link>
            <form action={userLogoutAction}>
              <button type="submit" className="text-sm text-red-600 hover:underline">
                Logout
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Your Tickets ({tickets.length})
          </h2>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-4 animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        ) : (
          <TicketList tickets={tickets} />
        )}
      </main>
    </div>
  );
}
