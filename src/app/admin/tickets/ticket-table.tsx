"use client";

import { useActionState } from "react";
import { updateTicketStatusAction } from "@/lib/actions";

type Ticket = {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  created_at: string;
  users: { name: string } | null;
};

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

function TicketRow({ ticket }: { ticket: Ticket }) {
  const [state, action, pending] = useActionState(
    async (_prev: unknown, formData: FormData) => {
      const status = formData.get("status") as string;
      return updateTicketStatusAction(ticket.id, status);
    },
    undefined,
  );

  const created = new Date(ticket.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <tr className="border-b hover:bg-gray-50">
      <td className="py-3 px-4">
        <div className="font-medium text-gray-900">{ticket.title}</div>
        <div className="text-sm text-gray-500 mt-1 line-clamp-2">{ticket.description}</div>
      </td>
      <td className="py-3 px-4 text-sm text-gray-600">{ticket.users?.name ?? "Unknown"}</td>
      <td className="py-3 px-4">
        <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
          {ticket.category}
        </span>
      </td>
      <td className="py-3 px-4">
        <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${priorityColors[ticket.priority]}`}>
          {ticket.priority}
        </span>
      </td>
      <td className="py-3 px-4">
        <form action={action}>
          <select
            name="status"
            defaultValue={ticket.status}
            onChange={(e) => e.target.form?.requestSubmit()}
            disabled={pending}
            className={`text-xs font-medium rounded-full px-2 py-1 border-0 cursor-pointer ${statusColors[ticket.status]} disabled:opacity-50`}
          >
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>
        </form>
      </td>
      <td className="py-3 px-4 text-sm text-gray-500">{created}</td>
    </tr>
  );
}

export default function TicketTable({ tickets }: { tickets: Ticket[] }) {
  if (tickets.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg">No tickets yet</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b bg-gray-100">
            <th className="py-3 px-4 text-sm font-medium text-gray-600">Ticket</th>
            <th className="py-3 px-4 text-sm font-medium text-gray-600">Submitted By</th>
            <th className="py-3 px-4 text-sm font-medium text-gray-600">Category</th>
            <th className="py-3 px-4 text-sm font-medium text-gray-600">Priority</th>
            <th className="py-3 px-4 text-sm font-medium text-gray-600">Status</th>
            <th className="py-3 px-4 text-sm font-medium text-gray-600">Date</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((ticket) => (
            <TicketRow key={ticket.id} ticket={ticket} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
