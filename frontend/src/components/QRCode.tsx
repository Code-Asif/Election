import React, { useEffect, useRef } from 'react'
import QRCode from 'qrcode'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Download, Share2, Copy } from 'lucide-react'
import toast from 'react-hot-toast'

interface QRCodeProps {
  url: string
  title?: string
  description?: string
  className?: string
}

export function QRCodeComponent({ url, title, description, className }: QRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, url, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      }, (error) => {
        if (error) {
          console.error('QR Code generation error:', error)
        }
      })
    }
  }, [url])

  const handleDownload = () => {
    if (canvasRef.current) {
      const link = document.createElement('a')
      link.download = 'election-qr-code.png'
      link.href = canvasRef.current.toDataURL()
      link.click()
    }
  }

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(url)
    toast.success('URL copied to clipboard!')
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title || 'Election QR Code',
          text: description || 'Scan this QR code to participate in the election',
          url: url,
        })
      } catch (error) {
        console.error('Error sharing:', error)
        handleCopyUrl()
      }
    } else {
      handleCopyUrl()
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-center">{title || 'QR Code'}</CardTitle>
        {description && (
          <CardDescription className="text-center">{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center">
          <canvas ref={canvasRef} className="border rounded-lg" />
        </div>
        
        <div className="space-y-2">
          <div className="text-sm text-gray-600 break-all">
            {url}
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyUrl}
              className="flex-1"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy URL
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="flex-1"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="flex-1"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
