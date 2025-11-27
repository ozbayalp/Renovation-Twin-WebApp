import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Digital Renovation Twin",
  description: "Upload façade photos and track reconstruction jobs."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900">
        <div className="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-8">
          <header className="rounded-md bg-white p-4 shadow-sm">
            <h1 className="text-2xl font-semibold">Digital Renovation Twin</h1>
            <p className="text-sm text-slate-600">Photogrammetry + AI damage detection MVP</p>
          </header>
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
