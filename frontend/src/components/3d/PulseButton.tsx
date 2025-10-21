import React from 'react'
import { motion } from 'framer-motion'
import { Button } from '../ui/button'

interface PulseButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'default' | '3d-primary' | '3d-secondary' | '3d-success' | '3d-danger'
  size?: 'default' | 'sm' | 'lg'
  className?: string
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
}

export function PulseButton({ 
  children, 
  onClick, 
  variant = '3d-primary',
  size = 'default',
  className = '',
  disabled = false,
  type = 'button'
}: PulseButtonProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      animate={{ 
        boxShadow: [
          '0 0 20px rgba(59, 130, 246, 0.3)',
          '0 0 40px rgba(59, 130, 246, 0.6)',
          '0 0 20px rgba(59, 130, 246, 0.3)'
        ]
      }}
      transition={{ 
        boxShadow: { 
          duration: 2, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }
      }}
    >
      <Button
        type={type}
        variant={variant}
        size={size}
        onClick={onClick}
        disabled={disabled}
        className={`pulse-glow ${className}`}
      >
        {children}
      </Button>
    </motion.div>
  )
}
