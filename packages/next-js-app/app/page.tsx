import { redirect } from 'next/navigation'
import { auth } from 'utils/auth'

export default async function Home() {
  let user = null
  try {
    user = await auth()
  } catch (e) {}

  if (user) {
    redirect('/dashboard')
  } else {
    redirect('/home')
  }

  return <></>
}
