import type { Viewport } from "next"
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
