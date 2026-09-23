import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ROOTED — Understand Your Hair Products",
  description:
    "Take a photo of a hair product you already use. ROOTED helps you understand what's inside — from ingredients to what they are typically used for.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
