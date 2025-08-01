let env: any = {}

try {
  const cloudflareworkers = await import('cloudflare:workers')
  env = cloudflareworkers.env
} catch {
  // Fallback when cloudflare:workers is not available
  env = process.env || {}
}

export { env }
