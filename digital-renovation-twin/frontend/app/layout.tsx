import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Façade Risk Analyzer",
  description: "AI-powered façade condition assessments."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-black text-neutral-50">
        {/* Top Navigation Bar - Vercel style */}
        <header className="sticky top-0 z-50 border-b border-neutral-800 bg-black/80 backdrop-blur-md">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
            {/* Logo + Product Name */}
            <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-80">
              {/* Building Icon */}
              <div className="flex h-8 w-8 items-center justify-center">
                <svg className="h-6 w-6 text-neutral-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2 22V8l10-6 10 6v14M6 12v4m4-6v6m4-6v6m4-4v4" />
                </svg>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-base font-semibold text-neutral-50">Façade Risk Analyzer</span>
                <span className="rounded bg-neutral-800 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-neutral-400">
                  Beta
                </span>
              </div>
            </Link>

            {/* Navigation */}
            <nav className="flex items-center gap-1">
              <Link 
                href="/" 
                className="btn-ghost"
              >
                Dashboard
              </Link>
              <Link 
                href="/upload" 
                className="btn-primary"
              >
                New Assessment
              </Link>
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main className="mx-auto max-w-6xl px-6 py-12">
          {children}
        </main>

        {/* Footer - minimal */}
        <footer className="border-t border-neutral-800">
          <div className="mx-auto max-w-6xl px-6 py-8">
            <div className="flex items-center justify-between">
              <p className="text-xs text-neutral-500">
                © 2024 Façade Risk Analyzer
              </p>
              <p className="text-xs text-neutral-600">
                AI-powered building condition assessment
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
