"use client";

import { useState, useEffect, useActionState } from "react";
import { submitTicketAction, getUserTicketsAction } from "@/lib/actions";
import Link from "next/link";

const statusColors: Record<string, string> = {
  Open: "bg-yellow-100 text-yellow-800",
  "In Progress": "bg-blue-100 text-blue-800",
  Resolved: "bg-green-100 text-green-800",
};

const priorityColors: Record<string, string> = {
  Low: "bg-gray-100 text-gray-600",
  Medium: "bg-yellow-100 text-yellow-800",
  High: "bg-orange-100 text-orange-800",
  Critical: "bg-red-100 text-red-800",
};

type Ticket = {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  created_at: string;
};

export default function SubmitPage() {
  const [state, action, pending] = useActionState(
    async (_prev: unknown, formData: FormData) => submitTicketAction(formData),
    undefined,
  );
  const [tickets, setTickets] = useState<Ticket[]>([]);

  useEffect(() => {
    getUserTicketsAction().then((res) => setTickets(res.tickets));
  }, [state?.success]);

  if (state?.success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full mx-4 text-center">
          <div className="bg-white p-8 rounded-lg shadow-sm border">
            <div className="text-green-500 text-5xl mb-4">&#10003;</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Ticket Submitted!</h1>
            <p className="text-gray-600 mb-6">Your ticket has been submitted successfully.</p>
            <Link
              href="/submit"
              className="block w-full py-2 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition text-center"
            >
              Submit Another Ticket
            </Link>
            <Link
              href="/"
              className="block mt-3 text-sm text-gray-500 hover:text-gray-700"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Submit a Ticket</h1>
          <p className="text-gray-600">Describe your issue or request</p>
        </div>

        <form action={action} className="bg-white p-8 rounded-lg shadow-sm border space-y-4 mb-8">
          {state?.error && (
            <div className="bg-red-50 text-red-600 p-3 rounded text-sm">{state.error}</div>
          )}

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Brief summary of the issue"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows={5}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Detailed description of the issue or request..."
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              id="category"
              name="category"
              required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Select a category</option>
              <option value="Bug">Bug</option>
              <option value="Feature Request">Feature Request</option>
              <option value="Support">Support</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
              Priority
            </label>
            <select
              id="priority"
              name="priority"
              required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
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

        {tickets.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900">Your Tickets</h2>
            </div>
            <div className="divide-y">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="px-6 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium text-gray-900 truncate">{ticket.title}</h3>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{ticket.description}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(ticket.created_at).toLocaleDateString("en-US", {
                          month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${priorityColors[ticket.priority]}`}>
                        {ticket.priority}
                      </span>
                      <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${statusColors[ticket.status]}`}>
                        {ticket.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
