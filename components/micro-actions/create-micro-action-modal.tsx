"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus } from "lucide-react"

interface CreateMicroActionModalProps {
  onCreateMicroAction: (microAction: {
    title: string
    description: string
    category: string
  }) => void
}

const categories = [
  { value: "health", label: "🌱 Health & Wellness", emoji: "🌱" },
  { value: "productivity", label: "⚡ Productivity", emoji: "⚡" },
  { value: "learning", label: "📚 Learning", emoji: "📚" },
  { value: "mindfulness", label: "🧘 Mindfulness", emoji: "🧘" },
  { value: "social", label: "👥 Social", emoji: "👥" },
  { value: "creativity", label: "🎨 Creativity", emoji: "🎨" },
  { value: "fitness", label: "💪 Fitness", emoji: "💪" },
  { value: "organization", label: "📋 Organization", emoji: "📋" },
]

export function CreateMicroActionModal({ onCreateMicroAction }: CreateMicroActionModalProps) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !category) return

    setIsSubmitting(true)
    try {
      await onCreateMicroAction({
        title,
        description,
        category,
      })

      // Reset form
      setTitle("")
      setDescription("")
      setCategory("")
      setOpen(false)
    } catch (error) {
      console.error("Error creating micro action:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Micro Action
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Micro Action</DialogTitle>
          <DialogDescription>
            Add a small, actionable step that you can complete today to build positive habits.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Drink a glass of water"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add more details about this action (optional)"
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !title || !category}>
              {isSubmitting ? "Creating..." : "Create Action"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
