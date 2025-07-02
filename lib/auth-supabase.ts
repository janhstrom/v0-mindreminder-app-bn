import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

/**
 * A tiny wrapper around Supabase Auth so other modules can import the same service.
 * Only the handful of methods that are used elsewhere are implemented.
 */
export class SupabaseAuthService {
  private supabase = createClient()

  async signInWithPassword(email: string, password: string) {
    return this.supabase.auth.signInWithPassword({ email, password })
  }

  async signUp(email: string, password: string) {
    return this.supabase.auth.signUp({ email, password })
  }

  async signOut() {
    return this.supabase.auth.signOut()
  }

  async getUser(): Promise<User | null> {
    const { data } = await this.supabase.auth.getUser()
    return data.user
  }
}

/* optional default export for existing imports */
export default SupabaseAuthService
