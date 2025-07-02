"use client"

import { useActionState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import type { Profile } from "@/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateProfile } from "@/lib/actions/profile"

interface SettingsFormProps {
  profile: Profile & { email: string }
}

export function SettingsForm({ profile }: SettingsFormProps) {
  const { toast } = useToast()
  const initialState = { message: "", success: false, errors: {} }
  const [state, formAction] = useActionState(updateProfile, initialState)

  useEffect(() => {
    if (state.message) {
      toast({
        title: state.success ? "Success" : "Error",
        description: state.message,
        variant: state.success ? "default" : "destructive",
      })
    }
  }, [state, toast])

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
            <Input id="email" type="email" value={profile.email} disabled />
            <p className="text-sm text-muted-foreground">Your email address cannot be changed.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name</Label>
              <Input id="first_name" name="first_name" defaultValue={profile.first_name || ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name</Label>
              <Input id="last_name" name="last_name" defaultValue={profile.last_name || ""} />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button type="submit">Update Profile</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
