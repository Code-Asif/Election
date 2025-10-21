 
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { electionsApi, candidatesApi } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import { FloatingCard } from '../components/3d/FloatingCard'
import { GlowingCard } from '../components/3d/GlowingCard'
import { PulseButton } from '../components/3d/PulseButton'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { formatDate, formatTimeRemaining, getElectionStatus } from '../lib/utils'
import { Clock, Users, Vote, TrendingUp, Calendar, ArrowLeft } from 'lucide-react'

export function ElectionDetail() {
  const { slug } = useParams()
  const { isAdmin } = useAuth()
  
  const { data: election, isLoading: electionLoading } = useQuery({
    queryKey: ['election', slug],
    queryFn: () => electionsApi.getBySlug(slug!),
    enabled: !!slug,
  })

  const { data: candidates, isLoading: candidatesLoading } = useQuery({
    queryKey: ['candidates', election?.data?._id],
    queryFn: () => candidatesApi.getByElection(election?.data?._id!),
    enabled: !!election?.data?._id,
  })

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
          <Link to="/elections">
            <PulseButton>Back to Elections</PulseButton>
          </Link>
        </div>
      </div>
    )
  }

  const electionData = election.data
  const status = getElectionStatus(electionData.startAt, electionData.endAt)
  const isRunning = status === 'running'
  const isEnded = status === 'ended'

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Back Button */}
        <Link to="/elections" className="inline-flex items-center text-white/70 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Elections
        </Link>

        {/* Election Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <FloatingCard>
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-4xl font-bold text-white mb-4">
                      {electionData.title}
                    </CardTitle>
                    <CardDescription className="text-white/70 text-lg mb-6">
                      {electionData.description}
                    </CardDescription>
                  </div>
                  <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                    isRunning ? 'bg-green-500/20 text-green-400' :
                    isEnded ? 'bg-gray-500/20 text-gray-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    <span className="font-semibold capitalize">{status}</span>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-white/70" />
                    <div>
                      <p className="text-white/70 text-sm">Start Time</p>
                      <p className="text-white font-medium">{formatDate(electionData.startAt)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-white/70" />
                    <div>
                      <p className="text-white/70 text-sm">End Time</p>
                      <p className="text-white font-medium">{formatDate(electionData.endAt)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Users className="w-5 h-5 text-white/70" />
                    <div>
                      <p className="text-white/70 text-sm">Type</p>
                      <p className="text-white font-medium">
                        {electionData.type === 'public' ? 'Public' : 'Private'}
                      </p>
                    </div>
                  </div>
                </div>
                
                {isRunning && (
                  <div className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <div className="flex items-center space-x-2 text-green-400">
                      <TrendingUp className="w-5 h-5" />
                      <span className="font-semibold">
                        {formatTimeRemaining(electionData.endAt)} remaining
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </FloatingCard>
        </motion.div>

        {/* Candidates Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-12"
        >
          <h2 className="text-3xl font-bold text-white mb-8 text-center">
            {isRunning ? 'Cast Your Vote' : isEnded ? 'Final Results' : 'Candidates'}
          </h2>
          
          {candidates?.data?.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-white/70 text-lg">No candidates registered for this election.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {candidates?.data?.map((candidate: any, index: number) => (
                <motion.div
                  key={candidate._id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <GlowingCard>
                    <Card className="h-full">
                      <CardHeader className="text-center">
                        {candidate.photoUrl && (
                          <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden">
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
                        
                        {isRunning && !isAdmin && (
                          <Link to={`/vote/${electionData._id}`}>
                            <PulseButton className="w-full">
                              <Vote className="w-4 h-4 mr-2" />
                              Vote for {candidate.name}
                            </PulseButton>
                          </Link>
                        )}
                      </CardContent>
                    </Card>
                  </GlowingCard>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link to="/elections">
            <PulseButton variant="3d-secondary">
              Back to Elections
            </PulseButton>
          </Link>
          
          {isEnded && (
            <Link to={`/results/${electionData._id}`}>
              <PulseButton variant="3d-success">
                <TrendingUp className="w-4 h-4 mr-2" />
                View Results
              </PulseButton>
            </Link>
          )}
        </motion.div>
      </div>
    </div>
  )
}
