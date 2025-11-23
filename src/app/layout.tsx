import type { Metadata } from "next";
import "./globals.css";
import { ApplicationProvider } from "@/contexts/ApplicationContext";
import { InterviewProvider } from "@/contexts/InterviewContext";
import { TaskProvider } from "@/contexts/TaskContext";
import { ProfileProvider } from "@/contexts/ProfileContext";
import { ToastProvider } from "@/contexts/ToastContext";

import AppShell from "@/components/AppShell";

export const metadata: Metadata = {
  title: "Job Hunter Pro - Automate Your Job Search",
  description: "End-to-end job hunting automation tool for searching, applying, scheduling, and tracking your job applications",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ToastProvider>
          <ProfileProvider>
            <ApplicationProvider>
              <InterviewProvider>
                <TaskProvider>
                  <AppShell>
                    {children}
                  </AppShell>
                </TaskProvider>
              </InterviewProvider>
            </ApplicationProvider>
          </ProfileProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
