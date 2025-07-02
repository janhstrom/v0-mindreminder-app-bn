"use client"

import { useFormState, useFormStatus } from "react-dom"
import { login } from "@/lib/auth/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Signing In..." : "Sign In"}
    </Button>
  )
}

export function LoginForm() {
  const [state, formAction] = useFormState(login, null)

  return (
    <form action={formAction}>
      <Card>
        <CardHeader>
          <CardTitle>Login</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="m@example.com" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required />
          </div>
          {state?.message && <p className="text-sm text-red-500">{state.message}</p>}
        </CardContent>
        <CardFooter>
          <SubmitButton />
        </CardFooter>
      </Card>
    </form>
  )
}
