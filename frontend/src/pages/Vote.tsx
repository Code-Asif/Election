import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { electionsApi, candidatesApi, votesApi } from '../lib/api'
import { FloatingCard } from '../components/3d/FloatingCard'
import { GlowingCard } from '../components/3d/GlowingCard'
import { PulseButton } from '../components/3d/PulseButton'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { formatDate, formatTimeRemaining, getElectionStatus } from '../lib/utils'
import { Vote as VoteIcon, CheckCircle, Clock, Users } from 'lucide-react'
import toast from 'react-hot-toast'

export function Vote() {
  const { electionId } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [selectedCandidate, setSelectedCandidate] = React.useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const { data: election, isLoading: electionLoading } = useQuery({
    queryKey: ['election', electionId],
    queryFn: () => electionsApi.getById(electionId!),
    enabled: !!electionId,
  })

  const { data: candidates, isLoading: candidatesLoading } = useQuery({
    queryKey: ['candidates', electionId],
    queryFn: () => candidatesApi.getByElection(electionId!),
    enabled: !!electionId,
  })

  const { data: voteStatus } = useQuery({
    queryKey: ['vote-status', electionId],
    queryFn: () => votesApi.checkStatus(electionId!),
    enabled: !!electionId,
  })

  const castVoteMutation = useQuery({
    queryKey: ['cast-vote'],
    queryFn: () => votesApi.cast({
      electionId: electionId!,
      candidateId: selectedCandidate!
    }),
    enabled: false,
  })

  // Redirect to results if user has already voted (must be before any returns)
  React.useEffect(() => {
    if (voteStatus?.data?.hasVoted && electionId) {
      navigate(`/results/${electionId}`)
    }
  }, [voteStatus?.data?.hasVoted, electionId, navigate])

  const handleVote = async () => {
    if (!selectedCandidate) {
      toast.error('Please select a candidate')
      return
    }

    if (isSubmitting) {
      return
    }

    setIsSubmitting(true)
    try {
      await votesApi.cast({
        electionId: electionId!,
        candidateId: selectedCandidate
      })
      // Invalidate caches so results and status refresh immediately
      if (electionId) {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['results', electionId] }),
          queryClient.invalidateQueries({ queryKey: ['vote-status', electionId] }),
        ])
      }
      toast.success('Vote cast successfully!')
      // Redirect to results page
      setTimeout(() => {
        navigate(`/results/${electionId}`)
      }, 1500)
    } catch (error: any) {
      console.error('Vote casting error:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Failed to cast vote'
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (electionLoading || candidatesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    )
  }

  if (!election?.data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Election Not Found</h1>
          <p className="text-white/70 mb-8">The election you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }

  const electionData = election.data
  const status = getElectionStatus(electionData.startAt, electionData.endAt)
  const isRunning = status === 'running'
  const hasVoted = voteStatus?.data?.hasVoted

  if (!isRunning) {
    return (
      <div className="min-h-screen flex items-center justify-center py-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl"
        >
          <FloatingCard>
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-3xl font-bold text-white mb-4">
                  Election Not Active
                </CardTitle>
                <CardDescription className="text-white/70 text-lg">
                  This election is not currently accepting votes.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-center space-x-2 text-white/70">
                    <Clock className="w-5 h-5" />
                    <span>
                      {status === 'upcoming' 
                        ? `Starts ${formatDate(electionData.startAt)}`
                        : `Ended ${formatDate(electionData.endAt)}`
                      }
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </FloatingCard>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Election Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <FloatingCard>
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-4xl font-bold text-white mb-4">
                  {electionData.title}
                </CardTitle>
                <CardDescription className="text-white/70 text-lg mb-6">
                  {electionData.description}
                </CardDescription>
                <div className="flex items-center justify-center space-x-2 text-green-400">
                  <Clock className="w-5 h-5" />
                  <span className="font-semibold">
                    {formatTimeRemaining(electionData.endAt)} remaining
                  </span>
                </div>
              </CardHeader>
            </Card>
          </FloatingCard>
        </motion.div>

        {/* Candidates */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-12"
        >
          <h2 className="text-3xl font-bold text-white mb-8 text-center">
            Select Your Candidate
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {candidates?.data?.map((candidate, index) => (
              <motion.div
                key={candidate._id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <GlowingCard
                  glowColor={selectedCandidate === candidate._id ? '#10b981' : '#667eea'}
                  intensity={selectedCandidate === candidate._id ? 0.6 : 0.3}
                >
                  <Card 
                    className={`cursor-pointer transition-all ${
                      selectedCandidate === candidate._id 
                        ? 'ring-2 ring-green-400 bg-green-500/10' 
                        : 'hover:bg-white/5'
                    }`}
                    onClick={() => setSelectedCandidate(candidate._id)}
                  >
                    <CardHeader className="text-center">
                      {candidate.photoUrl && (
                        <div className="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden">
                          <img 
                            src={candidate.photoUrl} 
                            alt={candidate.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <CardTitle className="text-white text-xl">
                        {candidate.name}
                      </CardTitle>
                      {candidate.bio && (
                        <CardDescription className="text-white/70">
                          {candidate.bio}
                        </CardDescription>
                      )}
                    </CardHeader>
                    
                    <CardContent>
                      {candidate.manifesto && (
                        <div className="mb-4">
                          <h4 className="text-white font-semibold mb-2">Manifesto</h4>
                          <p className="text-white/70 text-sm">
                            {candidate.manifesto}
                          </p>
                        </div>
                      )}
                      
                      {selectedCandidate === candidate._id && (
                        <div className="flex items-center justify-center space-x-2 text-green-400">
                          <CheckCircle className="w-5 h-5" />
                          <span className="font-semibold">Selected</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </GlowingCard>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Vote Button */}
        {selectedCandidate && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <PulseButton
              onClick={handleVote}
              disabled={isSubmitting}
              className="text-lg px-8 py-4"
            >
              <VoteIcon className="w-5 h-5 mr-2" />
              {isSubmitting ? 'Casting Vote...' : 'Cast My Vote'}
            </PulseButton>
          </motion.div>
        )}
      </div>
    </div>
  )
}
