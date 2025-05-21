'use client'

import { useState } from 'react'
import { Button, CircularProgress, Paper, Typography } from '@mui/material'
import { generateAllMapImages } from '../../actions/generateAllMapImages'

export default function AdminMapImagesPage() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleGenerateImages = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const data = await generateAllMapImages()
      setResults(data)
    } catch (err) {
      setError(String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <Typography variant="h4" component="h1" className="mb-6">
        Map Image Generation
      </Typography>

      <Paper className="p-6 mb-6">
        <Typography variant="h6" component="h2" className="mb-4">
          Generate Map Images for Activities
        </Typography>
        <Typography className="mb-4">
          This tool will generate static map images for all activities that don't have one yet.
          These images will be used in the feed to improve performance.
        </Typography>

        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleGenerateImages}
          disabled={loading}
          className="mb-4"
        >
          {loading ? (
            <>
              <CircularProgress size={20} color="inherit" className="mr-2" />
              Processing...
            </>
          ) : (
            'Generate Map Images'
          )}
        </Button>

        {error && (
          <Typography color="error" className="mt-4">
            Error: {error}
          </Typography>
        )}

        {results && (
          <div className="mt-6">
            <Typography variant="h6" component="h3" className="mb-2">
              Results
            </Typography>
            <Typography className="mb-2">
              Successfully generated {results.filter(r => r.success).length} out of {results.length} images.
            </Typography>
            
            <div className="mt-4 border rounded-md overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left">Post ID</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">Result</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-2">{result.postId}</td>
                      <td className="px-4 py-2">
                        {result.success ? (
                          <span className="text-green-600 font-medium">Success</span>
                        ) : (
                          <span className="text-red-600 font-medium">Failed</span>
                        )}
                      </td>
                      <td className="px-4 py-2">
                        {result.success ? (
                          <a 
                            href={result.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            View Image
                          </a>
                        ) : (
                          <span className="text-red-600">{result.error}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Paper>
    </div>
  )
}