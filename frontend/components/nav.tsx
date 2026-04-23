"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { clearToken } from "@/lib/auth"
import { Rss, LogOut, Menu, X } from "lucide-react"
import { DemoBanner } from "@/components/demo-banner"
import { cn } from "@/lib/utils"

const NAV_LINKS = [
  { href: "/dashboard", label: "Feed" },
  { href: "/feeds", label: "Manage Feeds" },
]

export function Nav() {
  const router = useRouter()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  function handleLogout() {
    clearToken()
    router.push("/login")
  }

  function closeMobile() {
    setMobileOpen(false)
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white shadow-sm">
        {/* Main bar */}
        <div className="mx-auto max-w-5xl flex items-center justify-between px-4 sm:px-6 h-16">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 text-slate-900 hover:text-slate-700 transition-colors"
            onClick={closeMobile}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500">
              <Rss className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">RSS Aggregator</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            {NAV_LINKS.map(({ href, label }) => {
              const isActive =
                href === "/feeds" ? pathname.startsWith("/feeds") : pathname === href
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-orange-50 text-orange-600"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  )}
                >
                  {label}
                </Link>
              )
            })}

            <button
              onClick={handleLogout}
              className="ml-3 flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 transition-colors border border-slate-200"
              aria-label="Log out"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </nav>

          {/* Mobile hamburger */}
          <button
            className="md:hidden flex items-center justify-center h-9 w-9 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white px-4 pb-4 pt-2 space-y-1">
            {NAV_LINKS.map(({ href, label }) => {
              const isActive =
                href === "/feeds" ? pathname.startsWith("/feeds") : pathname === href
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={closeMobile}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex items-center px-4 py-3 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-orange-50 text-orange-600"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  )}
                >
                  {label}
                </Link>
              )
            })}

            <button
              onClick={() => { closeMobile(); handleLogout() }}
              className="w-full flex items-center gap-2 px-4 py-3 rounded-md text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        )}
      </header>
      <DemoBanner />
    </>
  )
}
