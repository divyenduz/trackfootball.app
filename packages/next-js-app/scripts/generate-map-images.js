#!/usr/bin/env node

/**
 * This script generates map images for all activities that don't have one yet.
 * It can be run manually or as part of the build process.
 */

const https = require('https')
const url = process.env.TRACKFOOTBALL_URL || 'https://trackfootball.app'

console.log('Starting map image generation...')

// Call the map-images API endpoint
const apiUrl = `${url}/api/cron/map-images`
console.log(`Calling API at: ${apiUrl}`)

https.get(apiUrl, (res) => {
  let data = ''
  
  // A chunk of data has been received
  res.on('data', (chunk) => {
    data += chunk
  })
  
  // The whole response has been received
  res.on('end', () => {
    try {
      const result = JSON.parse(data)
      if (result.success) {
        console.log(`Map image generation completed successfully.`)
        console.log(`Generated ${result.results.filter(r => r.success).length} map images out of ${result.results.length} attempts.`)
      } else {
        console.error('Map image generation failed:', result.error)
        process.exit(1)
      }
    } catch (error) {
      console.error('Error parsing API response:', error)
      console.error('Raw response:', data)
      process.exit(1)
    }
  })

}).on('error', (err) => {
  console.error('Error calling API:', err.message)
  process.exit(1)
})