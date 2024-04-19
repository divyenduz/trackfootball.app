import { Hidden, NoSsr, Typography } from '@mui/material'
import Logo from 'components/atoms/brand/core/Logo'
import { AppBar } from 'components/organisms/AppBar'
import Image from 'next/image'
import Link from 'next/link'
import Script from 'next/script'
import 'tailwindcss/tailwind.css'
import { auth } from 'utils/auth'

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
  const fullWidth = true
  let user = null
  try {
    user = await auth()
  } catch (e) {
    console.error(e)
  }

  return (
    <html lang="en">
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
      <body>
        <div>
          <NoSsr>
            <AppBar pageName={'TrackFootball'} user={user}></AppBar>
          </NoSsr>
        </div>

        <div className="flex items-center justify-center">
          <div
            className={`flex flex-col items-center justify-center w-full ${
              fullWidth ? '' : 'max-w-4xl'
            } mt-24`}
          >
            {children}
          </div>
        </div>

        <div className="p-5 bg-oynx">
          <div className="flex flex-col items-center justify-center">
            <div className="mb-8 cursor-pointer ">
              <div className="flex items-center justify-center">
                <Logo size={'xs'} />
                {/* @ts-ignore */}
                <Hidden mdDown>
                  <Typography
                    variant="h6"
                    component={'h5'}
                    style={{
                      color: '#fff',
                      fontWeight: 300,
                      position: 'relative',
                    }}
                  >
                    TrackFootball
                  </Typography>
                </Hidden>
              </div>
              <span className="flex items-center justify-center text-sm font-light text-center text-gray-300">
                Made for players looking to improve their games
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-white underline dec">
              <Link legacyBehavior href="/privacy">
                <a target="_blank" className="text-gray-500">
                  Privacy Policy
                </a>
              </Link>
              <Link legacyBehavior href="mailto:hello@trackfootball.app">
                <a target="_blank" className="text-gray-500">
                  Contact Us
                </a>
              </Link>
            </div>
            <div className="flex flex-wrap items-center justify-center m-4">
              <Image
                width={100}
                height={50}
                alt="Compatible with Strava logo"
                src="/assets/strava/api_logo_cptblWith_strava_stack_white.svg"
              ></Image>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
