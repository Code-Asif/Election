import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { SocketProvider } from './contexts/SocketContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { ErrorBoundary } from './components/ErrorBoundary'
import { Layout } from './components/Layout'
import { Home } from './pages/Home'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { Elections } from './pages/Elections'
import { ElectionDetail } from './pages/ElectionDetail'
import { Vote } from './pages/Vote'
import { Results } from './pages/Results'
import { AdminDashboard } from './pages/AdminDashboard'
import { CreateElection } from './pages/CreateElection'
import { Profile } from './pages/Profile'
import { VoterSearch } from './pages/VoterSearch'

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <SocketProvider>
          <Layout>
            <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/elections" element={<Elections />} />
            <Route path="/elections/:slug" element={<ElectionDetail />} />
            <Route path="/search" element={<VoterSearch />} />
            <Route path="/results/:electionId" element={<Results />} />
            
            {/* Protected routes */}
            <Route path="/vote/:electionId" element={
              <ProtectedRoute>
                <Vote />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            
            {/* Admin routes */}
            <Route path="/admin" element={
              <ProtectedRoute adminOnly>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/elections/create" element={
              <ProtectedRoute adminOnly>
                <CreateElection />
              </ProtectedRoute>
            } />
            </Routes>
          </Layout>
        </SocketProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
