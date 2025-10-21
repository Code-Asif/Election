import type { ReactNode } from 'react'
import { Header } from './Header'
import { Footer } from './Footer'
import { AnimatedBackground } from './3d/AnimatedBackground'

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <AnimatedBackground />
      <div className="relative z-10">
        <Header />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  )
}
