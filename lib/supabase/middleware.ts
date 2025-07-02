import { NextResponse, type NextRequest } from "next/server"
import { createMiddlewareClient } from "@supabase/ssr"

/**
 * Keeps the Supabase session in sync (refreshes cookies when they expire).
 * Call this from your root `middleware.ts`.
 */
export async function updateSession(request: NextRequest) {
  /* The response we’ll send back (can be changed later in `middleware.ts`). */
  const response = NextResponse.next()

  /* A tiny, stateless Supabase client that lives only for this request. */
  const supabase = createMiddlewareClient({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseKey: process.env.SUPABASE_ANON_KEY!,
    req: request,
    res: response,
  })

  /* Trigger a “silent refresh” if the JWT cookie is expired. */
  await supabase.auth.getSession()

  return response
}
