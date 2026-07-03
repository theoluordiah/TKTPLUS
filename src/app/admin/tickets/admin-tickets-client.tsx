"use client";

import { useState, useCallback, useEffect, useActionState } from "react";
import { updateTicketStatusAction, getFilteredTicketsAction } from "@/lib/actions";
import { STATUS_COLORS, PRIORITY_COLORS, CATEGORY_COLORS, VALID_CATEGORIES, VALID_PRIORITIES, VALID_STATUSES } from "@/lib/types";
import type { Ticket, TicketStatus, TicketCategory, TicketPriority } from "@/lib/types";

const PAGE_SIZE = 20;

function ConfirmDialog({
  open,
  title,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-sm w-full mx-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Confirm Status Change</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Are you sure you want to change this ticket to <strong>{title}</strong>?
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

type Filters = {
  search: string;
  status: string;
  category: string;
  priority: string;
};

function TicketRow({
  ticket,
  onStatusChange,
}: {
  ticket: Ticket;
  onStatusChange: (ticketId: string, status: string) => void;
}) {
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);

  const created = new Date(ticket.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <tr className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
      <td className="py-3 px-4">
        <div className="font-medium text-gray-900 dark:text-white">{ticket.title}</div>
        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{ticket.description}</div>
      </td>
      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{ticket.users?.name ?? "Unknown"}</td>
      <td className="py-3 px-4">
        <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${CATEGORY_COLORS[ticket.category as TicketCategory]}`}>
          {ticket.category}
        </span>
      </td>
      <td className="py-3 px-4">
        <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${PRIORITY_COLORS[ticket.priority as TicketPriority]}`}>
          {ticket.priority}
        </span>
      </td>
      <td className="py-3 px-4">
        <select
          value={ticket.status}
          onChange={(e) => setPendingStatus(e.target.value)}
          className={`text-xs font-medium rounded-full px-2 py-1 border-0 cursor-pointer ${STATUS_COLORS[ticket.status as TicketStatus]}`}
        >
          {VALID_STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        {pendingStatus && pendingStatus !== ticket.status && (
          <ConfirmDialog
            open={true}
            title={pendingStatus}
            onConfirm={() => {
              onStatusChange(ticket.id, pendingStatus);
              setPendingStatus(null);
            }}
            onCancel={() => setPendingStatus(null)}
          />
        )}
      </td>
      <td className="py-3 px-4 text-sm text-gray-500 dark:text-gray-400">{created}</td>
    </tr>
  );
}

export default function AdminTicketsClient({
  initialTickets,
  initialTotal,
}: {
  initialTickets: Ticket[];
  initialTotal: number;
}) {
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    search: "",
    status: "",
    category: "",
    priority: "",
  });

  const fetchTickets = useCallback(async (f: Filters, p: number) => {
    setLoading(true);
    const res = await getFilteredTicketsAction({
      search: f.search || undefined,
      status: f.status || undefined,
      category: f.category || undefined,
      priority: f.priority || undefined,
      page: p,
      pageSize: PAGE_SIZE,
    });
    setTickets(res.tickets);
    setTotal(res.total);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTickets(filters, page);
  }, [filters, page, fetchTickets]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    fetchTickets(filters, 1);
  }

  async function handleStatusChange(ticketId: string, status: string) {
    await updateTicketStatusAction(ticketId, status);
    fetchTickets(filters, page);
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-4 mb-6">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Search</label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              placeholder="Search title or description..."
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">All</option>
              {VALID_STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Category</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">All</option>
              {VALID_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Priority</label>
            <select
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
              className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">All</option>
              {VALID_PRIORITIES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
          >
            Filter
          </button>
        </form>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4 animate-pulse">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <p className="text-lg">No tickets found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
                  <th className="py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Ticket</th>
                  <th className="py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Submitted By</th>
                  <th className="py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Category</th>
                  <th className="py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Priority</th>
                  <th className="py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Status</th>
                  <th className="py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Date</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket) => (
                  <TicketRow
                    key={ticket.id}
                    ticket={ticket}
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page <= 1}
            className="px-3 py-1 text-sm rounded border dark:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-800 transition dark:text-gray-300"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page >= totalPages}
            className="px-3 py-1 text-sm rounded border dark:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-800 transition dark:text-gray-300"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
