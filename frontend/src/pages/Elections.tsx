import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { electionsApi } from '../lib/api'
import { FloatingCard } from '../components/3d/FloatingCard'
import { PulseButton } from '../components/3d/PulseButton'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { formatDate, formatTimeRemaining, getElectionStatus } from '../lib/utils'
import { Search, Clock, Users, Shield, Eye, Calendar, TrendingUp } from 'lucide-react'

export function Elections() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState<'all' | 'running' | 'ended'>('all')

  const { data: elections, isLoading } = useQuery({
    queryKey: ['elections'],
    queryFn: () => electionsApi.getAll(),
  })

  const filteredElections = elections?.data?.filter((election: any) => {
    const matchesSearch = election.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        election.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filter === 'all' || 
                         (filter === 'running' && getElectionStatus(election.startAt, election.endAt) === 'running') ||
                         (filter === 'ended' && getElectionStatus(election.startAt, election.endAt) === 'ended')
    return matchesSearch && matchesFilter
  }) || []

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'text-green-400'
      case 'ended': return 'text-gray-400'
      default: return 'text-blue-400'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <TrendingUp className="w-4 h-4" />
      case 'ended': return <Calendar className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="container mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            <span className="gradient-text">Elections</span>
          </h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Discover and participate in secure, transparent elections
          </p>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-12"
        >
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
              <Input
                placeholder="Search elections..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-blue-400"
              />
            </div>
            
            <div className="flex gap-2">
              {[
                { key: 'all', label: 'All' },
                { key: 'running', label: 'Running' },
                { key: 'ended', label: 'Ended' }
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key as any)}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    filter === key
                      ? 'bg-blue-500 text-white'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Elections Grid */}
        {filteredElections.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center py-20"
          >
            <div className="text-6xl mb-4">🗳️</div>
            <h3 className="text-2xl font-semibold text-white mb-2">
              No elections found
            </h3>
            <p className="text-white/70">
              {searchTerm ? 'Try adjusting your search terms' : 'No elections are currently available'}
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredElections.map((election: any, index: number) => {
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
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-white text-xl mb-2">
                              {election.title}
                            </CardTitle>
                            <CardDescription className="text-white/70 mb-4">
                              {election.description}
                            </CardDescription>
                          </div>
                          <div className={`flex items-center space-x-1 ${getStatusColor(status)}`}>
                            {getStatusIcon(status)}
                            <span className="text-sm font-medium capitalize">
                              {status}
                            </span>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent>
                        <div className="space-y-4">
                          {/* Election Info */}
                          <div className="space-y-2">
                            <div className="flex items-center text-white/70 text-sm">
                              <Clock className="w-4 h-4 mr-2" />
                              <span>
                                {isRunning 
                                  ? `${formatTimeRemaining(election.endAt)} remaining`
                                  : `Ended ${formatDate(election.endAt)}`
                                }
                              </span>
                            </div>
                            
                            <div className="flex items-center text-white/70 text-sm">
                              <Users className="w-4 h-4 mr-2" />
                              <span>
                                {election.type === 'public' ? 'Public' : 'Private'} Election
                              </span>
                            </div>
                            
                            {election.creator && (
                              <div className="flex items-center text-white/70 text-sm">
                                <Shield className="w-4 h-4 mr-2" />
                                <span>Created by {election.creator.name}</span>
                              </div>
                            )}
                          </div>

                          {/* Action Button */}
                          <div className="pt-4">
                            {isRunning ? (
                              <Link to={`/elections/${election.slug}`}>
                                <PulseButton className="w-full">
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Election
                                </PulseButton>
                              </Link>
                            ) : isEnded ? (
                              <Link to={`/results/${election._id}`}>
                                <PulseButton variant="3d-secondary" className="w-full">
                                  <TrendingUp className="w-4 h-4 mr-2" />
                                  View Results
                                </PulseButton>
                              </Link>
                            ) : (
                              <Link to={`/elections/${election.slug}`}>
                                <PulseButton variant="3d-secondary" className="w-full">
                                  <Calendar className="w-4 h-4 mr-2" />
                                  View Details
                                </PulseButton>
                              </Link>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </FloatingCard>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
