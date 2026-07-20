import type { GenericSchema } from "@supabase/supabase-js";
import type { Database } from "./src/lib/supabase";

// Test if Database['public'] extends GenericSchema
type Check = Database['public'] extends GenericSchema ? true : false;
declare const check: Check;
const result: Check = true;
