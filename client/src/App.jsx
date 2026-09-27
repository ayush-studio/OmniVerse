import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { SocketProvider } from '@/context/SocketContext'
import AppLayout from '@/components/layout/AppLayout'
import HomePage from '@/pages/HomePage'
import BrowsePage from '@/pages/BrowsePage'
import MediaDetailPage from '@/pages/MediaDetailPage'
import ForumPostPage from '@/pages/ForumPostPage'
import CommunityPage from '@/pages/CommunityPage'
import DiscoverPage from '@/pages/DiscoverPage'
import LoginPage from '@/pages/LoginPage'
import OnboardingPage from '@/pages/OnboardingPage'
import ProfilePage from '@/pages/ProfilePage'
import AdminPage from '@/pages/AdminPage'
import { useAuthStore } from '@/store'

function Protected({ children, requireOnboarding = false }) {
  const user = useAuthStore((s) => s.user)
  const token = useAuthStore((s) => s.token)
  if (!token || !user) return <Navigate to="/login" replace />
  if (requireOnboarding && !user.onboardingComplete) return <Navigate to="/onboarding" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <SocketProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/onboarding"
            element={
              <Protected>
                <OnboardingPage />
              </Protected>
            }
          />
          <Route element={<AppLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/discover" element={<DiscoverPage />} />
            <Route path="/community" element={<CommunityPage />} />
            <Route path="/discussions" element={<Navigate to="/community" replace />} />
            <Route path="/browse/:type" element={<BrowsePage />} />
            <Route path="/media/:id" element={<MediaDetailPage />} />
            <Route path="/forum/:postId" element={<ForumPostPage />} />
            <Route
              path="/profile"
              element={
                <Protected requireOnboarding>
                  <ProfilePage />
                </Protected>
              }
            />
            <Route
              path="/admin"
              element={
                <Protected requireOnboarding>
                  <AdminPage />
                </Protected>
              }
            />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </SocketProvider>
    </BrowserRouter>
  )
}
