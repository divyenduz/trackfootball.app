import { LayoutProps } from 'rwsdk/router'
import { Footer } from '@/components/organisms/Footer'
import { AppBar } from '@/components/organisms/AppBar'

export function AppLayout({ children, requestInfo }: LayoutProps) {
  const user = requestInfo?.ctx.user || null

  return (
    <div className="app">
      <title>Home | TrackFootball</title>
      <meta
        name="description"
        content="Track, Analyse and Improve | Democratizing Football Science"
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
