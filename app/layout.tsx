// app/layout.tsx
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import Providers from "@/components/Providers"
import Navbar from "@/components/Navbar"
import { ThemeProvider } from "next-themes"
import Footer from "@/components/Footer"
import { Analytics } from "@vercel/analytics/next"
import Script from "next/script"

import ShowNavbar from "./admin/admin-ui/ShowNavbar" // NEW: hide navbar on /admin routes

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "DRAW Five - Esports Platform",
  description: "A modern, interactive esports tournament management platform.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* Google Analytics */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
        `}
      </Script>

      <body suppressHydrationWarning
        className={`
          ${geistSans.variable} ${geistMono.variable} antialiased
          bg-[color:var(--background)] text-[color:var(--foreground)]
          font-sans
        `}
        style={{
          fontFamily:
            "var(--font-geist-sans), var(--font-sans), Arial, Helvetica, sans-serif",
        }}
      >
        <Providers>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
            {/* Render Navbar everywhere EXCEPT /admin routes */}
            <ShowNavbar>
              <Navbar />
            </ShowNavbar>

            <main>
              {children}
              <Analytics />
            </main>

            <Footer />
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  )
}