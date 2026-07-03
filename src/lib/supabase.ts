import { createClient } from "@supabase/supabase-js";
import type { User, Ticket, Comment } from "./types";

export type Database = {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: { name: string; code: string };
      };
      tickets: {
        Row: Ticket;
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
      };
      comments: {
        Row: Comment;
        Insert: {
          ticket_id: string;
          user_id: string;
          content: string;
        };
      };
    };
  };
};

let client: ReturnType<typeof createClient<Database>> | null = null;

export function getSupabase() {
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
