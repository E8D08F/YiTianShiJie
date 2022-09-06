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
