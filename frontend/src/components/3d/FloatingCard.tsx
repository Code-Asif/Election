import React from 'react'
import { motion } from 'framer-motion'

interface FloatingCardProps {
  children: React.ReactNode
  className?: string
  intensity?: number
  speed?: number
}

export function FloatingCard({ 
  children, 
  className = ''
}: FloatingCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`relative ${className}`}
    >
      <div className="floating-animation glass-effect rounded-xl p-6 shadow-2xl">
        {children}
      </div>
    </motion.div>
  )
}
