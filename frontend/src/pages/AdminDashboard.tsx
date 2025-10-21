import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { electionsApi } from '../lib/api'
import toast from 'react-hot-toast'
import { FloatingCard } from '../components/3d/FloatingCard'
import { GlowingCard } from '../components/3d/GlowingCard'
import { PulseButton } from '../components/3d/PulseButton'
import { ShareElectionModal } from '../components/ShareElectionModal'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { formatDate, formatTimeRemaining, getElectionStatus } from '../lib/utils'
import { Plus, BarChart3, Users, Settings, TrendingUp, Clock, Share2, Trash2, StopCircle } from 'lucide-react'

export function AdminDashboard() {
  const queryClient = useQueryClient()
  const [shareModal, setShareModal] = useState<{
    isOpen: boolean
    election: any
  }>({ isOpen: false, election: null })

  const { data: elections, isLoading } = useQuery({
    queryKey: ['admin-elections'],
    queryFn: () => electionsApi.getAll(),
  })

  const handleEndElection = async (electionId: string) => {
    if (!confirm('Are you sure you want to end this election? This action cannot be undone.')) {
      return
    }

    try {
      await electionsApi.close(electionId)
      toast.success('Election ended successfully!')
      // Invalidate caches for this election and lists
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin-elections'] }),
        queryClient.invalidateQueries({ queryKey: ['elections'] }),
        queryClient.invalidateQueries({ queryKey: ['election', electionId] }),
        queryClient.invalidateQueries({ queryKey: ['results', electionId] }),
        queryClient.invalidateQueries({ queryKey: ['candidates', electionId] }),
      ])
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to end election')
    }
  }

  const handleDeleteElection = async (electionId: string) => {
    if (!confirm('Are you sure you want to delete this election? This action cannot be undone.')) {
      return
    }

    try {
      await electionsApi.delete(electionId)
      toast.success('Election deleted successfully!')
      // Invalidate all election-related queries
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin-elections'] }),
        queryClient.invalidateQueries({ queryKey: ['elections'] }),
        queryClient.invalidateQueries({ queryKey: ['election', electionId] }),
        queryClient.invalidateQueries({ queryKey: ['results', electionId] }),
        queryClient.invalidateQueries({ queryKey: ['candidates', electionId] }),
      ])
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete election')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    )
  }

  const runningElections = elections?.data?.filter(election => 
    getElectionStatus(election.startAt, election.endAt) === 'running'
  ) || []

  const draftElections = elections?.data?.filter(election => 
    election.status === 'draft'
  ) || []

  const completedElections = elections?.data?.filter(election => 
    getElectionStatus(election.startAt, election.endAt) === 'ended'
  ) || []

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-5xl font-bold text-white mb-4">
                <span className="gradient-text">Admin Dashboard</span>
              </h1>
              <p className="text-xl text-white/70">
                Manage elections and monitor results
              </p>
            </div>
            <Link to="/admin/elections/create">
              <PulseButton size="lg">
                <Plus className="w-5 h-5 mr-2" />
                Create Election
              </PulseButton>
            </Link>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12"
        >
          {[
            { title: 'Total Elections', value: elections?.data?.length || 0, icon: <BarChart3 className="w-6 h-6" />, color: 'blue' },
            { title: 'Running', value: runningElections.length, icon: <TrendingUp className="w-6 h-6" />, color: 'green' },
            { title: 'Draft', value: draftElections.length, icon: <Clock className="w-6 h-6" />, color: 'yellow' },
            { title: 'Completed', value: completedElections.length, icon: <Users className="w-6 h-6" />, color: 'purple' },
          ].map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
            >
              <GlowingCard>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white/70 text-sm">{stat.title}</p>
                        <p className="text-3xl font-bold text-white">{stat.value}</p>
                      </div>
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        stat.color === 'blue' ? 'bg-blue-500/20 text-blue-400' :
                        stat.color === 'green' ? 'bg-green-500/20 text-green-400' :
                        stat.color === 'yellow' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-purple-500/20 text-purple-400'
                      }`}>
                        {stat.icon}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </GlowingCard>
            </motion.div>
          ))}
        </motion.div>

        {/* Running Elections */}
        {runningElections.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-12"
          >
            <h2 className="text-3xl font-bold text-white mb-8">Running Elections</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {runningElections.map((election, index) => (
                <motion.div
                  key={election._id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <FloatingCard>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-white">{election.title}</CardTitle>
                        <CardDescription className="text-white/70">
                          {election.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center text-green-400">
                            <TrendingUp className="w-4 h-4 mr-2" />
                            <span>{formatTimeRemaining(election.endAt)} remaining</span>
                          </div>
                          <div className="flex space-x-2 mb-2">
                            <Link to={`/elections/${election.slug}`} className="flex-1">
                              <PulseButton variant="3d-secondary" size="sm" className="w-full">
                                View
                              </PulseButton>
                            </Link>
                            <Link to={`/results/${election._id}`} className="flex-1">
                              <PulseButton variant="3d-success" size="sm" className="w-full">
                                Results
                              </PulseButton>
                            </Link>
                            <PulseButton
                              variant="3d-primary"
                              size="sm"
                              onClick={() => setShareModal({ isOpen: true, election })}
                              className="px-3"
                            >
                              <Share2 className="w-4 h-4" />
                            </PulseButton>
                          </div>
                          <div className="flex space-x-2">
                            <PulseButton
                              variant="3d-danger"
                              size="sm"
                              onClick={() => handleEndElection(election._id)}
                              className="flex-1"
                            >
                              <StopCircle className="w-4 h-4 mr-1" />
                              End
                            </PulseButton>
                            <PulseButton
                              variant="3d-danger"
                              size="sm"
                              onClick={() => handleDeleteElection(election._id)}
                              className="px-3"
                            >
                              <Trash2 className="w-4 h-4" />
                            </PulseButton>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </FloatingCard>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Draft Elections */}
        {draftElections.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mb-12"
          >
            <h2 className="text-3xl font-bold text-white mb-8">Draft Elections</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {draftElections.map((election, index) => (
                <motion.div
                  key={election._id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <GlowingCard>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-white">{election.title}</CardTitle>
                        <CardDescription className="text-white/70">
                          {election.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center text-yellow-400">
                            <Clock className="w-4 h-4 mr-2" />
                            <span>Draft - Not started</span>
                          </div>
                          <div className="flex space-x-2 mb-2">
                            <Link to={`/admin/elections/${election._id}/edit`} className="flex-1">
                              <PulseButton variant="3d-secondary" size="sm" className="w-full">
                                Edit
                              </PulseButton>
                            </Link>
                            <PulseButton variant="3d-success" size="sm" className="flex-1">
                              Start
                            </PulseButton>
                          </div>
                          <div>
                            <PulseButton
                              variant="3d-danger"
                              size="sm"
                              onClick={() => handleDeleteElection(election._id)}
                              className="w-full"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </PulseButton>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </GlowingCard>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold text-white mb-8">Quick Actions</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/admin/elections/create">
              <PulseButton size="lg">
                <Plus className="w-5 h-5 mr-2" />
                Create New Election
              </PulseButton>
            </Link>
            <PulseButton variant="3d-secondary" size="lg">
              <Settings className="w-5 h-5 mr-2" />
              System Settings
            </PulseButton>
            <PulseButton variant="3d-success" size="lg">
              <BarChart3 className="w-5 h-5 mr-2" />
              View Analytics
            </PulseButton>
          </div>
        </motion.div>
      </div>

      {/* Share Modal */}
      {shareModal.isOpen && shareModal.election && (
        <ShareElectionModal
          election={shareModal.election}
          isOpen={shareModal.isOpen}
          onClose={() => setShareModal({ isOpen: false, election: null })}
        />
      )}
    </div>
  )
}
