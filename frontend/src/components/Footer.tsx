import { motion } from 'framer-motion'
import { BarChart3, Mail, Github, Twitter } from 'lucide-react'

export function Footer() {
  return (
    <motion.footer 
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="glass-effect border-t border-white/20 mt-20"
    >
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">ElectionHub</span>
            </div>
            <p className="text-white/70 text-sm">
              Secure, transparent, and efficient election management system.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="/elections" className="text-white/70 hover:text-white transition-colors text-sm">
                  Elections
                </a>
              </li>
              <li>
                <a href="/results" className="text-white/70 hover:text-white transition-colors text-sm">
                  Results
                </a>
              </li>
              <li>
                <a href="/about" className="text-white/70 hover:text-white transition-colors text-sm">
                  About
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <a href="/help" className="text-white/70 hover:text-white transition-colors text-sm">
                  Help Center
                </a>
              </li>
              <li>
                <a href="/contact" className="text-white/70 hover:text-white transition-colors text-sm">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="/privacy" className="text-white/70 hover:text-white transition-colors text-sm">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-white font-semibold mb-4">Connect</h3>
            <div className="flex space-x-4">
              <a 
                href="mailto:support@electionhub.com" 
                className="text-white/70 hover:text-white transition-colors"
              >
                <Mail className="w-5 h-5" />
              </a>
              <a 
                href="https://github.com/electionhub" 
                className="text-white/70 hover:text-white transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
              <a 
                href="https://twitter.com/electionhub" 
                className="text-white/70 hover:text-white transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/20 mt-8 pt-8 text-center">
          <p className="text-white/50 text-sm">
            © 2024 ElectionHub. All rights reserved. Built with ❤️ for democracy.
          </p>
        </div>
      </div>
    </motion.footer>
  )
}
