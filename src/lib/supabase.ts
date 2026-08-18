import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseFetch } from "./supabase-fetch";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// ビルド時・環境変数未設定時はnullを返す（サンプルデータで動作）
function createSupabaseClient(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseAnonKey) return null;
  try {
    return createClient(supabaseUrl, supabaseAnonKey, {
      global: { fetch: createSupabaseFetch(supabaseAnonKey) },
    });
  } catch {
    return null;
  }
}

export const supabase = createSupabaseClient();
