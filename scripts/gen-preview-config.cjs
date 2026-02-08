const fs = require('fs')
const path = require('path')

const host = process.argv[2]
if (!host) {
  console.error('Usage: node gen-preview-config.cjs <hostname>')
  process.exit(1)
}

const rwAppDir = path.join(__dirname, '..', 'packages', 'rw-app')
const configPath = path.join(rwAppDir, 'dist', 'worker', 'wrangler.json')

const raw = fs.readFileSync(configPath, 'utf8')
const stripped = raw.replace(/^\s*\/\/.*$/gm, '').replace(/,\s*([\]}])/g, '$1')
const config = JSON.parse(stripped)
config.routes = [{ pattern: `${host}/*`, zone_name: 'trackfootball.dev' }]
config.vars = config.vars || {}
config.vars.COOKIE_DOMAIN = '.trackfootball.dev'
fs.writeFileSync(configPath, JSON.stringify(config, null, 2))
console.log('Patched dist/worker/wrangler.json with preview route:', host)
