"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface Quote {
  content: string
  author: string
}

export default function QuoteGenerator() {
  const [quote, setQuote] = useState<Quote | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchQuote = async () => {
    setLoading(true)
    try {
      // Public demo API – replace with your own `/api/quotes/random` if you like
      const res = await fetch("https://api.quotable.io/random")
      const data = (await res.json()) as { content: string; author: string }
      setQuote({ content: data.content, author: data.author })
    } catch (err) {
      console.error("Failed to fetch quote", err)
    } finally {
      setLoading(false)
    }
  }

  /* Fetch once on mount */
  useEffect(() => {
    fetchQuote()
  }, [])

  return (
    <Card className="max-w-xl text-center">
      <CardContent className="space-y-4 p-6">
        {quote ? (
          <>
            <p className="text-lg italic">&ldquo;{quote.content}&rdquo;</p>
            <p className="text-sm font-medium text-muted-foreground">— {quote.author}</p>
          </>
        ) : (
          <p className="text-muted-foreground">{loading ? "Loading quote…" : "No quote yet"}</p>
        )}

        <Button onClick={fetchQuote} disabled={loading}>
          {loading ? "Fetching…" : "New Quote"}
        </Button>
      </CardContent>
    </Card>
  )
}
