"use client"
import { X, Home, Bell, Target, Users, BarChart, Settings, HelpCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"

interface SidebarProps {
  open: boolean
  setOpen: (open: boolean) => void
}

const links = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/dashboard/reminders", label: "Reminders", icon: Bell },
  { href: "/dashboard/micro-actions", label: "Micro Actions", icon: Target },
  { href: "/dashboard/friends", label: "Friends", icon: Users },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/help", label: "Help", icon: HelpCircle },
]

export function Sidebar({ open, setOpen }: SidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {/* overlay for mobile */}
      {open && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setOpen(false)} />}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 transform bg-white shadow-lg transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:shadow-none",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* close btn mobile */}
        <div className="flex items-center justify-between px-4 py-3 lg:hidden">
          <span className="font-semibold">Menu</span>
          <Button size="icon" variant="ghost" onClick={() => setOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* logo */}
        <div className="px-6 py-4 hidden lg:block">
          <span className="text-xl font-bold">MindReMinder</span>
        </div>

        {/* nav */}
        <nav className="space-y-1 px-2 pb-6">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={cn(
                  "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-100",
                  active ? "bg-gray-100 text-gray-900" : "text-gray-600",
                )}
              >
                <Icon
                  className={cn(
                    "mr-3 h-5 w-5 flex-shrink-0",
                    active ? "text-primary" : "text-gray-400 group-hover:text-gray-600",
                  )}
                />
                {label}
              </Link>
            )
          })}
        </nav>
      </aside>
    </>
  )
}
