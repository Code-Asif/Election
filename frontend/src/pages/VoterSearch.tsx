import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { electionsApi, votesApi } from '../lib/api'
import { FloatingCard } from '../components/3d/FloatingCard'
import { GlowingCard } from '../components/3d/GlowingCard'
import { PulseButton } from '../components/3d/PulseButton'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button'
import { formatDate, formatTimeRemaining, getElectionStatus } from '../lib/utils'
import { Search, Calendar, Users, Clock, ArrowLeft, QrCode } from 'lucide-react'
import toast from 'react-hot-toast'

export function VoterSearch() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedElection, setSelectedElection] = useState<any>(null)

  const { data: elections, isLoading } = useQuery({
    queryKey: ['elections', 'public'],
    queryFn: () => electionsApi.getAll({ public: true }),
  })

  const electionsList = elections?.data || elections || []
  
  const filteredElections = electionsList.filter(election =>
    election.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    election.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleVote = async (election: any) => {
    if (getElectionStatus(election.startAt, election.endAt) !== 'running') {
      toast.error('This election is not currently running')
      return
    }
    try {
      const status = await votesApi.checkStatus(election._id)
      if (status?.data?.hasVoted) {
        toast.success('You have already voted. Redirecting to results...')
        navigate(`/results/${election._id}`)
      } else {
        navigate(`/vote/${election._id}`)
      }
    } catch (err) {
      // If status check fails (e.g., auth), fall back to vote page
      navigate(`/vote/${election._id}`)
    }
  }

  const handleQRScan = () => {
    // This would integrate with a QR code scanner
    toast.success('QR code scanner would open here')
  }

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-4">Find Elections</h1>
              <p className="text-white/70 text-lg">
                Search for elections you can participate in
              </p>
            </div>
            <div className="flex space-x-4">
              <PulseButton
                variant="3d-secondary"
                onClick={() => navigate('/')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </PulseButton>
              <PulseButton
                variant="3d-primary"
                onClick={handleQRScan}
              >
                <QrCode className="w-4 h-4 mr-2" />
                Scan QR Code
              </PulseButton>
            </div>
          </div>

          {/* Search Bar */}
          <GlowingCard>
            <Card>
              <CardContent className="p-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
                  <Input
                    type="text"
                    placeholder="Search elections by title or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-blue-400"
                  />
                </div>
              </CardContent>
            </Card>
          </GlowingCard>
        </motion.div>

        {/* Elections List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
          </div>
        ) : filteredElections.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center py-20"
          >
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-white mb-4">No Elections Found</h3>
            <p className="text-white/70 mb-8">
              {searchTerm 
                ? 'Try adjusting your search terms'
                : 'There are no elections available at the moment'
              }
            </p>
            {searchTerm && (
              <Button
                variant="outline"
                onClick={() => setSearchTerm('')}
                className="text-white border-white/20 hover:bg-white/10"
              >
                Clear Search
              </Button>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredElections.map((election, index) => {
              const status = getElectionStatus(election.startAt, election.endAt)
              const isRunning = status === 'running'
              const isEnded = status === 'ended'
              
              return (
                <motion.div
                  key={election._id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <FloatingCard>
                    <Card className="h-full">
                      <CardHeader>
                        <CardTitle className="text-white">{election.title}</CardTitle>
                        <CardDescription className="text-white/70">
                          {election.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center text-white/70">
                            <Calendar className="w-4 h-4 mr-2" />
                            <span>Starts: {formatDate(election.startAt)}</span>
                          </div>
                          <div className="flex items-center text-white/70">
                            <Calendar className="w-4 h-4 mr-2" />
                            <span>Ends: {formatDate(election.endAt)}</span>
                          </div>
                          <div className="flex items-center text-white/70">
                            <Users className="w-4 h-4 mr-2" />
                            <span>{election.type === 'public' ? 'Public' : 'Private'} Election</span>
                          </div>
                        </div>

                        <div className="flex items-center">
                          {isRunning ? (
                            <div className="flex items-center text-green-400">
                              <Clock className="w-4 h-4 mr-2" />
                              <span>{formatTimeRemaining(election.endAt)} remaining</span>
                            </div>
                          ) : isEnded ? (
                            <div className="flex items-center text-red-400">
                              <Clock className="w-4 h-4 mr-2" />
                              <span>Election Ended</span>
                            </div>
                          ) : (
                            <div className="flex items-center text-yellow-400">
                              <Clock className="w-4 h-4 mr-2" />
                              <span>Not Started Yet</span>
                            </div>
                          )}
                        </div>

                        <div className="flex space-x-2">
                          {isRunning ? (
                            <PulseButton
                              variant="3d-primary"
                              size="sm"
                              onClick={() => handleVote(election)}
                              className="flex-1"
                            >
                              Vote Now
                            </PulseButton>
                          ) : isEnded ? (
                            <PulseButton
                              variant="3d-secondary"
                              size="sm"
                              onClick={() => navigate(`/results/${election._id}`)}
                              className="flex-1"
                            >
                              View Results
                            </PulseButton>
                          ) : (
                            <PulseButton
                              variant="3d-secondary"
                              size="sm"
                              disabled
                              className="flex-1"
                            >
                              Not Started
                            </PulseButton>
                          )}
                          <PulseButton
                            variant="3d-secondary"
                            size="sm"
                            onClick={() => navigate(`/elections/${election.slug}`)}
                            className="flex-1"
                          >
                            View Details
                          </PulseButton>
                        </div>
                      </CardContent>
                    </Card>
                  </FloatingCard>
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </div>
    </div>
  )
}
