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
  private supabase = createClient()

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

  async signOut(): Promise<void> {
    const { error } = await this.supabase.auth.signOut()
    if (error) {
      throw error
    }
  }

  async updateProfile(updates: {
    firstName?: string
    lastName?: string
    email?: string
    profileImage?: string
  }): Promise<void> {
    const user = await this.getCurrentUser()
    if (!user) throw new Error("No authenticated user")

    const { error } = await this.supabase
      .from("profiles")
      .update({
        first_name: updates.firstName,
        last_name: updates.lastName,
        email: updates.email,
        profile_image_url: updates.profileImage,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)

    if (error) {
      throw error
    }
  }
}

export const authService = new SupabaseAuthService()
