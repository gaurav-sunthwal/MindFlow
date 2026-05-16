import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TaskProvider } from "@/context/TaskContext";
import { EventProvider } from "@/context/EventContext";
import { NoteProvider } from "@/context/NoteContext";
import { DocumentProvider } from "@/context/DocumentContext";
import { AuthProvider } from "@/context/AuthContext";
import { SyncProvider } from "@/context/SyncContext";
import { Toaster } from 'sonner';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MindFlow | Dashboard",
  description: "A high-fidelity productivity dashboard.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full">
        <AuthProvider>
          <SyncProvider>
            <TaskProvider>
              <EventProvider>
                <NoteProvider>
                  <DocumentProvider>
                    {children}
                    <Toaster position="top-right" richColors />
                  </DocumentProvider>
                </NoteProvider>
              </EventProvider>
            </TaskProvider>
          </SyncProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
