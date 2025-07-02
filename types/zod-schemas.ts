import { z } from "zod"

export const profileSchema = z.object({
  full_name: z.string().min(2, { message: "Full name must be at least 2 characters." }).optional(),
  username: z.string().min(3, { message: "Username must be at least 3 characters." }).optional(),
})
