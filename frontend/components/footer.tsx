import { Rss } from "lucide-react"
import Link from "next/link"

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-slate-200 bg-white mt-auto">
      <div className="mx-auto max-w-5xl px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-slate-500">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-orange-500">
            <Rss className="h-3 w-3 text-white" />
          </div>
          <span className="text-sm font-medium text-slate-700">RSS Aggregator</span>
          <span className="text-sm text-slate-400" suppressHydrationWarning>© {year}</span>
        </div>

        <div className="flex items-center gap-5 text-sm text-slate-400">
          <span>Built with Go + Next.js</span>
          <Link
            href="https://github.com/kittipoom332/go-rss-aggregator"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-slate-700 transition-colors font-medium"
          >
            GitHub
          </Link>
        </div>
      </div>
    </footer>
  )
}
