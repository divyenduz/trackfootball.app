'use server'

import { sql } from '@trackfootball/database'
import { FeatureCollection, LineString } from '@turf/helpers'
import puppeteer from 'puppeteer'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

// Configure AWS S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-southeast-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  }
})

// Bucket for storing map images
const BUCKET_NAME = process.env.S3_BUCKET || 'trackfootball-public'

export async function generateMapImage(postId: number): Promise<string | null> {
  // Check if image already exists
  const existingImage = await getMapImageUrl(postId)
  if (existingImage) {
    return existingImage
  }

  // Get geoJson for the post
  const result = await sql<{ geoJson: FeatureCollection<LineString> }[]>`
    SELECT "geoJson" FROM "Post" WHERE id = ${postId}
  `

  if (!result.length || !result[0].geoJson) {
    return null
  }

  const geoJson = result[0].geoJson

  // Launch browser to render map
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })

  try {
    const page = await browser.newPage()
    
    // Set viewport size for the image
    await page.setViewport({ width: 800, height: 400 })
    
    // Create a simple HTML page with Mapbox GL JS to render the map
    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset='utf-8'>
        <title>Map Image</title>
        <meta name='viewport' content='initial-scale=1,maximum-scale=1,user-scalable=no'>
        <script src='https://api.mapbox.com/mapbox-gl-js/v2.12.0/mapbox-gl.js'></script>
        <link href='https://api.mapbox.com/mapbox-gl-js/v2.12.0/mapbox-gl.css' rel='stylesheet'>
        <style>
          body { margin: 0; padding: 0; }
          #map { position: absolute; top: 0; bottom: 0; width: 100%; }
        </style>
      </head>
      <body>
        <div id='map'></div>
        <script>
          mapboxgl.accessToken = 'pk.eyJ1IjoiZGl2eWVuZHV6IiwiYSI6ImNqeTRvc212NzEzdXczY2syam92YnBwY3AifQ.40p53nLBipgbxUpfz5VKfw';
          const map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/streets-v11',
            center: [0, 0],
            zoom: 3
          });
          
          map.on('load', () => {
            // Add GeoJSON source
            map.addSource('route', {
              type: 'geojson',
              data: ${JSON.stringify(geoJson)}
            });
            
            // Add heatmap layer
            map.addLayer({
              id: 'heatmap',
              type: 'heatmap',
              source: 'route',
              paint: {
                'heatmap-radius': 5,
                'heatmap-weight': 1,
                'heatmap-intensity': 1,
                'heatmap-color': [
                  'interpolate',
                  ['linear'],
                  ['heatmap-density'],
                  0, 'rgba(33,102,172,0)',
                  0.2, 'rgb(103,169,207)',
                  0.4, 'rgb(209,229,240)',
                  0.6, 'rgb(253,219,199)',
                  0.8, 'rgb(239,138,98)',
                  1, 'rgb(178,24,43)'
                ],
                'heatmap-opacity': 0.8
              }
            });
            
            // Fit map to GeoJSON bounds
            const coordinates = geoJson.features[0].geometry.coordinates;
            const bounds = coordinates.reduce((bounds, coord) => {
              return bounds.extend(coord);
            }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));
            
            map.fitBounds(bounds, { padding: 50 });
            
            // Signal when map is ready for screenshot
            setTimeout(() => {
              document.title = 'READY_FOR_SCREENSHOT';
            }, 1000);
          });
        </script>
      </body>
      </html>
    `);
    
    // Wait for map to be ready
    await page.waitForFunction(() => document.title === 'READY_FOR_SCREENSHOT', { timeout: 10000 })
    
    // Take screenshot
    const screenshot = await page.screenshot({ type: 'jpeg', quality: 80 })
    
    // Upload to S3
    const key = `maps/${postId}.jpg`
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: screenshot,
      ContentType: 'image/jpeg',
      ACL: 'public-read'
    })
    
    await s3Client.send(command)
    
    // Return the URL to the image
    const imageUrl = `https://${BUCKET_NAME}.s3.amazonaws.com/${key}`
    
    // Store the image URL in the database for future use
    await sql`
      UPDATE "Post" 
      SET "mapImageUrl" = ${imageUrl}
      WHERE id = ${postId}
    `
    
    return imageUrl
  } catch (error) {
    console.error('Error generating map image:', error)
    return null
  } finally {
    await browser.close()
  }
}

// Get cached map image URL if it exists
export async function getMapImageUrl(postId: number): Promise<string | null> {
  const result = await sql<{ mapImageUrl: string | null }[]>`
    SELECT "mapImageUrl" FROM "Post" WHERE id = ${postId}
  `
  
  if (!result.length || !result[0].mapImageUrl) {
    return null
  }
  
  return result[0].mapImageUrl
}