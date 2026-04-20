import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "HuskyADAPT Engineering OS",
  description: "Engineering execution and decision traceability for HuskyADAPT design teams",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="h-full">
        <div className="flex h-full bg-background">
          <Sidebar />
          <main className="flex-1 overflow-y-auto">
            <div className="max-w-7xl mx-auto p-6">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
