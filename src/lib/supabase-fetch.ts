/**
 * Supabaseの新しいsb_*キーはapikeyヘッダーで認証する。
 * supabase-jsが付ける「Authorization: Bearer sb_*」だけを除去し、
 * ユーザーのセッションJWTはそのまま保持する。
 */
export function createSupabaseFetch(apiKey: string): typeof fetch {
  if (!apiKey.startsWith("sb_")) return fetch;

  return async (input, init) => {
    const headers = new Headers(input instanceof Request ? input.headers : undefined);
    if (init?.headers) {
      new Headers(init.headers).forEach((value, key) => headers.set(key, value));
    }

    if (
      headers.get("apikey") === apiKey &&
      headers.get("authorization") === `Bearer ${apiKey}`
    ) {
      headers.delete("authorization");
    }

    return fetch(input, { ...init, headers });
  };
}
