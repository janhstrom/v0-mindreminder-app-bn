import type { NextRequest } from "next/server"
import { updateSession } from "@/lib/supabase/middleware"

/**
 * Runs on *every* request that matches the `matcher` below.
 * We only update the Supabase session – the helper already
 * takes care of silent refresh when needed.
 */
export async function middleware(request: NextRequest) {
  return updateSession(request)
}

export const config = {
  matcher: ["/dashboard/:path*"], // protect all dashboard routes
}
