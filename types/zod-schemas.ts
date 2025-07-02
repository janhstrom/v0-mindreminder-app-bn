import { z } from "zod"

export const profileSchema = z.object({
  first_name: z.string().min(1, { message: "First name is required." }).max(50),
  last_name: z.string().min(1, { message: "Last name is required." }).max(50),
})
