import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './lib/auth'
import { DashboardLayout, PublicLayout } from './components/Layouts'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { SubmitPage, TrackPage } from './pages/SubmitTrackPages'
import { AchievementDetailPage, BrowsePage } from './pages/BrowsePages'
import {
  DashboardHome,
  RequireAuth,
} from './pages/DashboardPages'
import { QueuePage } from './pages/QueuePage'
import { DirectoryPage } from './pages/DirectoryPage'
import { GovernancePage } from './pages/GovernancePage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route index element={<HomePage />} />
            <Route path="browse" element={<BrowsePage />} />
            <Route path="browse/:id" element={<AchievementDetailPage />} />
            <Route path="submit" element={<SubmitPage />} />
            <Route path="track" element={<TrackPage />} />
            <Route path="login" element={<LoginPage />} />
          </Route>

          <Route
            path="dashboard"
            element={
              <RequireAuth>
                <DashboardLayout />
              </RequireAuth>
            }
          >
            <Route index element={<DashboardHome />} />
            <Route path="queue" element={<QueuePage />} />
            <Route path="queue/:id" element={<QueuePage />} />
            <Route path="directory" element={<DirectoryPage />} />
            <Route path="governance" element={<GovernancePage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
