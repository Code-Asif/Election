import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useQueryClient } from '@tanstack/react-query'
import { electionsApi, candidatesApi } from '../lib/api'
import { FloatingCard } from '../components/3d/FloatingCard'
import { GlowingCard } from '../components/3d/GlowingCard'
import { PulseButton } from '../components/3d/PulseButton'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

export function CreateElection() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'private',
    startAt: '',
    endAt: '',
    allowedDomain: '',
    maxPublicVoters: '',
    isPublicResults: false,
    allowAnonymousVoting: false,
  })
  const [candidates, setCandidates] = useState([
    { name: '', bio: '', manifesto: '', photoUrl: '' }
  ])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Prevent duplicate submissions
    if (isSubmitting) {
      return
    }
    
    setIsSubmitting(true)

    try {
      const electionData = {
        ...formData,
        maxPublicVoters: formData.maxPublicVoters ? parseInt(formData.maxPublicVoters) : undefined,
        allowedDomain: formData.allowedDomain || undefined,
      }

      const response = await electionsApi.create(electionData)
      const electionId = response.data._id || response.data.id
      
      if (!electionId) {
        throw new Error('Failed to get election ID from response')
      }

      // Add candidates
      const candidatesToAdd = candidates.filter(c => c.name.trim())
      if (candidatesToAdd.length > 0) {
        for (const candidate of candidatesToAdd) {
          try {
            await candidatesApi.create({
              electionId: electionId,
              ...candidate
            })
          } catch (candidateError: any) {
            console.error('Failed to add candidate:', candidateError)
            toast.error(`Failed to add candidate ${candidate.name}: ${candidateError.response?.data?.message || candidateError.message}`)
          }
        }
      }

      // Invalidate caches so dashboards/lists refresh
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin-elections'] }),
        queryClient.invalidateQueries({ queryKey: ['elections'] }),
      ])
      toast.success('Election created successfully!')
      navigate('/admin')
    } catch (error: any) {
      console.error('Election creation error:', error)
      toast.error(error.response?.data?.message || error.message || 'Failed to create election')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const addCandidate = () => {
    setCandidates(prev => [...prev, { name: '', bio: '', manifesto: '', photoUrl: '' }])
  }

  const removeCandidate = (index: number) => {
    setCandidates(prev => prev.filter((_, i) => i !== index))
  }

  const updateCandidate = (index: number, field: string, value: string) => {
    setCandidates(prev => prev.map((candidate, i) => 
      i === index ? { ...candidate, [field]: value } : candidate
    ))
  }

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <div className="flex items-center space-x-4 mb-8">
            <button
              onClick={() => navigate('/admin')}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <h1 className="text-4xl font-bold text-white">
                <span className="gradient-text">Create Election</span>
              </h1>
              <p className="text-white/70 mt-2">
                Set up a new election with candidates and voting rules
              </p>
            </div>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <FloatingCard>
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl text-white">Election Details</CardTitle>
                  <CardDescription className="text-white/70">
                    Basic information about the election
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="title" className="text-white">Election Title</Label>
                      <Input
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="Enter election title"
                        required
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type" className="text-white">Election Type</Label>
                      <select
                        id="type"
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        className="w-full h-10 px-3 py-2 bg-white/10 border border-white/20 text-white rounded-md focus:border-blue-400 focus:outline-none"
                      >
                        <option value="private" className="bg-gray-900 text-white">Private</option>
                        <option value="public" className="bg-gray-900 text-white">Public</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-white">Description</Label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Describe the election purpose and rules"
                      required
                      rows={3}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 text-white placeholder:text-white/50 rounded-md focus:border-blue-400 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="startAt" className="text-white">Start Date & Time</Label>
                      <Input
                        id="startAt"
                        name="startAt"
                        type="datetime-local"
                        value={formData.startAt}
                        onChange={handleChange}
                        required
                        className="bg-white/10 border-white/20 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endAt" className="text-white">End Date & Time</Label>
                      <Input
                        id="endAt"
                        name="endAt"
                        type="datetime-local"
                        value={formData.endAt}
                        onChange={handleChange}
                        required
                        className="bg-white/10 border-white/20 text-white"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </FloatingCard>
          </motion.div>

          {/* Advanced Settings */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
          >
            <FloatingCard>
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl text-white">Advanced Settings</CardTitle>
                  <CardDescription className="text-white/70">
                    Optional settings for voter restrictions and results visibility
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="allowedDomain" className="text-white">
                        Allowed Email Domain (Optional)
                      </Label>
                      <Input
                        id="allowedDomain"
                        name="allowedDomain"
                        value={formData.allowedDomain}
                        onChange={handleChange}
                        placeholder="e.g., university.edu"
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                      />
                      <p className="text-xs text-white/50">
                        Only voters with this email domain can participate
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maxPublicVoters" className="text-white">
                        Max Public Voters (Optional)
                      </Label>
                      <Input
                        id="maxPublicVoters"
                        name="maxPublicVoters"
                        type="number"
                        value={formData.maxPublicVoters}
                        onChange={handleChange}
                        placeholder="e.g., 100"
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                      />
                      <p className="text-xs text-white/50">
                        Maximum number of voters for public elections
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="isPublicResults"
                        name="isPublicResults"
                        checked={formData.isPublicResults}
                        onChange={handleChange}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <Label htmlFor="isPublicResults" className="text-white cursor-pointer">
                        Make results public immediately
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="allowAnonymousVoting"
                        name="allowAnonymousVoting"
                        checked={formData.allowAnonymousVoting}
                        onChange={handleChange}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <Label htmlFor="allowAnonymousVoting" className="text-white cursor-pointer">
                        Allow anonymous voting
                      </Label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </FloatingCard>
          </motion.div>

          {/* Candidates */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
          >
            <FloatingCard>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl text-white">Candidates</CardTitle>
                      <CardDescription className="text-white/70">
                        Add candidates for this election
                      </CardDescription>
                    </div>
                    <PulseButton
                      type="button"
                      onClick={addCandidate}
                      variant="3d-secondary"
                      size="sm"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Candidate
                    </PulseButton>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {candidates.map((candidate, index) => (
                    <GlowingCard key={index}>
                      <Card>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-white">Candidate {index + 1}</CardTitle>
                            {candidates.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeCandidate(index)}
                                className="p-2 text-red-400 hover:text-red-300 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-white">Name</Label>
                              <Input
                                value={candidate.name}
                                onChange={(e) => updateCandidate(index, 'name', e.target.value)}
                                placeholder="Candidate name"
                                required
                                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-white">Photo URL</Label>
                              <Input
                                value={candidate.photoUrl}
                                onChange={(e) => updateCandidate(index, 'photoUrl', e.target.value)}
                                placeholder="https://example.com/photo.jpg"
                                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-white">Bio</Label>
                            <textarea
                              value={candidate.bio}
                              onChange={(e) => updateCandidate(index, 'bio', e.target.value)}
                              placeholder="Brief biography"
                              rows={2}
                              className="w-full px-3 py-2 bg-white/10 border border-white/20 text-white placeholder:text-white/50 rounded-md focus:border-blue-400 focus:outline-none"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-white">Manifesto</Label>
                            <textarea
                              value={candidate.manifesto}
                              onChange={(e) => updateCandidate(index, 'manifesto', e.target.value)}
                              placeholder="Candidate's manifesto or platform"
                              rows={3}
                              className="w-full px-3 py-2 bg-white/10 border border-white/20 text-white placeholder:text-white/50 rounded-md focus:border-blue-400 focus:outline-none"
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </GlowingCard>
                  ))}
                </CardContent>
              </Card>
            </FloatingCard>
          </motion.div>

          {/* Submit */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center"
          >
            <PulseButton
              type="submit"
              disabled={isSubmitting}
              size="lg"
              className="text-lg px-8 py-4"
            >
              {isSubmitting ? 'Creating Election...' : 'Create Election'}
            </PulseButton>
          </motion.div>
        </form>
      </div>
    </div>
  )
}
