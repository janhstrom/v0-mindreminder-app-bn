"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export async function signIn(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const supabase = createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return redirect("/login?message=Could not authenticate user")
  }

  revalidatePath("/", "layout")
  return redirect("/dashboard")
}

export async function signUp(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const supabase = createClient()

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // If you want to send a confirmation email
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })

  if (error) {
    console.error("Sign up error:", error)
    return redirect("/register?message=Could not create user. Please try again.")
  }

  revalidatePath("/", "layout")
  return redirect("/login?message=Check your email to complete the sign up process.")
}

export async function signOut() {
  const supabase = createClient()
  await supabase.auth.signOut()
  revalidatePath("/", "layout")
  return redirect("/login")
}

// Alias exports for older imports ─ keeps backward compatibility
export const login = signIn
export const signup = signUp
