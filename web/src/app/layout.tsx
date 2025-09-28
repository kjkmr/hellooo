import { Noto_Sans_JP, Roboto } from "next/font/google";
import "@/styles/_base.scss";
import Script from "next/script";

const notoSansJp = Noto_Sans_JP({ weight: ["400", "700"], subsets: ["latin"] });
const roboto = Roboto({ weight: ["400", "700"], subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${roboto.className} ${notoSansJp.className}`}>
      <head>
        <meta property="og:title" content="Hellooo.cards" />
        <meta
          property="og:description"
          content="イベントでの繋がりを加速する、リアルとSNSをつなぐ名前シール"
        />
        <meta property="og:image" content="/images/og-image.png" />
        <meta property="og:url" content="https://www.hellooo.cards/" />
      </head>
      <body>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-K4PLVVEK9B"
          strategy="afterInteractive"
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-K4PLVVEK9B');
            `,
          }}
        />
        {children}
      </body>
    </html>
  );
}
