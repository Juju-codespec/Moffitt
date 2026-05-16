import { createClient } from "@/lib/supabase/server";
import { getDemoUserId, isDemoMode } from "@/lib/demo/store";

export async function getCurrentUserId(): Promise<string | null> {
  if (isDemoMode() || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return getDemoUserId();
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}
