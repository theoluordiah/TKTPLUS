export type UserRow = {
  id: string;
  name: string;
  code: string;
  created_at: string;
}

export type TicketCategory = "Bug" | "Feature Request" | "Support" | "Other";
export type TicketPriority = "Low" | "Medium" | "High" | "Critical";
export type TicketStatus = "Open" | "In Progress" | "Resolved";

export const VALID_CATEGORIES: TicketCategory[] = ["Bug", "Feature Request", "Support", "Other"];
export const VALID_PRIORITIES: TicketPriority[] = ["Low", "Medium", "High", "Critical"];
export const VALID_STATUSES: TicketStatus[] = ["Open", "In Progress", "Resolved"];

export type TicketRow = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  created_at: string;
  updated_at: string;
}

export type CommentRow = {
  id: string;
  ticket_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

export interface Ticket extends TicketRow {
  users?: { name: string } | null;
}

export interface Comment extends CommentRow {
  users?: { name: string } | null;
}

export const STATUS_COLORS: Record<TicketStatus, string> = {
  Open: "bg-yellow-100 text-yellow-800",
  "In Progress": "bg-blue-100 text-blue-800",
  Resolved: "bg-green-100 text-green-800",
};

export const PRIORITY_COLORS: Record<TicketPriority, string> = {
  Low: "bg-gray-100 text-gray-600",
  Medium: "bg-yellow-100 text-yellow-800",
  High: "bg-orange-100 text-orange-800",
  Critical: "bg-red-100 text-red-800",
};

export const CATEGORY_COLORS: Record<TicketCategory, string> = {
  Bug: "bg-red-100 text-red-800",
  "Feature Request": "bg-blue-100 text-blue-800",
  Support: "bg-green-100 text-green-800",
  Other: "bg-gray-100 text-gray-600",
};
