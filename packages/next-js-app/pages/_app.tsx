import { withTRPC } from '@trpc/next'
import { withLDProvider } from 'launchdarkly-react-client-sdk'
import type { AppProps } from 'next/app'
import getConfig from 'next/config'
import Script from 'next/script'
import { compose } from 'recompose'
import 'tailwindcss/tailwind.css'

import { AppRouter } from './api/trpc/[trpc]'
import './styles.css'

const { publicRuntimeConfig } = getConfig()

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
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
      <Component {...pageProps} />
    </>
  )
}

export default compose(
  withTRPC<AppRouter>({
    config() {
      const url = publicRuntimeConfig.BackendApiUrl + '/trpc'
      return {
        url,
        queryClientConfig: {
          defaultOptions: {
            queries: {
              refetchOnWindowFocus: false,
            },
          },
        },
      }
    },
    ssr: false,
  })
  //@ts-expect-error
)(MyApp)
