import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SessionProvider } from "../providers/SessionProvider";
import { QueryProvider } from "../providers/QueryProvider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TransitOps — Fleet Management System",
  description: "Enterprise fleet management, trip dispatch, and operational analytics",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <QueryProvider>
          <SessionProvider>{children}</SessionProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
