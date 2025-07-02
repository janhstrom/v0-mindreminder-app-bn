import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

export interface AuthUser {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  email: string
  password: string
  full_name: string
}

export class AuthService {
  private supabase = createClient()

  async login(credentials: LoginCredentials) {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      })

      if (error) {
        console.error("Login error:", error)
        throw new Error(error.message)
      }

      return { user: data.user, session: data.session }
    } catch (error) {
      console.error("Login service error:", error)
      throw error
    }
  }

  async register(credentials: RegisterCredentials) {
    try {
      console.log("Attempting to register user:", credentials.email)

      const { data, error } = await this.supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            full_name: credentials.full_name,
          },
        },
      })

      if (error) {
        console.error("Registration error:", error)
        throw new Error(error.message)
      }

      console.log("Registration successful:", data)
      return { user: data.user, session: data.session }
    } catch (error) {
      console.error("Registration service error:", error)
      throw error
    }
  }

  async logout() {
    try {
      const { error } = await this.supabase.auth.signOut()
      if (error) {
        console.error("Logout error:", error)
        throw new Error(error.message)
      }
    } catch (error) {
      console.error("Logout service error:", error)
      throw error
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const {
        data: { user },
        error,
      } = await this.supabase.auth.getUser()

      if (error) {
        console.error("Get current user error:", error)
        return null
      }

      return user
    } catch (error) {
      console.error("Get current user service error:", error)
      return null
    }
  }

  async updateProfile(updates: Partial<AuthUser>) {
    try {
      const { data, error } = await this.supabase.auth.updateUser({
        data: updates,
      })

      if (error) {
        console.error("Update profile error:", error)
        throw new Error(error.message)
      }

      return data.user
    } catch (error) {
      console.error("Update profile service error:", error)
      throw error
    }
  }

  onAuthStateChange(callback: (user: User | null) => void) {
    return this.supabase.auth.onAuthStateChange((event, session) => {
      callback(session?.user ?? null)
    })
  }
}

export const authService = new AuthService()
