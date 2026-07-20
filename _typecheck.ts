import type { Database } from "./src/lib/supabase";

type GenericRelationship = {
  foreignKeyName: string;
  columns: string[];
  isOneToOne?: boolean;
  referencedRelation: string;
  referencedColumns: string[];
};
type GenericTable = {
  Row: Record<string, unknown>;
  Insert: Record<string, unknown>;
  Update: Record<string, unknown>;
  Relationships: GenericRelationship[];
};

type TicketTable = Database['public']['Tables']['tickets'];

type RowOK = TicketTable['Row'] extends Record<string, unknown> ? true : false;
type InsertOK = TicketTable['Insert'] extends Record<string, unknown> ? true : false;
type UpdateOK = TicketTable['Update'] extends Record<string, unknown> ? true : false;
type RelOK = TicketTable['Relationships'] extends GenericRelationship[] ? true : false;

declare const row: RowOK;
declare const ins: InsertOK;
declare const upd: UpdateOK;
declare const rel: RelOK;

const rowResult: RowOK = true;
const insResult: InsertOK = true;
const updResult: UpdateOK = true;
const relResult: RelOK = true;
