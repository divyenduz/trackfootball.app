import { env } from 'cloudflare:workers'
import * as cookie from 'cookie'
import { jwtDecrypt } from 'jose'
import invariant from 'tiny-invariant'
import { hkdf } from '@panva/hkdf'

const DIGEST = 'sha256'
const BYTE_LENGTH = 32
const ENCRYPTION_INFO = 'JWE CEK'

type Session = {
  given_name: string
  family_name: string
  nickname: string
  name: string
  picture: string
  updated_at: string // ISO date string
  email: string
  email_verified: boolean
  iss: string
  aud: string
  sub: string
  iat: number // issued at (UNIX timestamp)
  exp: number // expiration time (UNIX timestamp)
  sid: string
  nonce: string
}

export async function getSession(headers: Headers) {
  const { isValid, session } = await isValidJwt(headers)
  if (isValid) {
    return session as Session
  }
  return null
}

async function isValidJwt(headers: Headers) {
  const encodedToken = getJwt(headers)
  if (!encodedToken) {
    return { isValid: false, session: null }
  }
  invariant(encodedToken, 'JWT is required')
  const token = await decodeJwt(encodedToken)

  const idToken = token?.idToken as string
  if (!idToken) {
    return { isValid: false, session: null }
  }

  try {
    const decodedIdToken = decodeJwtIdToken(idToken as string)
    const isValid = isValidJwtIdTokenSignature(decodedIdToken)
    return { isValid: await isValid, session: decodedIdToken.payload }
  } catch (err) {
    console.error('JWT verification failed:', err)
    return { isValid: false, session: null }
  }
}

function getJwt(headers: Headers) {
  const cookieHeader = headers.get('cookie')
  if (!cookieHeader) {
    return null
  }
  const cookies = cookie.parse(cookieHeader)
  const { appSession, auth_verification: authVerification } = cookies
  return appSession
}

async function decodeJwt(token: string) {
  const secret = await getSecret()
  const { payload, protectedHeader } = await jwtDecrypt(token, secret)
  return payload
}

export async function getSecret() {
  const secret = await hkdf(
    DIGEST,
    env.AUTH0_SECRET,
    '',
    ENCRYPTION_INFO,
    BYTE_LENGTH
  )
  return secret
}

function decodeJwtIdToken(token: string) {
  const parts = token.split('.')
  const header = JSON.parse(atob(parts[0]))
  const payload = JSON.parse(atob(parts[1]))
  const signature = atob(parts[2].replace(/_/g, '/').replace(/-/g, '+'))
  return {
    header: header,
    payload: payload,
    signature: signature,
    raw: { header: parts[0], payload: parts[1], signature: parts[2] },
  }
}

async function isValidJwtIdTokenSignature(token: {
  raw: { header: string; payload: string }
  signature: string
}) {
  const encoder = new TextEncoder()
  const data = encoder.encode([token.raw.header, token.raw.payload].join('.'))
  const signature = new Uint8Array(
    Array.from(token.signature).map((c) => c.charCodeAt(0))
  )
  // JWK data from
  // https://zoid.auth0.com/.well-known/jwks.json
  const jwk = {
    alg: 'RS256',
    kty: 'RSA',
    key_ops: ['verify'],
    use: 'sig',
    n: '4Botvct9Wi71rIwIZVVI7iKvIoAK3KYfNzyxOb3kKfYgMgSgUZoqnMjF_EmcFYcXT731Ij8y1l0BtPXOMCQTfz8aU2ndOPvSpeQz2bBJVRX-U0c-EBjiDUv1Q5KRK6Rd6iOdo9-7wE4Y3fpBUTTcMkEc8CGJIykhPOpQpeZsqyFlmakIPPUT75mvedwXvsRinvvB5yF0XDemTw-5IrA39DvbWkpnqZSioClSO6MoZZ8JDytio8DJJ45gQ31fJm06KRPhY9DlcRyCDkjEx2UEj8D1OP8pmsrrlCGYR0eAExX1O-pHhajBJJLI4gYRQXmQdGnwg8aS3ARi1N1yvBjYfQ',
    e: 'AQAB',
    kid: 'NTU2QTY1RTUwQzFENDU1RTkzMjAwMzQyRUE0OTg2NjdBOTY5MjEyNw',
    x5t: 'NTU2QTY1RTUwQzFENDU1RTkzMjAwMzQyRUE0OTg2NjdBOTY5MjEyNw',
    x5c: [
      'MIIC5DCCAcygAwIBAgIJCMl9DcA5rpr2MA0GCSqGSIb3DQEBBQUAMBkxFzAVBgNVBAMTDnpvaWQuYXV0aDAuY29tMB4XDTE2MTAxNTA1NTgyNVoXDTMwMDYyNDA1NTgyNVowGTEXMBUGA1UEAxMOem9pZC5hdXRoMC5jb20wggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQDgGi29y31aLvWsjAhlVUjuIq8igArcph83PLE5veQp9iAyBKBRmiqcyMX8SZwVhxdPvfUiPzLWXQG09c4wJBN/PxpTad04+9Kl5DPZsElVFf5TRz4QGOINS/VDkpErpF3qI52j37vAThjd+kFRNNwyQRzwIYkjKSE86lCl5myrIWWZqQg89RPvma953Be+xGKe+8HnIXRcN6ZPD7kisDf0O9taSmeplKKgKVI7oyhlnwkPK2KjwMknjmBDfV8mbTopE+Fj0OVxHIIOSMTHZQSPwPU4/ymayuuUIZhHR4ATFfU76keFqMEkksjiBhFBeZB0afCDxpLcBGLU3XK8GNh9AgMBAAGjLzAtMAwGA1UdEwQFMAMBAf8wHQYDVR0OBBYEFA/H3jMQBSvCFBMHWVom/wllRreNMA0GCSqGSIb3DQEBBQUAA4IBAQAx0Zn2WEKVdARlk8eMIrXlpg4euaF58BxQxOo4TEnApgdDXr0ku9sk6B0hKdlBw0Or74orxwtpYDL/aimqJdhNgshZjCLr97UXYBFWZStJJyH/peEIQCF0j6tDncaKvmc4Yhi+/l3Wcf42raczvIv1vqO47uSlYRdENau3/85eOQyfcFYcgBKWfWdQ7HAIikyqkyAi3aK9JZbGJKfi3LIyNaiEdwgyWR810qecgm0UwB00KsuBnDNNsirLi+zHK5ozJvsd7pAqm+Cl0sLdzNYtaQ5f8ZKMQ/4pMtcIVQQ1GrglW90nLPAAUS0nat9XqM5SaRFZgGWIHWDqNSllpl4G',
    ],
  }
  const key = await crypto.subtle.importKey(
    'jwk',
    jwk,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['verify']
  )
  return crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, signature, data)
}
