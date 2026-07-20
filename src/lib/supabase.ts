import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { UserRow, TicketRow, CommentRow } from "./types";

export type Database = {
  public: {
    Tables: {
      users: {
        Row: UserRow;
        Insert: { name: string; code: string };
        Update: { name?: string; code?: string };
        Relationships: [];
      };
      tickets: {
        Row: TicketRow;
        Insert: {
          user_id: string;
          title: string;
          description: string;
          category: string;
          priority: string;
        };
        Update: {
          status?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      comments: {
        Row: CommentRow;
        Insert: {
          ticket_id: string;
          user_id: string;
          content: string;
        };
        Update: {
          content?: string;
        };
        Relationships: [];
      };
    };
  };
};

let client: SupabaseClient<Database> | null = null;

export function getSupabase(): SupabaseClient<Database> {
  if (!client) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error(
        "Missing Supabase environment variables. Check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
      );
    }

    client = createClient<Database>(supabaseUrl, supabaseServiceKey);
  }
  return client;
}
