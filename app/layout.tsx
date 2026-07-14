import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import "./globals.css";
import SessionProvider from "@/app/components/SessionProvider";
import Header from "@/app/components/Header";

const notoSansKR = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "풋볼존 - 축구 커뮤니티",
  description: "대한민국 최고의 축구 커뮤니티, 풋볼존",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className={notoSansKR.className}>
      <body className="min-h-screen bg-[#f8fafc]">
        <SessionProvider>
          <Header />
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
