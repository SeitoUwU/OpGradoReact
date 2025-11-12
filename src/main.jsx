import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '../src/AuthContext/AuthContext.jsx'
import { WebSocketProvider } from './context/WebSocketContext.jsx'
import ProtectedRoute from './protectedRoute.jsx'
import MainLayout from './layouts/MainLayout.jsx'
import LogIn from './Views/Sesion/LogIn.jsx'
import Dashboard from './Views/Dashboard/Index.jsx'
import Index from './Views/Sensor/Index.jsx'
import TankIndex from './Views/Tank/Index.jsx'
import ClientsIndex from './Views/Clients/Index.jsx'
import Alerts from './Views/Alerts/Index.jsx'
import Supplies from './Views/Supplies/Index.jsx'
import Maintenance from './Views/Maintenance/Index.jsx'
import Reports from './Views/Reports/Index.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <WebSocketProvider>
          <Toaster position="top-right" />
          <Routes>
          <Route path='/' element={<LogIn />} />
          <Route
            path='/dashboard'
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Dashboard />
                </MainLayout>
              </ProtectedRoute>}
          />
          <Route
            path='/sensor'
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Index />
                </MainLayout>
              </ProtectedRoute>}
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
            path='/clients'
            element={
              <ProtectedRoute>
                <MainLayout>
                  <ClientsIndex />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path='/alerts'
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Alerts />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path='/supplies'
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Supplies />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path='/maintenance'
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Maintenance />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path='/reports'
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Reports />
                </MainLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
        </WebSocketProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
)