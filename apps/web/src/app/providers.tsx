"use client";

import { QueryProvider } from "@/shared/providers";
import { ExamProvider } from "@/modules/exam";
import { AppContent } from "@/shared/ui/app-content";
import { Analytics } from "@vercel/analytics/react";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <ExamProvider>
        <AppContent>{children}</AppContent>
        <Analytics />
      </ExamProvider>
    </QueryProvider>
  );
}
