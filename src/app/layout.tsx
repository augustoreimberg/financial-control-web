import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "QWallet",
  description: "Carteira da Quark",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <main className="min-h-screen bg-gradient-to-br from-zinc-950 to-zinc-900 flex flex-col">{children}</main>
      </body>
    </html>
  )
}
