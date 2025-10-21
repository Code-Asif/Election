import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { Button } from './ui/button'
import { Menu, X, User, LogOut, Settings, BarChart3 } from 'lucide-react'

export function Header() {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="sticky top-0 z-50 glass-effect border-b border-white/20"
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold gradient-text">ElectionHub</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              to="/elections" 
              className="text-white/80 hover:text-white transition-colors"
            >
              Elections
            </Link>
            
            {user ? (
              <div className="flex items-center space-x-4">
                {isAdmin && (
                  <Link to="/admin">
                    <Button variant="3d-secondary" size="sm">
                      Admin Panel
                    </Button>
                  </Link>
                )}
                
                <div className="relative group">
                  <Button variant="ghost" size="sm" className="text-white">
                    <User className="w-4 h-4 mr-2" />
                    {user.name}
                  </Button>
                  
                  <div className="absolute right-0 mt-2 w-48 bg-white/10 backdrop-blur-md rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="py-2">
                      <Link 
                        to="/profile" 
                        className="flex items-center px-4 py-2 text-white hover:bg-white/10 transition-colors"
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-white hover:bg-white/10 transition-colors"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login">
                  <Button variant="ghost" className="text-white">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="3d-primary">
                    Register
                  </Button>
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-white"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden mt-4 pb-4"
          >
            <div className="flex flex-col space-y-2">
              <Link 
                to="/elections" 
                className="text-white/80 hover:text-white transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Elections
              </Link>
              
              {user ? (
                <>
                  {isAdmin && (
                    <Link 
                      to="/admin" 
                      className="text-white/80 hover:text-white transition-colors py-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Admin Panel
                    </Link>
                  )}
                  <Link 
                    to="/profile" 
                    className="text-white/80 hover:text-white transition-colors py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout()
                      setIsMenuOpen(false)
                    }}
                    className="text-white/80 hover:text-white transition-colors py-2 text-left"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="text-white/80 hover:text-white transition-colors py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link 
                    to="/register" 
                    className="text-white/80 hover:text-white transition-colors py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </motion.header>
  )
}
