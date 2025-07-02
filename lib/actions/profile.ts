"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { z } from "zod"
import { profileSchema } from "@/types/zod-schemas"

type ProfileState = {
  message: string
  success: boolean
  errors?: z.ZodIssue[]
}

export async function updateProfile(prevState: ProfileState, formData: FormData): Promise<ProfileState> {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      message: "Not authenticated",
      success: false,
    }
  }

  const validatedFields = profileSchema.safeParse({
    full_name: formData.get("fullName"),
    username: formData.get("username"),
  })

  if (!validatedFields.success) {
    return {
      message: "Invalid form data.",
      success: false,
      errors: validatedFields.error.errors,
    }
  }

  const { full_name, username } = validatedFields.data

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name,
      username,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id)

  if (error) {
    console.error("Error updating profile:", error)
    return {
      message: "Database error: Could not update profile.",
      success: false,
    }
  }

  revalidatePath("/dashboard/settings")
  return {
    message: "Profile updated successfully!",
    success: true,
  }
}
