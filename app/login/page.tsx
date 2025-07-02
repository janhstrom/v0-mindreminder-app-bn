import { LoginForm } from "@/components/auth/login-form"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function LoginPage({ searchParams }: { searchParams: { message: string } }) {
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session) {
    redirect("/dashboard")
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md space-y-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Welcome Back</h1>
          <p className="text-gray-500">Enter your credentials to access your account.</p>
        </div>
        {searchParams.message && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{searchParams.message}</span>
          </div>
        )}
        <LoginForm />
        <p className="text-center text-sm">
          Don't have an account?{" "}
          <Link href="/register" className="font-medium text-blue-600 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
