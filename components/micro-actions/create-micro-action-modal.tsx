"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"

interface CreateMicroActionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateMicroActionModal({ open, onOpenChange }: CreateMicroActionModalProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !category) return

    setIsLoading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const { error } = await supabase.from("micro_actions").insert({
        user_id: user.id,
        title: title.trim(),
        description: description.trim() || null,
        category,
        is_completed: false,
      })

      if (error) throw error

      // Reset form and close modal
      setTitle("")
      setDescription("")
      setCategory("")
      onOpenChange(false)

      // Refresh the page to show new micro action
      window.location.reload()
    } catch (error) {
      console.error("Error creating micro action:", error)
      alert("Failed to create micro action. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Micro Action</DialogTitle>
          <DialogDescription>Add a small, actionable step that takes just a few minutes to complete.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Action Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What small action will you take?"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the specific steps..."
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="health">🌱 Health & Wellness</SelectItem>
                  <SelectItem value="productivity">🎯 Productivity</SelectItem>
                  <SelectItem value="learning">🧠 Learning</SelectItem>
                  <SelectItem value="mindfulness">🧘 Mindfulness</SelectItem>
                  <SelectItem value="social">💝 Social</SelectItem>
                  <SelectItem value="creativity">🎨 Creativity</SelectItem>
                  <SelectItem value="organization">📋 Organization</SelectItem>
                  <SelectItem value="other">📝 Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !title.trim() || !category}>
              {isLoading ? "Creating..." : "Create Action"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
