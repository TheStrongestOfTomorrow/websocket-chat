import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WebSocket Chat - Real-time P2P Messaging",
  description: "Create or join chat rooms with friends. Host a WebSocket chat and share your room code for instant messaging.",
  keywords: ["WebSocket", "Chat", "Real-time", "P2P", "Messaging", "Next.js", "React"],
  authors: [{ name: "WebSocket Chat" }],
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>💬</text></svg>",
  },
  openGraph: {
    title: "WebSocket Chat",
    description: "Real-time peer-to-peer messaging with room codes",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "WebSocket Chat",
    description: "Real-time peer-to-peer messaging with room codes",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
