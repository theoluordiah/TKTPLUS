"use client";

import { useState, useEffect, useActionState } from "react";
import { submitTicketAction, getUserTicketsAction, userLogoutAction } from "@/lib/actions";
import { STATUS_COLORS, PRIORITY_COLORS } from "@/lib/types";
import type { Ticket, TicketStatus, TicketPriority } from "@/lib/types";
import Link from "next/link";

function TicketList({ tickets }: { tickets: Ticket[] }) {
  if (tickets.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 overflow-hidden">
      <div className="px-6 py-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Your Recent Tickets</h2>
      </div>
      <div className="divide-y dark:divide-gray-700">
        {tickets.slice(0, 5).map((ticket) => (
          <Link
            key={ticket.id}
            href={`/tickets/${ticket.id}`}
            className="px-6 py-4 block hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h3 className="font-medium text-gray-900 dark:text-white truncate">{ticket.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{ticket.description}</p>
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
      {tickets.length > 5 && (
        <Link
          href="/dashboard"
          className="block px-6 py-3 text-center text-sm text-blue-600 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
        >
          View all {tickets.length} tickets
        </Link>
      )}
    </div>
  );
}

export default function SubmitPage() {
  const [state, action, pending] = useActionState(submitTicketAction, undefined);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserTicketsAction().then((res) => {
      setTickets(res.tickets);
      setLoading(false);
    });
  }, [state?.success]);

  if (state?.success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md w-full mx-4 text-center">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-sm border dark:border-gray-700">
            <div className="text-green-500 text-5xl mb-4">&#10003;</div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Ticket Submitted!</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Your ticket has been submitted successfully.</p>
            <Link
              href="/submit"
              className="block w-full py-2 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition text-center"
            >
              Submit Another Ticket
            </Link>
            <Link
              href="/dashboard"
              className="block mt-3 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              View My Tickets
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Submit a Ticket</h1>
            <p className="text-gray-600 dark:text-gray-400">Describe your issue or request</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-sm text-blue-600 hover:underline">
              Dashboard
            </Link>
            <form action={userLogoutAction}>
              <button type="submit" className="text-sm text-red-600 hover:underline">
                Logout
              </button>
            </form>
          </div>
        </div>

        <form action={action} className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-sm border dark:border-gray-700 space-y-4 mb-8">
          {state?.error && (
            <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded text-sm">{state.error}</div>
          )}

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Title
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Brief summary of the issue"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows={5}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Detailed description of the issue or request..."
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category
            </label>
            <select
              id="category"
              name="category"
              required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">Select a category</option>
              <option value="Bug">Bug</option>
              <option value="Feature Request">Feature Request</option>
              <option value="Support">Support</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Priority
            </label>
            <select
              id="priority"
              name="priority"
              required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">Select priority</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={pending}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {pending ? "Submitting..." : "Submit Ticket"}
          </button>
        </form>

        {loading ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        ) : (
          <TicketList tickets={tickets} />
        )}
      </div>
    </div>
  );
}
