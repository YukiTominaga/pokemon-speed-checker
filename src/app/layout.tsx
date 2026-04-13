import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ポケモン素早さチェッカー",
  description: "ダブルバトル向けの素早さ比較ツール。無振り・最速の速度を自動計算し、先攻・後攻を瞬時に確認できます。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
