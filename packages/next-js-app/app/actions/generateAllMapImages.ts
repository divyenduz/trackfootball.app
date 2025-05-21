'use server'

import { sql } from '@trackfootball/database'
import { generateMapImage } from './generateMapImage'

// Generate all missing map images
export async function generateAllMapImages() {
  // Get all posts that have geoJson but no mapImageUrl
  const posts = await sql<{ id: number }[]>`
    SELECT id FROM "Post"
    WHERE "geoJson" IS NOT NULL 
    AND "mapImageUrl" IS NULL
    LIMIT 100
  `
  
  console.log(`Found ${posts.length} posts that need map images`)
  
  // Generate map images in parallel with rate limiting
  const results = await Promise.all(
    posts.map(async (post) => {
      try {
        const imageUrl = await generateMapImage(post.id)
        return { postId: post.id, success: !!imageUrl, url: imageUrl }
      } catch (error) {
        console.error(`Error generating map for post ${post.id}:`, error)
        return { postId: post.id, success: false, error: String(error) }
      }
    })
  )
  
  const successful = results.filter(r => r.success).length
  console.log(`Successfully generated ${successful} map images out of ${posts.length}`)
  
  return results
}

// Generate map image for a single post
export async function generateMapImageForPost(postId: number) {
  try {
    const imageUrl = await generateMapImage(postId)
    return { success: !!imageUrl, url: imageUrl }
  } catch (error) {
    console.error(`Error generating map for post ${postId}:`, error)
    return { success: false, error: String(error) }
  }
}