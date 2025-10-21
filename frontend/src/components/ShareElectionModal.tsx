import { useState } from 'react'
import { motion } from 'framer-motion'
import { QRCodeComponent } from './QRCode'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { X, Copy, Share2, QrCode } from 'lucide-react'
import toast from 'react-hot-toast'

interface ShareElectionModalProps {
  election: {
    _id: string
    title: string
    slug: string
    description?: string
  }
  isOpen: boolean
  onClose: () => void
}

export function ShareElectionModal({ election, isOpen, onClose }: ShareElectionModalProps) {
  const [activeTab, setActiveTab] = useState<'url' | 'qr'>('url')
  
  const baseUrl = window.location.origin
  const electionUrl = `${baseUrl}/elections/${election.slug}`
  const shortUrl = `${baseUrl}/e/${election.slug}` // Short URL format

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url)
    toast.success('URL copied to clipboard!')
  }

  const handleShare = async (url: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: election.title,
          text: election.description || 'Participate in this election',
          url: url,
        })
      } catch (error) {
        console.error('Error sharing:', error)
        handleCopyUrl(url)
      }
    } else {
      handleCopyUrl(url)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-gray-900 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
      >
        <Card className="border-0 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="text-white">Share Election</CardTitle>
              <CardDescription className="text-white/70">{election.title}</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Tab Navigation */}
            <div className="flex space-x-1 bg-white/10 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab('url')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'url'
                    ? 'bg-white/20 text-white shadow-sm'
                    : 'text-white/60 hover:text-white/80'
                }`}
              >
                <Share2 className="w-4 h-4 inline mr-2" />
                Share URL
              </button>
              <button
                onClick={() => setActiveTab('qr')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'qr'
                    ? 'bg-white/20 text-white shadow-sm'
                    : 'text-white/60 hover:text-white/80'
                }`}
              >
                <QrCode className="w-4 h-4 inline mr-2" />
                QR Code
              </button>
            </div>

            {/* URL Tab */}
            {activeTab === 'url' && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="full-url" className="text-white">Full URL</Label>
                  <div className="flex space-x-2 mt-1">
                    <Input
                      id="full-url"
                      value={electionUrl}
                      readOnly
                      className="flex-1 bg-white/10 border-white/20 text-white"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyUrl(electionUrl)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleShare(electionUrl)}
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="short-url" className="text-white">Short URL</Label>
                  <div className="flex space-x-2 mt-1">
                    <Input
                      id="short-url"
                      value={shortUrl}
                      readOnly
                      className="flex-1 bg-white/10 border-white/20 text-white"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyUrl(shortUrl)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleShare(shortUrl)}
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="bg-blue-500/20 p-4 rounded-lg border border-blue-500/30">
                  <h4 className="font-medium text-blue-300 mb-2">Sharing Tips</h4>
                  <ul className="text-sm text-blue-200 space-y-1">
                    <li>• Use the short URL for social media posts</li>
                    <li>• The full URL works better for email invitations</li>
                    <li>• QR codes are perfect for printed materials</li>
                  </ul>
                </div>
              </div>
            )}

            {/* QR Code Tab */}
            {activeTab === 'qr' && (
              <div className="space-y-4">
                <QRCodeComponent
                  url={electionUrl}
                  title="Election QR Code"
                  description="Scan this QR code to participate in the election"
                />
                
                <div className="bg-green-500/20 p-4 rounded-lg border border-green-500/30">
                  <h4 className="font-medium text-green-300 mb-2">QR Code Usage</h4>
                  <ul className="text-sm text-green-200 space-y-1">
                    <li>• Print and display at voting locations</li>
                    <li>• Include in email signatures</li>
                    <li>• Add to presentation slides</li>
                    <li>• Share on social media</li>
                  </ul>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
