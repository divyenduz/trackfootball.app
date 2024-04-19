import 'tailwindcss/tailwind.css'
import { auth } from 'utils/auth'

import BaseLayout from '../BaseLayout'

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
  return <BaseLayout fullWidth={false}>{children}</BaseLayout>
}
