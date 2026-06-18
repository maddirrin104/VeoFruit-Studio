import type { Metadata } from "next";
import type { ReactNode } from "react";
import {
  Manrope,
  Sora,
} from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin", "vietnamese"],
  variable: "--font-manrope",
});

const sora = Sora({
  subsets: ["latin", "latin-ext"],
  variable: "--font-sora",
});

export const metadata: Metadata = {
  title: "VeoFruit Studio",
  description: "AI marketing video generator for fruit products",
  icons: {
    icon: "/app-icon.png",
    apple: "/app-icon.png",
    shortcut: "/app-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="vi">
      <body
        className={`${manrope.variable} ${sora.variable} font-[family:var(--font-manrope)] text-[#174132] antialiased`}
      >
        {children}
      </body>
    </html>
  );
}