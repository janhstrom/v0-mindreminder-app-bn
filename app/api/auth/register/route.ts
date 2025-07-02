import { type NextRequest, NextResponse } from "next/server"
import { authService } from "@/lib/auth-supabase"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, full_name } = body

    // Validate input
    if (!email || !password || !full_name) {
      return NextResponse.json({ error: "Email, password, and full name are required" }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters long" }, { status: 400 })
    }

    console.log("Registering user with email:", email)

    const result = await authService.register({
      email,
      password,
      full_name,
    })

    console.log("Registration result:", result)

    return NextResponse.json({
      message: "User registered successfully",
      user: result.user,
    })
  } catch (error) {
    console.error("Registration API error:", error)

    const errorMessage = error instanceof Error ? error.message : "Database error saving new user"

    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
