"use client"

import { useActionState } from "react"
import type { Profile } from "@/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateProfile } from "@/lib/actions/profile"

interface SettingsFormProps {
  profile: Profile
}

export function SettingsForm({ profile }: SettingsFormProps) {
  const initialState = { message: "", success: false, errors: [] }
  const [state, formAction] = useActionState(updateProfile, initialState)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Details</CardTitle>
        <CardDescription>Update your personal information here.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={profile.email || ""} disabled />
            <p className="text-sm text-muted-foreground">Your email address cannot be changed.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input id="fullName" name="fullName" defaultValue={profile.full_name || ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" name="username" defaultValue={profile.username || ""} />
          </div>
          <div className="flex items-center gap-4">
            <Button type="submit">Update Profile</Button>
            {state?.message && (
              <p className={`text-sm ${state.success ? "text-green-600" : "text-red-600"}`}>{state.message}</p>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
