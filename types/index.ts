export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  profileImage?: string
  createdAt: Date
}

export interface Reminder {
  id: string
  userId: string
  title: string
  description?: string
  image?: string
  scheduledTime?: Date
  location?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Quote {
  id: string
  content: string
  topic: string
  createdAt: Date
}

export interface Friend {
  id: string
  userId: string
  friendId: string
  friendEmail: string
  friendName: string
  status: "pending" | "accepted"
  createdAt: Date
}

export interface Profile {
  id: string
  created_at: string
  first_name: string | null
  last_name: string | null
  profile_image_url: string | null
}

export type QuoteTopic =
  | "motivation"
  | "success"
  | "happiness"
  | "wisdom"
  | "love"
  | "friendship"
  | "mindfulness"
  | "productivity"
