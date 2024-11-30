import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { SocketProvider } from '@/hooks/useSocket'
import { ResourceProvider } from "@/hooks/useResources";
import { Analytics } from "@vercel/analytics/react";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Hexagon game",
  description: "Hexagon game using Three.js and Socket.io",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">      
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      > 
        <SocketProvider>
          <ResourceProvider>
            {children}
            <Analytics />
          </ResourceProvider>
        </SocketProvider>
      </body>
    </html>
  );
}
