import { route } from 'rwsdk/router'
import { Login } from './Login'

export const userRoutes = [
  route('/login', [Login]),
  route('/logout', async function ({ request }) {
    const headers = new Headers()
    headers.set('Location', '/')

    return new Response(null, {
      status: 302,
      headers,
    })
  }),
]
