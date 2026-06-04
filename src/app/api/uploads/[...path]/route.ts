import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params
    const filenamePath = (resolvedParams.path || []).join('/')
    const rootUploadDir = path.join(process.cwd(), 'uploads')
    const filePath = path.join(rootUploadDir, filenamePath)

    if (!fs.existsSync(filePath)) {
      return new NextResponse('Not found', { status: 404 })
    }

    const fileBuffer = fs.readFileSync(filePath)
    
    // Determine content type
    const ext = path.extname(filePath).toLowerCase()
    let contentType = 'image/jpeg'
    if (ext === '.png') contentType = 'image/png'
    else if (ext === '.webp') contentType = 'image/webp'
    else if (ext === '.gif') contentType = 'image/gif'
    else if (ext === '.svg') contentType = 'image/svg+xml'
    else if (ext === '.mp4') contentType = 'video/mp4'
    else if (ext === '.webm') contentType = 'video/webm'
    else if (ext === '.ogg') contentType = 'video/ogg'
    else if (ext === '.mov') contentType = 'video/quicktime'

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
