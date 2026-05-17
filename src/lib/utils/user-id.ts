import { v4 as uuidv4 } from "uuid";

const DEMO_USER_KEY = "uworld_demo_user_id";

/** Stable anonymous user ID for MVP (replace with Supabase auth later) */
export function getDemoUserId(): string {
  if (typeof window === "undefined") return "server-demo-user";
  let id = localStorage.getItem(DEMO_USER_KEY);
  if (!id) {
    id = uuidv4();
    localStorage.setItem(DEMO_USER_KEY, id);
  }
  return id;
}

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
