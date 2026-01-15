import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/providers/QueryProvider";
import { ExamProvider } from "@/contexts";
import { AppContent } from "@/components";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "문제다모아",
    template: "%s | 문제다모아",
  },
  description: "방송통신대학교 기출문제를 한곳에서 모아보세요. 효율적인 학습을 위한 문제 풀이 플랫폼입니다.",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
  keywords: ["방송통신대학교", "기출문제", "문제풀이", "학습", "시험", "방송대"],
  authors: [{ name: "문제다모아" }],
  creator: "문제다모아",
  publisher: "문제다모아",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "문제다모아",
    title: "문제다모아",
    description: "방송통신대학교 기출문제를 한곳에서 모아보세요. 효율적인 학습을 위한 문제 풀이 플랫폼입니다.",
    // url: "https://www.qknou.kr", // 실제 도메인으로 변경 필요
    // images: [
    //   {
    //     url: "https://your-domain.com/og-image.png",
    //     width: 1200,
    //     height: 630,
    //     alt: "문제다모아",
    //   },
    // ],
  },
  twitter: {
    card: "summary_large_image",
    title: "문제다모아",
    description: "방송통신대학교 기출문제를 한곳에서 모아보세요. 효율적인 학습을 위한 문제 풀이 플랫폼입니다.",
    // images: ["https://your-domain.com/og-image.png"],
  },
  // verification: {
  //   google: "your-google-verification-code",
  //   naver: "your-naver-verification-code",
  // },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryProvider>
          <ExamProvider>
            <AppContent>{children}</AppContent>
          </ExamProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
