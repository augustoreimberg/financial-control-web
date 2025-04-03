import type { Metadata } from "next";
import { Inter } from 'next/font/google';
import "./globals.css";

// Initialize the Inter font with Latin subset
const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});

// Metadata for the application
export const metadata: Metadata = {
  title: "Quark Financial Control",
  description: "Manage your finances with precision and ease",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
