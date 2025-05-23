import { AppBar } from 'components/organisms/AppBar'
import { Footer } from 'components/organisms/Footer'
import Script from 'next/script'
import 'tailwindcss/tailwind.css'
import { auth } from 'utils/auth'

import './styles.css'

export const metadata = {
  title: 'Landing | TrackFootball',
  description: 'Track, Analyse and Improve | Democratizing Football Science',
}

export type AwaitedUser = NonNullable<Awaited<ReturnType<typeof auth>>>

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await auth()

  return (
    <html lang="en">
      <head>
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
        <Script id="google-tag-manager" strategy="afterInteractive">
          {`
      <!-- Google Tag Manager -->
      (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer','GTM-KQQ3DSK');
      <!-- End Google Tag Manager -->
    `}
        </Script>
        {/* Google Tag Manager (noscript) */}
        <noscript
          dangerouslySetInnerHTML={{
            __html: `<iframe src="https://www.googletagmanager.com/ns.html?id=GTM-KQQ3DSK"
height="0" width="0" style="display:none;visibility:hidden"></iframe>`,
          }}
        ></noscript>
        {/* End Google Tag Manager (noscript) */}
      </head>
      <body>
        <div>
          <AppBar pageName={'TrackFootball'} user={user}></AppBar>
        </div>

        <div className="flex items-center justify-center min-h-[600px]">
          <div
            className={`flex flex-col items-center justify-center w-full mt-24`}
          >
            {children}
          </div>
        </div>

        <Footer></Footer>
      </body>
    </html>
  )
}
