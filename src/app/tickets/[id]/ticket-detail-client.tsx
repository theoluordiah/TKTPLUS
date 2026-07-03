"use client";

import { useActionState, useRef, useEffect, useState } from "react";
import Link from "next/link";
import { addCommentAction, getCommentsAction } from "@/lib/actions";
import { STATUS_COLORS, PRIORITY_COLORS, CATEGORY_COLORS } from "@/lib/types";
import type { Ticket, Comment, TicketStatus, TicketPriority, TicketCategory } from "@/lib/types";

function CommentList({ comments }: { comments: Comment[] }) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments.length]);

  return (
    <div className="space-y-4">
      {comments.length === 0 && (
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">No comments yet.</p>
      )}
      {comments.map((comment) => (
        <div key={comment.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {comment.users?.name ?? "Unknown"}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {new Date(comment.created_at).toLocaleDateString("en-US", {
                month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit",
              })}
            </span>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{comment.content}</p>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}

export default function TicketDetailClient({
  ticket,
  comments: initialComments,
}: {
  ticket: Ticket;
  comments: Comment[];
}) {
  const [state, action, pending] = useActionState(addCommentAction, undefined);
  const [comments, setComments] = useState<Comment[]>(initialComments);

  useEffect(() => {
    if (state?.success) {
      getCommentsAction(ticket.id).then((res) => setComments(res.comments));
    }
  }, [state?.success, ticket.id]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Ticket Details</h1>
          <Link href="/dashboard" className="text-sm text-blue-600 hover:underline">
            Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-6 mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${STATUS_COLORS[ticket.status as TicketStatus]}`}>
              {ticket.status}
            </span>
            <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${PRIORITY_COLORS[ticket.priority as TicketPriority]}`}>
              {ticket.priority}
            </span>
            <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${CATEGORY_COLORS[ticket.category as TicketCategory]}`}>
              {ticket.category}
            </span>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{ticket.title}</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
            Submitted by {ticket.users?.name ?? "Unknown"} on{" "}
            {new Date(ticket.created_at).toLocaleDateString("en-US", {
              month: "long", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit",
            })}
          </p>
          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{ticket.description}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Comments ({comments.length})
          </h2>

          <CommentList comments={comments} />

          <form action={action} className="mt-6 pt-6 border-t dark:border-gray-700">
            <input type="hidden" name="ticketId" value={ticket.id} />
            {state?.error && (
              <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded text-sm mb-4">{state.error}</div>
            )}
            <div className="flex gap-2">
              <textarea
                name="content"
                required
                rows={2}
                className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Add a comment..."
              />
              <button
                type="submit"
                disabled={pending}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition self-end"
              >
                {pending ? "Sending..." : "Send"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
