import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '../ui/card'

interface GlowingCardProps {
  children: React.ReactNode
  className?: string
  glowColor?: string
  intensity?: number
}

export function GlowingCard({ 
  children, 
  className = '', 
  glowColor = '#667eea',
  intensity = 0.3
}: GlowingCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ 
        scale: 1.02,
        boxShadow: `0 0 30px ${glowColor}${Math.floor(intensity * 255).toString(16).padStart(2, '0')}`
      }}
      transition={{ duration: 0.3 }}
      className="relative"
    >
      <Card className={`glass-effect border-2 border-transparent bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md ${className}`}>
        <CardContent className="p-6">
          {children}
        </CardContent>
      </Card>
      
      {/* Glow effect */}
      <div 
        className="absolute inset-0 rounded-lg opacity-0 transition-opacity duration-300 hover:opacity-100"
        style={{
          background: `radial-gradient(circle at center, ${glowColor}20 0%, transparent 70%)`,
          filter: 'blur(20px)',
          zIndex: -1
        }}
      />
    </motion.div>
  )
}
