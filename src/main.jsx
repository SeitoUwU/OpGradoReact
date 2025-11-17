import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './AuthContext/AuthContextV2.jsx'
import ProtectedRoute from './protectedRoute.jsx'
import MainLayout from './layouts/MainLayout.jsx'

// Auth Views
import LogIn from './Views/Sesion/LogIn.jsx'
import Register from './Views/Sesion/Register.jsx'
import ForgotPassword from './Views/Sesion/ForgotPassword.jsx'

// Main Views
import Dashboard from './Views/Dashboard/Index.jsx'
import TankIndex from './Views/Tank/Index.jsx'
import SensorIndex from './Views/Sensor/Index.jsx'
import AlertsIndex from './Views/Alerts/Index.jsx'
import RechargesIndex from './Views/Recharges/Index.jsx'
import ReportsIndex from './Views/Reports/Index.jsx'
import UsersIndex from './Views/Users/Index.jsx'

import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" />
        <Routes>
          {/* Public Routes */}
          <Route path='/' element={<LogIn />} />
          <Route path='/login' element={<LogIn />} />
          <Route path='/register' element={<Register />} />
          <Route path='/forgot-password' element={<ForgotPassword />} />

          {/* Protected Routes */}
          <Route
            path='/dashboard'
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Dashboard />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path='/sensor'
            element={
              <ProtectedRoute>
                <MainLayout>
                  <SensorIndex />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path='/tank'
            element={
              <ProtectedRoute>
                <MainLayout>
                  <TankIndex />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path='/alerts'
            element={
              <ProtectedRoute>
                <MainLayout>
                  <AlertsIndex />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path='/recharges'
            element={
              <ProtectedRoute>
                <MainLayout>
                  <RechargesIndex />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path='/reports'
            element={
              <ProtectedRoute>
                <MainLayout>
                  <ReportsIndex />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path='/users'
            element={
              <ProtectedRoute>
                <MainLayout>
                  <UsersIndex />
                </MainLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
)
