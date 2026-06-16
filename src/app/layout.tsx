import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CMS Site Creation",
  description: "Create, validate, and generate CMS planning documents."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
