import styles from './styles.css?url'

export const Document: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <html lang="en">
    <head>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>TrackFootball.app - Track, Analyse and Improve Your Football Game</title>
      <meta name="description" content="TrackFootball is a social network for casual Football players. Record your game with any GPS watch/phone and upload it to TrackFootball to track, analyse and improve your performance." />
      <meta name="keywords" content="football, soccer, tracking, GPS, analysis, performance, social network, sports" />
      <meta property="og:title" content="TrackFootball.app - Track, Analyse and Improve Your Football Game" />
      <meta property="og:description" content="TrackFootball is a social network for casual Football players. Record your game with any GPS watch/phone and upload it to TrackFootball to track, analyse and improve your performance." />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://trackfootball.app" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="TrackFootball.app - Track, Analyse and Improve Your Football Game" />
      <meta name="twitter:description" content="TrackFootball is a social network for casual Football players. Record your game with any GPS watch/phone and upload it to TrackFootball to track, analyse and improve your performance." />
      <link rel="modulepreload" href="/src/client.tsx" />
      <link rel="stylesheet" href={styles} />
    </head>
    <body>
      <div id="root">{children}</div>
      <script>import("/src/client.tsx")</script>
    </body>
  </html>
)
