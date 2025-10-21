import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { useQuery } from '@tanstack/react-query'
import { usersApi } from '../lib/api'
import { FloatingCard } from '../components/3d/FloatingCard'
import { GlowingCard } from '../components/3d/GlowingCard'
import { PulseButton } from '../components/3d/PulseButton'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { User, Mail, Shield, Calendar, Edit3, Save, X } from 'lucide-react'
import toast from 'react-hot-toast'

export function Profile() {
  const { user, logout } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { refetch } = useQuery({
    queryKey: ['profile'],
    queryFn: () => usersApi.getProfile(),
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await usersApi.updateProfile(formData)
      toast.success('Profile updated successfully!')
      setIsEditing(false)
      refetch()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
    })
    setIsEditing(false)
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
          <h1 className="text-5xl font-bold text-white mb-4">
            <span className="gradient-text">Profile</span>
          </h1>
          <p className="text-xl text-white/70">
            Manage your account information and preferences
          </p>
        </motion.div>

        {/* Profile Information */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-12"
        >
          <FloatingCard>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl text-white">Personal Information</CardTitle>
                    <CardDescription className="text-white/70">
                      Your account details and preferences
                    </CardDescription>
                  </div>
                  {!isEditing && (
                    <PulseButton
                      onClick={() => setIsEditing(true)}
                      variant="3d-secondary"
                      size="sm"
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit Profile
                    </PulseButton>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-white">Full Name</Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-white">Email Address</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                        />
                      </div>
                    </div>
                    <div className="flex space-x-4">
                      <PulseButton
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                      </PulseButton>
                      <PulseButton
                        type="button"
                        onClick={handleCancel}
                        variant="3d-secondary"
                        className="flex-1"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </PulseButton>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="text-white/70 text-sm">Full Name</p>
                          <p className="text-white font-semibold">{user?.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                          <Mail className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="text-white/70 text-sm">Email Address</p>
                          <p className="text-white font-semibold">{user?.email}</p>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                          <Shield className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="text-white/70 text-sm">Role</p>
                          <p className="text-white font-semibold capitalize">{user?.role}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full flex items-center justify-center">
                          <Calendar className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="text-white/70 text-sm">Account Status</p>
                          <p className="text-white font-semibold">
                            {user?.verified ? 'Verified' : 'Pending Verification'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </FloatingCard>
        </motion.div>

        {/* Account Actions */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <GlowingCard>
            <Card>
              <CardHeader>
                <CardTitle className="text-white">Account Security</CardTitle>
                <CardDescription className="text-white/70">
                  Manage your account security settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <PulseButton variant="3d-secondary" className="w-full">
                    Change Password
                  </PulseButton>
                  <PulseButton variant="3d-secondary" className="w-full">
                    Two-Factor Authentication
                  </PulseButton>
                </div>
              </CardContent>
            </Card>
          </GlowingCard>

          <GlowingCard>
            <Card>
              <CardHeader>
                <CardTitle className="text-white">Account Actions</CardTitle>
                <CardDescription className="text-white/70">
                  Manage your account and data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <PulseButton variant="3d-secondary" className="w-full">
                    Download Data
                  </PulseButton>
                  <PulseButton 
                    variant="3d-danger" 
                    className="w-full"
                    onClick={logout}
                  >
                    Sign Out
                  </PulseButton>
                </div>
              </CardContent>
            </Card>
          </GlowingCard>
        </motion.div>
      </div>
    </div>
  )
}
