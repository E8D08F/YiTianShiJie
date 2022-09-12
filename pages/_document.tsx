import Document, { DocumentContext, DocumentInitialProps, Html, Head, Main, NextScript } from 'next/document'

class MyDocument extends Document {
    static async getInitialProps(
        ctx: DocumentContext
    ): Promise<DocumentInitialProps> {
        const initialProps = await Document.getInitialProps(ctx)

        return initialProps
    }

    render() {
      return (
        <Html lang="zh-tw">
          <Head>
            <link rel="stylesheet" href="https://unpkg.com/tategaki/assets/tategaki.css" />
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" />
            <link href="https://fonts.googleapis.com/css2?family=Crimson+Pro&display=swap" rel="stylesheet" />
            <script type="text/javascript" src="//typesquare.com/3/tsst/script/zh_tw/typesquare.js?631f3e24d50445ffb32d203eac1e02e5" charSet="utf-8"></script>
          </Head>
          <body>
            <Main />
            <NextScript />
          </body>
        </Html>
      )
    }
}

export default MyDocument
