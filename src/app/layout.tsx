import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ProductProvider } from "@/contexts/ProductContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ChatProvider } from "@/contexts/ChatContext";
import { ThemeProvider } from "@/contexts/ThemeContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "당근마켓",
  description: "당근마켓에서 가까운 이웃과 함께 나누어요!",
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-100 dark:bg-gray-900`}
      >
        {/* 모바일 컨테이너 */}
        <div className="max-w-md mx-auto bg-white min-h-screen relative shadow-xl">
          <ThemeProvider>
            <AuthProvider>
              <ProductProvider>
                <ChatProvider>
                  {children}
                </ChatProvider>
              </ProductProvider>
            </AuthProvider>
          </ThemeProvider>
        </div>
      </body>
    </html>
  );
}
