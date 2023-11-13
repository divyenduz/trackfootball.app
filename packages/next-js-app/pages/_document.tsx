import Document, {
  DocumentContext,
  DocumentInitialProps,
  Head,
  Html,
  Main,
  NextScript,
} from 'next/document'
import React from 'react'

class MyDocument extends Document {
  static async getInitialProps(
    ctx: DocumentContext
  ): Promise<DocumentInitialProps> {
    const initialProps = await Document.getInitialProps(ctx)
    return { ...initialProps }
  }

  render(): React.ReactElement {
    return (
      <Html>
        <Head>
          <link
            rel="apple-touch-icon"
            sizes="180x180"
            href="assets/core/favicon/apple-touch-icon.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="32x32"
            href="assets/core/favicon/favicon-32x32.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="16x16"
            href="assets/core/favicon/favicon-16x16.png"
          />
          <link rel="manifest" href="assets/core/favicon/site.webmanifest" />
          <link
            rel="mask-icon"
            href="assets/core/favicon/safari-pinned-tab.svg"
            color="#5bbad5"
          />
          <meta name="msapplication-TileColor" content="#da532c" />
          <meta name="theme-color" content="#ffffff" />
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
          />
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/icon?family=Material+Icons"
          />
        </Head>
        <body>
          <Main />
          <NextScript />
          {/* Google Tag Manager (noscript) */}
          <noscript
            dangerouslySetInnerHTML={{
              __html: `<iframe src="https://www.googletagmanager.com/ns.html?id=GTM-KQQ3DSK"
  height="0" width="0" style="display:none;visibility:hidden"></iframe>`,
            }}
          ></noscript>
          {/* End Google Tag Manager (noscript) */}
        </body>
      </Html>
    )
  }
}

export default MyDocument
