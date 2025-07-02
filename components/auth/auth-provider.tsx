"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { authService, type AuthUser } from "@/lib/auth"
import { useRouter, usePathname } from "next/navigation"

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  operationLoading: boolean
  error: Error | null
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [operationLoading, setOperationLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    setLoading(true)
    authService
      .getCurrentUser()
      .then((currentUser) => {
        setUser(currentUser)
        console.log("AuthProvider: Current user:", currentUser?.email)
      })
      .catch((err) => {
        console.error("AuthProvider: Error getting current user:", err)
      })
      .finally(() => {
        setLoading(false)
      })

    const {
      data: { subscription },
    } = authService.onAuthStateChange((appUser) => {
      console.log(`AuthProvider: Auth state changed. User: ${appUser?.email}, Path: ${pathname}`)
      setUser(appUser)
      setLoading(false)

      const isAuthPage = pathname === "/login" || pathname === "/register"
      const isPublicPage = isAuthPage || pathname === "/"

      if (appUser && isAuthPage) {
        console.log("AuthProvider: User authenticated, redirecting to dashboard")
        router.push("/dashboard")
      } else if (!appUser && !isPublicPage) {
        console.log("AuthProvider: User not authenticated, redirecting to login")
        router.push("/login")
      }
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [pathname, router])

  const handleSignIn = useCallback(async (email: string, password: string) => {
    setOperationLoading(true)
    setError(null)
    try {
      const response = await authService.signIn(email, password)
      console.log("AuthProvider: Sign in response:", response)

      if (response.error) {
        throw response.error
      }
    } catch (err: any) {
      console.error("AuthProvider: Sign in error:", err)
      setError(err instanceof Error ? err : new Error(err.message || "Sign-in failed"))
    } finally {
      setOperationLoading(false)
    }
  }, [])

  const handleSignUp = useCallback(async (email: string, password: string, firstName: string, lastName: string) => {
    setOperationLoading(true)
    setError(null)
    try {
      const response = await authService.signUp(email, password, firstName, lastName)
      console.log("AuthProvider: Sign up response:", response)

      if (response.error) {
        throw response.error
      }
    } catch (err: any) {
      console.error("AuthProvider: Sign up error:", err)
      setError(err instanceof Error ? err : new Error(err.message || "Sign-up failed"))
    } finally {
      setOperationLoading(false)
    }
  }, [])

  const handleSignOut = useCallback(async () => {
    console.log("AuthProvider: Signing out...")
    setOperationLoading(true)
    setError(null)
    try {
      const { error } = await authService.signOut()
      if (error) {
        throw error
      }
      console.log("AuthProvider: Sign out successful")
    } catch (err: any) {
      console.error("AuthProvider: Sign out error:", err)
      setError(err instanceof Error ? err : new Error(err.message || "Sign out failed"))
    } finally {
      setOperationLoading(false)
    }
  }, [])

  const contextValue: AuthContextType = {
    user,
    loading,
    operationLoading,
    error,
    signIn: handleSignIn,
    signUp: handleSignUp,
    signOut: handleSignOut,
  }

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
