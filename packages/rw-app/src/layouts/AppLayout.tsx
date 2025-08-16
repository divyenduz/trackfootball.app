import { LayoutProps } from 'rwsdk/router'
import { Footer } from '@/components/organisms/Footer'
import { AppBar } from '@/components/organisms/AppBar'

export function AppLayout({ children, requestInfo }: LayoutProps) {
  const user = requestInfo?.ctx.user || null

  return (
    <div className="app">
      <title>TrackFootball.app - Track, Analyse and Improve Your Football Game</title>
      <meta
        name="description"
        content="TrackFootball is a social network for casual Football players. Record your game with any GPS watch/phone and upload it to TrackFootball to track, analyse and improve your performance."
      />
      <header>
        <AppBar pageName={'TrackFootball'} user={user}></AppBar>
      </header>

      <main>
        <div className="flex items-center justify-center min-h-[600px]">
          <div
            className={`flex flex-col items-center justify-center w-full mt-16 sm:mt-24`}
          >
            {/* @ts-expect-error fix react types */}
            {children}
          </div>
        </div>
      </main>

      <footer>
        <Footer></Footer>
      </footer>
    </div>
  )
}
