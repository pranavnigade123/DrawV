// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar";
import { ThemeProvider } from "next-themes";
import Footer from "@/components/Footer";
import { Analytics } from "@vercel/analytics/next"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DRAW V - Esports Platform",
  description: "A modern, interactive esports tournament management platform.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
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
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <Navbar />
            <main>
  {children}
  <Analytics />
</main>
<Footer></Footer>

          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}