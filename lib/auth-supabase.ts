"use client"

import { createClient } from "@/lib/supabase/client"

export interface AuthUser {
  id: string
  email: string
  firstName: string
  lastName: string
  profileImage?: string
  createdAt: Date
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

  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const {
        data: { user },
        error,
      } = await this.supabase.auth.getUser()

      if (error || !user) {
        return null
      }

      // Get user profile
      const { data: profile } = await this.supabase
        .from("profiles")
        .select("first_name, last_name, profile_image_url")
        .eq("id", user.id)
        .single()

      return {
        id: user.id,
        email: user.email || "",
        firstName: profile?.first_name || "",
        lastName: profile?.last_name || "",
        profileImage: profile?.profile_image_url || undefined,
        createdAt: new Date(user.created_at),
      }
    } catch (error) {
      console.error("Error getting current user:", error)
      return null
    }
  }

  async signOut(): Promise<void> {
    await this.supabase.auth.signOut()
  }

  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    return this.supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const authUser = await this.getCurrentUser()
        callback(authUser)
      } else {
        callback(null)
      }
    })
  }
}
