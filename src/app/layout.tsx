import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Sidebar } from '@/components/Sidebar'
import { Toaster } from "@/components/ui/sonner" 
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Job Match AI",
  description: "AI Powered Resume Analyzer",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
          <Sidebar />
          <main className="flex-1 overflow-y-auto h-screen">
            {children}
          </main>
          <Toaster position="top-center" richColors /> 
        </div>
      </body>
    </html>
  );
}