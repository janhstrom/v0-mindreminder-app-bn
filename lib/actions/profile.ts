"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { profileSchema } from "@/types/zod-schemas"

export async function updateProfile(prevState: any, formData: FormData) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      success: false,
      message: "Authentication error. Please sign in again.",
      errors: [],
    }
  }

  const validatedFields = profileSchema.safeParse({
    first_name: formData.get("first_name"),
    last_name: formData.get("last_name"),
  })

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Invalid form data.",
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { first_name, last_name } = validatedFields.data

  const { error } = await supabase
    .from("profiles")
    .update({
      first_name,
      last_name,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id)

  if (error) {
    console.error("Error updating profile:", error)
    return {
      success: false,
      message: "Failed to update profile. Please try again.",
      errors: [],
    }
  }

  revalidatePath("/dashboard/settings")
  revalidatePath("/dashboard") // Revalidate layout to update header
  return {
    success: true,
    message: "Profile updated successfully!",
    errors: [],
  }
}
