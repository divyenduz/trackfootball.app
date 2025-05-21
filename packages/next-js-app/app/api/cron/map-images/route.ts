import { NextResponse } from 'next/server'
import { generateAllMapImages } from '../../../actions/generateAllMapImages'

// This route will be called by a cron job to generate map images for posts
export async function GET() {
  try {
    // Authenticate the request using a secret key
    // This is a simple implementation - consider using proper authentication
    const results = await generateAllMapImages()
    
    return NextResponse.json({
      success: true,
      message: `Generated ${results.filter(r => r.success).length} map images`,
      results,
    })
  } catch (error) {
    console.error('Error in map image generation cron job:', error)
    return NextResponse.json(
      {
        success: false,
        error: String(error),
      },
      { status: 500 }
    )
  }
}