import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Brain, Bell, Users, Quote, Zap, Shield, Smartphone, Heart } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="h-8 w-8 text-purple-600" />
            <span className="text-2xl font-bold text-gray-900">MindReMinder</span>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="#features" className="text-gray-600 hover:text-purple-600 transition-colors">
              Features
            </Link>
            <Link href="#about" className="text-gray-600 hover:text-purple-600 transition-colors">
              About
            </Link>
            <Link href="/contact" className="text-gray-600 hover:text-purple-600 transition-colors">
              Contact
            </Link>
          </nav>
          <div className="flex items-center space-x-3">
            <Button variant="outline" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <Badge variant="secondary" className="mb-4">
            ✨ Your Personal Mindfulness Companion
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Stay Mindful,
            <span className="text-purple-600"> Stay Organized</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            MindReMinder helps you cultivate mindfulness, stay organized with smart reminders, and connect with friends
            through shared inspiration and micro-actions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8 py-3" asChild>
              <Link href="/register">Start Your Journey</Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-3 bg-transparent" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Everything You Need for Mindful Living</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover powerful features designed to enhance your daily mindfulness practice and keep you connected with
              what matters most.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Bell className="h-12 w-12 text-purple-600 mb-4" />
                <CardTitle className="text-xl">Smart Reminders</CardTitle>
                <CardDescription>
                  Set intelligent reminders that adapt to your schedule and help you stay on track with your goals and
                  daily practices.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Zap className="h-12 w-12 text-blue-600 mb-4" />
                <CardTitle className="text-xl">Micro-Actions</CardTitle>
                <CardDescription>
                  Break down big goals into small, manageable actions. Build lasting habits through consistent
                  micro-steps.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Quote className="h-12 w-12 text-green-600 mb-4" />
                <CardTitle className="text-xl">Daily Inspiration</CardTitle>
                <CardDescription>
                  Discover and save meaningful quotes. Share inspiration with friends and build a personal collection of
                  wisdom.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Users className="h-12 w-12 text-orange-600 mb-4" />
                <CardTitle className="text-xl">Friend Connections</CardTitle>
                <CardDescription>
                  Connect with friends, share reminders, and support each other on your mindfulness journeys.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Shield className="h-12 w-12 text-red-600 mb-4" />
                <CardTitle className="text-xl">Privacy First</CardTitle>
                <CardDescription>
                  Your data is secure and private. We believe in protecting your personal information and mindfulness
                  practice.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Smartphone className="h-12 w-12 text-indigo-600 mb-4" />
                <CardTitle className="text-xl">Cross-Platform</CardTitle>
                <CardDescription>
                  Access your reminders and practices anywhere. Seamlessly sync across all your devices.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-4 bg-gradient-to-r from-purple-50 to-blue-50">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Why Choose MindReMinder?</h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                In our fast-paced world, it's easy to lose sight of what truly matters. MindReMinder was created to help
                you slow down, stay present, and build meaningful connections with yourself and others.
              </p>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Heart className="h-6 w-6 text-purple-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Mindful by Design</h3>
                    <p className="text-gray-600">
                      Every feature is crafted to promote mindfulness and intentional living.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Users className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Community Focused</h3>
                    <p className="text-gray-600">Connect with like-minded individuals on similar journeys.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Zap className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Simple & Effective</h3>
                    <p className="text-gray-600">
                      Clean, intuitive design that doesn't get in the way of your practice.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-8">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-gray-700">Morning meditation reminder</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-700">Gratitude practice micro-action</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span className="text-gray-700">Shared inspirational quote</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span className="text-gray-700">Friend connection request</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Daily Practice?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Join thousands of users who have already started their mindfulness journey with MindReMinder. Your future
            self will thank you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-3" asChild>
              <Link href="/register">Start Free Today</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-3 border-white text-white hover:bg-white hover:text-purple-600 bg-transparent"
              asChild
            >
              <Link href="/contact">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Brain className="h-6 w-6 text-purple-400" />
                <span className="text-xl font-bold">MindReMinder</span>
              </div>
              <p className="text-gray-400">Your personal companion for mindful living and meaningful connections.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Features</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Smart Reminders
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Micro-Actions
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Daily Quotes
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Friend Network
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/help" className="hover:text-white transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white transition-colors">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-white transition-colors">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Connect</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Twitter
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Instagram
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Facebook
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    LinkedIn
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 MindReMinder. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
