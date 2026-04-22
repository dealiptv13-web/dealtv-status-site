import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DealTV Status",
  description: "Panel durumları, kurulum rehberleri ve destek merkezi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}