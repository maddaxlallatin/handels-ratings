import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { BottomNav } from "@/components/bottom-nav";
import { Header } from "@/components/header";
import { currentUser } from "@/lib/data";
import { cn } from "@/lib/utils";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Handels Ratings",
  description: "Rate Handel's ice cream with your crew.",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await currentUser();

  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body className="min-h-svh">
        <Header user={user ? { id: user.id, name: user.name } : null} />
        <main className="mx-auto w-full max-w-3xl px-4 pt-5 pb-[calc(5.5rem+env(safe-area-inset-bottom))]">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
