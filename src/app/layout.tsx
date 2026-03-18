import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
});

export const metadata: Metadata = {
  title: "VeoFruit Studio",
  description: "Static UI for AI marketing video generator",
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="vi">
      <body className={`${inter.className} text-white antialiased`}>
        {children}
      </body>
    </html>
  );
}