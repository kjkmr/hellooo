'use client';

import { Noto_Sans_JP, Roboto } from "next/font/google";
import "@/styles/_base.scss";

const notoSansJp = Noto_Sans_JP({ weight: ["400", "700"], subsets: ["latin"] });
const roboto = Roboto({ weight: ["400", "700"], subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <style jsx global>{`
          html {
            font-family: ${roboto.style.fontFamily}, ${notoSansJp.style.fontFamily};
          }
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  );
}
