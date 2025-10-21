import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { electionsApi } from '../lib/api'
import { FloatingCard } from '../components/3d/FloatingCard'
import { GlowingCard } from '../components/3d/GlowingCard'
import { PulseButton } from '../components/3d/PulseButton'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { formatDate, formatTimeRemaining, getElectionStatus } from '../lib/utils'
import { Clock, Users, TrendingUp, Shield, Zap, BarChart3 } from 'lucide-react'

export function Home() {
  const { data: elections, isLoading } = useQuery({
    queryKey: ['elections', 'public'],
    queryFn: () => electionsApi.getAll({ public: true }),
  })

  const electionsList = elections?.data || elections || []

  const runningElections = electionsList.filter(election => 
    getElectionStatus(election.startAt, election.endAt) === 'running'
  )

  const recentElections = electionsList.filter(election => 
    getElectionStatus(election.startAt, election.endAt) === 'ended'
  ).slice(0, 3)

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <h1 className="text-6xl md:text-8xl font-bold mb-6">
              <span className="gradient-text">Democracy</span>
              <br />
              <span className="text-white">Reimagined</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/80 mb-8 max-w-2xl mx-auto">
              Secure, transparent, and efficient election management with cutting-edge 3D technology
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <PulseButton variant="3d-primary" size="lg" className="text-lg px-8 py-4">
                <Link to="/elections">View Elections</Link>
              </PulseButton>
              <PulseButton variant="3d-secondary" size="lg" className="text-lg px-8 py-4">
                <Link to="/search">Search Elections</Link>
              </PulseButton>
              <PulseButton variant="3d-success" size="lg" className="text-lg px-8 py-4">
                <Link to="/register">Get Started</Link>
              </PulseButton>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Why Choose ElectionHub?
            </h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Experience the future of democratic participation with our innovative platform
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Shield className="w-8 h-8" />,
                title: "Secure & Anonymous",
                description: "Advanced encryption ensures your vote remains private and secure"
              },
              {
                icon: <Zap className="w-8 h-8" />,
                title: "Real-time Results",
                description: "Watch live vote counts and results as they happen"
              },
              {
                icon: <Users className="w-8 h-8" />,
                title: "Easy Participation",
                description: "Simple, intuitive interface for all voters"
              },
              {
                icon: <BarChart3 className="w-8 h-8" />,
                title: "Analytics Dashboard",
                description: "Comprehensive insights and reporting tools"
              },
              {
                icon: <Clock className="w-8 h-8" />,
                title: "Flexible Scheduling",
                description: "Set custom election periods and deadlines"
              },
              {
                icon: <TrendingUp className="w-8 h-8" />,
                title: "Scalable Platform",
                description: "Handle elections of any size with confidence"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <GlowingCard className="h-full">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-white/70">
                      {feature.description}
                    </p>
                  </div>
                </GlowingCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Elections Section */}
      {runningElections.length > 0 && (
        <section className="py-20 px-4">
          <div className="container mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Live Elections
              </h2>
              <p className="text-xl text-white/70">
                Participate in ongoing elections
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {runningElections.map((election, index) => (
                <motion.div
                  key={election._id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
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
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center text-white/70">
                            <Clock className="w-4 h-4 mr-2" />
                            <span>{formatTimeRemaining(election.endAt)} remaining</span>
                          </div>
                          <div className="flex items-center text-white/70">
                            <Users className="w-4 h-4 mr-2" />
                            <span>{election.type === 'public' ? 'Public' : 'Private'} Election</span>
                          </div>
                          <Link to={`/elections/${election.slug}`}>
                            <PulseButton className="w-full">
                              View Election
                            </PulseButton>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  </FloatingCard>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Recent Results Section */}
      {recentElections.length > 0 && (
        <section className="py-20 px-4">
          <div className="container mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Recent Results
              </h2>
              <p className="text-xl text-white/70">
                View results from completed elections
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {recentElections.map((election, index) => (
                <motion.div
                  key={election._id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <GlowingCard>
                    <div className="text-center">
                      <h3 className="text-xl font-semibold text-white mb-2">
                        {election.title}
                      </h3>
                      <p className="text-white/70 mb-4">
                        Ended {formatDate(election.endAt)}
                      </p>
                      <Link to={`/results/${election._id}`}>
                        <PulseButton variant="3d-secondary" className="w-full">
                          View Results
                        </PulseButton>
                      </Link>
                    </div>
                  </GlowingCard>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Participate?
            </h2>
            <p className="text-xl text-white/70 mb-8">
              Join thousands of voters who trust ElectionHub for secure, transparent elections
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <PulseButton size="lg" className="text-lg px-8 py-4">
                <Link to="/register">Create Account</Link>
              </PulseButton>
              <PulseButton variant="3d-secondary" size="lg" className="text-lg px-8 py-4">
                <Link to="/elections">Browse Elections</Link>
              </PulseButton>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
