"use client"

import { createClient } from "@/lib/supabase/client"
import type { AuthError } from "@supabase/supabase-js"

export interface AuthUser {
  id: string
  email: string
  firstName?: string
  lastName?: string
}

export interface AuthResponse {
  user: AuthUser | null
  error: AuthError | null
}

const supabase = createClient()

export const authService = {
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()

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
  },

  async signUp(email: string, password: string, firstName: string, lastName: string): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signUp({
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
        return { user: null, error }
      }

      if (data.user) {
        const authUser: AuthUser = {
          id: data.user.id,
          email: data.user.email!,
          firstName,
          lastName,
        }
        return { user: authUser, error: null }
      }

      return { user: null, error: null }
    } catch (error) {
      console.error("Sign up error:", error)
      return {
        user: null,
        error: {
          message: error instanceof Error ? error.message : "Sign up failed",
          name: "SignUpError",
          status: 500,
        } as AuthError,
      }
    }
  },

  async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { user: null, error }
      }

      if (data.user) {
        const authUser: AuthUser = {
          id: data.user.id,
          email: data.user.email!,
          firstName: data.user.user_metadata?.first_name,
          lastName: data.user.user_metadata?.last_name,
        }
        return { user: authUser, error: null }
      }

      return { user: null, error: null }
    } catch (error) {
      console.error("Sign in error:", error)
      return {
        user: null,
        error: {
          message: error instanceof Error ? error.message : "Sign in failed",
          name: "SignInError",
          status: 500,
        } as AuthError,
      }
    }
  },

  async signOut(): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.signOut()
      return { error }
    } catch (error) {
      console.error("Sign out error:", error)
      return {
        error: {
          message: error instanceof Error ? error.message : "Sign out failed",
          name: "SignOutError",
          status: 500,
        } as AuthError,
      }
    }
  },

  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      const user = session?.user
      const authUser = user
        ? {
            id: user.id,
            email: user.email!,
            firstName: user.user_metadata?.first_name,
            lastName: user.user_metadata?.last_name,
          }
        : null

      callback(authUser)
    })
  },
}
