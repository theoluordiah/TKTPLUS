import type { TicketRow } from "./src/lib/types";

type Test1 = TicketRow extends Record<string, unknown> ? true : false;
declare const t1: Test1;
const r1: Test1 = true;
