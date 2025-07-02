"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle } from "lucide-react"
import Link from "next/link"
import { RegisterForm } from "@/components/auth/register-form"

export default function RegisterPage({ searchParams }: { searchParams: { message: string } }) {
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    const { email, password, confirmPassword, firstName, lastName } = e.target as typeof e.target & {
      email: { value: string }
      password: { value: string }
      confirmPassword: { value: string }
      firstName: { value: string }
      lastName: { value: string }
    }

    const setLoading = (loading: boolean) => {
      // Implement loading state if needed
    }

    const setError = (error: string) => {
      // Implement error state if needed
    }

    setLoading(true)
    setError("")

    if (password.value !== confirmPassword.value) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    if (password.value.length < 6) {
      setError("Password must be at least 6 characters")
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.value,
        password: password.value,
        options: {
          data: {
            first_name: firstName.value,
            last_name: lastName.value,
          },
        },
      })

      if (error) {
        setError(error.message)
      } else if (data.user) {
        setSuccess(true)
        setTimeout(() => {
          router.push("/dashboard")
        }, 2000)
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Created!</h2>
                <p className="text-gray-600">Welcome to MindReMinder. Redirecting to your dashboard...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create an Account</h1>
          <p className="text-gray-600 mt-2">Start your journey with MindReMinder today.</p>
        </div>

        {searchParams.message && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{searchParams.message}</AlertDescription>
          </Alert>
        )}

        <RegisterForm />

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-blue-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
