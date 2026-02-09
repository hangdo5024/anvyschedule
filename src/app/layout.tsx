import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { LayoutShell } from "@/components/layout/layout-shell";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-inter",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "AnvySchedule - Quản lý lịch học",
  description:
    "Hệ thống quản lý lịch học và sinh hoạt cho học sinh tiểu học",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`${geistSans.variable} font-sans antialiased`}>
        <LayoutShell>{children}</LayoutShell>
      </body>
    </html>
  );
}
