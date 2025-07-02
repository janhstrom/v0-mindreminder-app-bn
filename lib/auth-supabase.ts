import { createClient } from "@/lib/supabase/client"

export interface AuthUser {
  id: string
  email: string
  firstName: string
  lastName: string
  profileImage: string | null
  createdAt: string
  emailConfirmed: boolean
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

  async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      throw error
    }

    return data
  }

  async signUp(email: string, password: string, fullName: string) {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })

    if (error) {
      throw error
    }

    return data
  }

  async signOut() {
    const { error } = await this.supabase.auth.signOut()
    if (error) {
      throw error
    }
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const {
        data: { user },
        error,
      } = await this.supabase.auth.getUser()

      if (error || !user) {
        return null
      }

      // Get profile data
      const { data: profile } = await this.supabase
        .from("profiles")
        .select("first_name, last_name, profile_image_url")
        .eq("id", user.id)
        .single()

      return {
        id: user.id,
        email: user.email ?? "",
        firstName: profile?.first_name ?? "",
        lastName: profile?.last_name ?? "",
        profileImage: profile?.profile_image_url ?? null,
        createdAt: user.created_at,
        emailConfirmed: !!user.email_confirmed_at,
      }
    } catch (error) {
      console.error("Error getting current user:", error)
      return null
    }
  }

  async register(userData: { email: string; password: string; full_name: string }) {
    const { data, error } = await this.supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          full_name: userData.full_name,
        },
      },
    })

    if (error) {
      throw error
    }

    // Create profile record
    if (data.user) {
      const nameParts = userData.full_name.split(" ")
      const firstName = nameParts[0] || ""
      const lastName = nameParts.slice(1).join(" ") || ""

      const { error: profileError } = await this.supabase.from("profiles").insert({
        id: data.user.id,
        email: userData.email,
        first_name: firstName,
        last_name: lastName,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (profileError) {
        console.error("Error creating profile:", profileError)
      }
    }

    return data
  }
}

export const authService = new SupabaseAuthService()
