import { createClient } from "@/lib/supabase/client"

export interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
}

export interface AuthState {
  user: User | null
  loading: boolean
}

export class SupabaseAuthService {
  private static instance: SupabaseAuthService
  private supabase = createClient()

  static getInstance(): SupabaseAuthService {
    if (!SupabaseAuthService.instance) {
      SupabaseAuthService.instance = new SupabaseAuthService()
    }
    return SupabaseAuthService.instance
  }

  async signUp(email: string, password: string, firstName: string, lastName: string) {
    try {
      const { data, error } = await this.supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          },
        },
      })

      if (error) {
        console.error("Supabase signup error:", error)
        throw new Error(error.message)
      }

      return data
    } catch (error) {
      console.error("Auth service signup error:", error)
      throw error
    }
  }

  async signIn(email: string, password: string) {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error("Supabase signin error:", error)
        throw new Error(error.message)
      }

      return data
    } catch (error) {
      console.error("Auth service signin error:", error)
      throw error
    }
  }

  async signOut() {
    try {
      const { error } = await this.supabase.auth.signOut()
      if (error) {
        console.error("Supabase signout error:", error)
        throw new Error(error.message)
      }
    } catch (error) {
      console.error("Auth service signout error:", error)
      throw error
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const {
        data: { user },
        error,
      } = await this.supabase.auth.getUser()

      if (error || !user) {
        return null
      }

      return {
        id: user.id,
        email: user.email!,
        firstName: user.user_metadata?.first_name,
        lastName: user.user_metadata?.last_name,
      }
    } catch (error) {
      console.error("Error getting current user:", error)
      return null
    }
  }

  onAuthStateChange(callback: (user: User | null) => void) {
    return this.supabase.auth.onAuthStateChange((event, session) => {
      const user = session?.user
      callback(
        user
          ? {
              id: user.id,
              email: user.email!,
              firstName: user.user_metadata?.first_name,
              lastName: user.user_metadata?.last_name,
            }
          : null,
      )
    })
  }
}

export const authService = SupabaseAuthService.getInstance()
