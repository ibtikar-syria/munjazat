import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './lib/auth'
import { DashboardLayout, PublicLayout } from './components/Layouts'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { SubmitPage, TrackPage } from './pages/SubmitTrackPages'
import {
  DashboardHome,
  DashboardPlaceholder,
  RequireAuth,
} from './pages/DashboardPages'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route index element={<HomePage />} />
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
            <Route
              path="queue"
              element={
                <DashboardPlaceholder
                  title="طوابير المراجعة"
                  body="هنا ستظهر طلبات نقاط الاتصال واللجنة حسب الحالة والتعيين الجغرافي."
                />
              }
            />
            <Route
              path="directory"
              element={
                <DashboardPlaceholder
                  title="الدليل الداخلي"
                  body="سجل الكفاءات والجهات والمنجزات الموثّقة مع التصنيف القطاعي والجغرافي."
                />
              }
            />
            <Route
              path="governance"
              element={
                <DashboardPlaceholder
                  title="الحوكمة"
                  body="إدارة المستخدمين والدعوات والتصنيفات وسجل التدقيق وسياسة النشر."
                />
              }
            />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
