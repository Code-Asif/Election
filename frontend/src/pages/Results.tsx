import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { votesApi, electionsApi } from '../lib/api'
import { getElectionStatus } from '../lib/utils'
import { FloatingCard } from '../components/3d/FloatingCard'
import { GlowingCard } from '../components/3d/GlowingCard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { formatDate } from '../lib/utils'
import { TrendingUp, Users, Calendar, Award } from 'lucide-react'

export function Results() {
  const { electionId } = useParams()

  // Fetch election details to check status
  const { data: electionData } = useQuery({
    queryKey: ['election', electionId],
    queryFn: () => electionsApi.getById(electionId!),
    enabled: !!electionId,
  })

  const electionStatus = electionData?.data ? getElectionStatus(electionData.data.startAt, electionData.data.endAt) : null
  const isRunning = electionStatus === 'running'

  // Poll results every 5 seconds if election is running, otherwise fetch once
  const { data: results, isLoading } = useQuery({
    queryKey: ['results', electionId],
    queryFn: () => votesApi.getResults(electionId!),
    enabled: !!electionId,
    refetchInterval: isRunning ? 5000 : false, // Poll every 5 seconds if running
  })

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    )
  }

  if (!results?.data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Results Not Available</h1>
          <p className="text-white/70 mb-8">The results for this election are not yet available.</p>
        </div>
      </div>
    )
  }

  const { election, results: resultPayload } = results.data
  const electionResults = Array.isArray(resultPayload) ? resultPayload : []

  // Debug logging
  console.log('Results data:', results.data)
  console.log('Election results:', electionResults)
  console.log('Individual results:', electionResults.map((r: any) => ({
    name: r.candidate.name,
    voteCount: r.voteCount,
    percentage: r.percentage
  })))

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="container mx-auto max-w-6xl">
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
                  {election.title} - Results
                </CardTitle>
                <CardDescription className="text-white/70 text-lg mb-6">
                  {isRunning ? 'Live Results - Updates every 5 seconds' : 'Final Results'}
                </CardDescription>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex items-center justify-center space-x-2 text-white/70">
                    <Users className="w-5 h-5" />
                    <span>{election.totalVotes} Total Votes</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2 text-white/70">
                    <Calendar className="w-5 h-5" />
                    <span>Ended {formatDate(election.endAt)}</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2 text-white/70">
                    <TrendingUp className="w-5 h-5" />
                    <span>{election.status}</span>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </FloatingCard>
        </motion.div>

        {/* Results */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-12"
        >
          <h2 className="text-3xl font-bold text-white mb-8 text-center">
            {isRunning ? 'Current Leading Results' : 'Final Results'}
          </h2>
          {electionResults.length === 0 && (
            <div className="text-center text-white/70 mb-8">
              No votes yet.
            </div>
          )}
          
          {isRunning && (
            <div className="mb-6 text-center">
              <div className="inline-flex items-center space-x-2 bg-green-500/20 text-green-400 px-4 py-2 rounded-lg border border-green-500/30">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="font-semibold">Live Updates Active</span>
              </div>
            </div>
          )}
          
          <div className="space-y-6">
            {electionResults.map((result, index) => (
              <motion.div
                key={result.candidate.id}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <GlowingCard
                  glowColor={index === 0 ? '#fbbf24' : '#667eea'}
                  intensity={index === 0 ? 0.6 : 0.3}
                >
                  <Card className={`${index === 0 ? 'ring-2 ring-yellow-400' : ''}`}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          {index === 0 && (
                            <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                              <Award className="w-5 h-5 text-white" />
                            </div>
                          )}
                          <div>
                            <h3 className="text-xl font-semibold text-white">
                              {result.candidate.name}
                            </h3>
                            {result.candidate.bio && (
                              <p className="text-white/70 text-sm">
                                {result.candidate.bio}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-white">
                            {result.voteCount} votes
                          </div>
                          <div className="text-white/70">
                            {result.percentage}%
                          </div>
                        </div>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="mt-4">
                        <div className="w-full bg-white/20 rounded-full h-3">
                          <div 
                            className={`h-3 rounded-full transition-all duration-1000 ${
                              index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                              index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-600' :
                              'bg-gradient-to-r from-blue-400 to-blue-600'
                            }`}
                            style={{ width: `${result.percentage}%` }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </GlowingCard>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
