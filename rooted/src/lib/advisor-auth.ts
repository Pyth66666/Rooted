import { createClient } from "@supabase/supabase-js";

export async function verifiedUser(request: Request) {
  const token = request.headers.get("authorization")?.match(/^Bearer ([A-Za-z0-9._-]+)$/)?.[1];
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!token || !url || !anon) return null;
  const client = createClient(url, anon, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await client.auth.getUser(token);
  return error ? null : data.user;
}
