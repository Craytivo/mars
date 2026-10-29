import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DECEMBER 03 — A Journey Through Space",
  description: "A cinematic countdown to December 3, 2026.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
