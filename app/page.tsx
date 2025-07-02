import { Button } from "@/components/ui/button"
import { Brain, Clock, Target, Users, Zap, Star } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">MindReMinder</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Your Personal
            <span className="text-blue-600"> Wellness </span>
            Companion
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Build healthy habits with personalized reminders, micro-actions, and daily inspiration. Transform your
            mindfulness journey one small step at a time.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="text-lg px-8 py-3">
                Start Your Journey
              </Button>
            </Link>
            <Link href="/demo">
              <Button variant="outline" size="lg" className="text-lg px-8 py-3 bg-transparent">
                View Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Everything You Need for Mindful Living</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover powerful tools designed to help you build lasting habits and maintain mental wellness.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Smart Reminders</h3>
            <p className="text-gray-600">
              Personalized reminders that adapt to your schedule and help you stay consistent with your mindfulness
              practices.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
              <Zap className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Micro Actions</h3>
            <p className="text-gray-600">
              Small, achievable actions that compound over time to create meaningful change in your daily routine.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
              <Star className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Daily Inspiration</h3>
            <p className="text-gray-600">
              Curated motivational quotes and affirmations to keep you inspired and focused on your wellness goals.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-6">
              <Target className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Progress Tracking</h3>
            <p className="text-gray-600">
              Detailed analytics and insights to help you understand your patterns and celebrate your progress.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-6">
              <Users className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Community Support</h3>
            <p className="text-gray-600">
              Connect with like-minded individuals on similar wellness journeys for motivation and accountability.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-6">
              <Brain className="h-6 w-6 text-teal-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Mindful Goals</h3>
            <p className="text-gray-600">
              Guided goal-setting tools that help you create realistic, achievable objectives for your wellness journey.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Transform Your Daily Routine?</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of users who have already started their mindfulness journey with MindReMinder.
          </p>
          <Link href="/register">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-3">
              Start Free Today
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-12 border-t">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <Brain className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">MindReMinder</span>
          </div>
          <div className="flex items-center space-x-6 text-gray-600">
            <Link href="/privacy" className="hover:text-gray-900">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-gray-900">
              Terms
            </Link>
            <Link href="/contact" className="hover:text-gray-900">
              Contact
            </Link>
          </div>
        </div>
        <div className="text-center text-gray-500 mt-8">
          <p>&copy; 2024 MindReMinder. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
