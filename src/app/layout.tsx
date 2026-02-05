// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/providers/QueryProvider";
import { ExamProvider } from "@/contexts";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppContent } from "@/components";
import { Analytics } from '@vercel/analytics/react';
import { SITE_URL } from "@/constants";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_NAME = "큐노";
const SITE_DESC =
  "큐노(QKNOU)는 방송통신대학교(KNOU) 기출문제를 한곳에서 제공하는 문제 풀이 플랫폼입니다. 과목/연도별 문제 풀이와 학습을 지원합니다.";
const OG_IMAGE = `${SITE_URL}/mobile_preview.png`;

/**
 * ✅ 검색 유입용 보조 타이틀 구조
 * - 브랜드 고정: QKNOU
 * - 키워드 보조: "방송통신대학교 기출문제"를 title 템플릿에 포함
 *   (브랜드 검색 + 일반 검색(키워드) 둘 다 잡는 방식)
 *
 * 예)
 * - 홈: QKNOU | 방송통신대학교 기출문제
 * - 과목: 컴퓨터과학과 | 방송통신대학교 기출문제 | QKNOU
 * - 풀이: 2024 기출 | 컴퓨터과학과 | 방송통신대학교 기출문제 | QKNOU
 */
const TITLE_SUFFIX = "방송통신대학교 기출문제";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default: `${SITE_NAME} | ${TITLE_SUFFIX}`,
    template: `%s | ${TITLE_SUFFIX} | ${SITE_NAME}`,
  },

  description: SITE_DESC,

  alternates: {
    canonical: SITE_URL,
  },

  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },

  keywords: [
    "QKNOU",
    "큐노",
    "방송통신대학교",
    "KNOU",
    "방송대",
    "기출문제",
    "기출",
    "문제풀이",
    "시험",
    "학습",
  ],

  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,

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
    siteName: SITE_NAME,
    title: `${SITE_NAME} | ${TITLE_SUFFIX}`,
    description: SITE_DESC,
    url: SITE_URL,
    images: [
      {
        url: OG_IMAGE,          // public/mobile_preview.png
        width: 1200,           
        height: 630,            
        alt: SITE_NAME,
      },
    ],  },

  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | ${TITLE_SUFFIX}`,
    description: SITE_DESC,
    images: [OG_IMAGE],
  },

  /**
   * ✅ 네이버/구글 서치콘솔 기준: 사이트 소유 확인(권장)
   * - Google: verification.google → <meta name="google-site-verification" content="..." />
   * - Naver: verification.other["naver-site-verification"] → <meta name="naver-site-verification" content="..." />
   */
  verification: {
    google: "eP1MM8pNKrPdUc8zSu25dccVy4zJH2yY1ik4DRJ01Ks",
    other: {
      "naver-site-verification":
        "939acec133cb5b79530e3c4a8d65de5a34f953a1",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`} suppressHydrationWarning>
        <AuthProvider>
          <QueryProvider>
            <ExamProvider>
              <AppContent>{children}</AppContent>
            </ExamProvider>
          </QueryProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
