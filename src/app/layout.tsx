import "./globals.css";
import { QueryProvider } from "@/providers/QueryProvider";
import { SessionProvider } from "@/providers/SessionProvider";

export const metadata = {
  title: "TransitOps — Smart Transport Operations Platform",
  description: "A centralized platform for vehicle registry, driver safety, dispatching, and fuel efficiency reports.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Outfit:wght@300;400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased min-h-screen">
        <QueryProvider>
          <SessionProvider>
            {children}
          </SessionProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
