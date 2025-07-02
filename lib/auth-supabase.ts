import { createClient } from "@supabase/supabase-js"
import type { User, Session } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export class AuthService {
  static async signUp(email: string, password: string, userData?: { firstName?: string; lastName?: string }) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: userData?.firstName,
            last_name: userData?.lastName,
          },
        },
      })

      if (error) throw error

      // Create profile record
      if (data.user) {
        const { error: profileError } = await supabase.from("profiles").insert({
          id: data.user.id,
          email: data.user.email,
          first_name: userData?.firstName,
          last_name: userData?.lastName,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })

        if (profileError) {
          console.error("Error creating profile:", profileError)
        }
      }

      return { data, error: null }
    } catch (error) {
      console.error("Sign up error:", error)
      return { data: null, error }
    }
  }

  static async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error("Sign in error:", error)
      return { data: null, error }
    }
  }

  static async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      return { error: null }
    } catch (error) {
      console.error("Sign out error:", error)
      return { error }
    }
  }

  static async getCurrentUser(): Promise<User | null> {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()
      if (error) throw error
      return user
    } catch (error) {
      console.error("Get current user error:", error)
      return null
    }
  }

  static async getCurrentSession(): Promise<Session | null> {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession()
      if (error) throw error
      return session
    } catch (error) {
      console.error("Get current session error:", error)
      return null
    }
  }

  static onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange(callback)
  }

  static async resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (error) throw error
      return { error: null }
    } catch (error) {
      console.error("Reset password error:", error)
      return { error }
    }
  }

  static async updatePassword(newPassword: string) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })
      if (error) throw error
      return { error: null }
    } catch (error) {
      console.error("Update password error:", error)
      return { error }
    }
  }

  static async updateProfile(updates: {
    email?: string
    firstName?: string
    lastName?: string
    profileImage?: string
  }) {
    try {
      const user = await this.getCurrentUser()
      if (!user) throw new Error("No user found")

      // Update auth user if email is being changed
      if (updates.email && updates.email !== user.email) {
        const { error: authError } = await supabase.auth.updateUser({
          email: updates.email,
        })
        if (authError) throw authError
      }

      // Update profile table
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          email: updates.email,
          first_name: updates.firstName,
          last_name: updates.lastName,
          profile_image_url: updates.profileImage,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      if (profileError) throw profileError

      return { error: null }
    } catch (error) {
      console.error("Update profile error:", error)
      return { error }
    }
  }

  static async deleteAccount() {
    try {
      const user = await this.getCurrentUser()
      if (!user) throw new Error("No user found")

      // Delete user data from all tables
      await supabase.from("reminders").delete().eq("user_id", user.id)
      await supabase.from("micro_actions").delete().eq("user_id", user.id)
      await supabase.from("friends").delete().eq("user_id", user.id)
      await supabase.from("friends").delete().eq("friend_id", user.id)
      await supabase.from("user_settings").delete().eq("id", user.id)
      await supabase.from("profiles").delete().eq("id", user.id)

      // Note: Supabase doesn't allow deleting auth users from client-side
      // This would need to be handled by an admin function or RPC

      return { error: null }
    } catch (error) {
      console.error("Delete account error:", error)
      return { error }
    }
  }
}

// Named export for compatibility
export const SupabaseAuthService = AuthService

// Default export
export default AuthService
