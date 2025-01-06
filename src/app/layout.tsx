import type { Metadata, Viewport } from "next"
import "./globals.sass"


export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 0.936,
  // background colours in light/dark mode
  // TODO: Read from stylesheet?
  themeColor: [
    {
      media: "(prefers-color-scheme: light)",
      color: "#fdfdfc",
    },
    {
      media: "(prefers-color-scheme: dark)",
      color: "#181a1b",
    },
  ]
}

export const metadata: Metadata = {
  openGraph: {
    siteName: "一天世界",
    images: [
      {
        url: "https://secure.gravatar.com/blavatar/3dd84179782d9f57210943aa1bf5064e?s=200",
        width: 200,
        height: 200,
      },
    ],
    locale: "zh_HK",
    type: "article",
  },
  twitter: {  // TODO: Check availability after acquisition of Twitter
    card: "summary",
    images: {
      url: "https://secure.gravatar.com/blavatar/3dd84179782d9f57210943aa1bf5064e?s=240",
    }
  }
}

const RootLayout = ({
  children
}: Readonly<{
  children: React.ReactNode
}>) => <html lang="zh-Hant">
  <head>
    <link rel="stylesheet" href="https://unpkg.com/tategaki/assets/tategaki.css" />
  </head>
  <body>{children}</body>
</html>

export default RootLayout
