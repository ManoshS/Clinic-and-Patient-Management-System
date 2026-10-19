import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Layout } from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/admin/Dashboard'
import Patients from './pages/admin/Patients'
import Appointments from './pages/admin/Appointments'
import LabInvestigations from './pages/admin/LabInvestigations'
import ClinicalRecords from './pages/admin/ClinicalRecords'
import Timeline from './pages/patient/Timeline'
import Labs from './pages/patient/Labs'
import Records from './pages/patient/Records'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/admin"
            element={
              <ProtectedRoute role="admin">
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="patients" element={<Patients />} />
            <Route path="appointments" element={<Appointments />} />
            <Route path="labs" element={<LabInvestigations />} />
            <Route path="records" element={<ClinicalRecords />} />
          </Route>

          <Route
            path="/patient"
            element={
              <ProtectedRoute role="patient">
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/patient/timeline" replace />} />
            <Route path="timeline" element={<Timeline />} />
            <Route path="labs" element={<Labs />} />
            <Route path="records" element={<Records />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
