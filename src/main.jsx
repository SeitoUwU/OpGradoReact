import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '../src/AuthContext/AuthContext.jsx'
import ProtectedRoute from './protectedRoute.jsx'
import MainLayout from './layouts/MainLayout.jsx'
import LogIn from './Views/Sesion/LogIn.jsx'
import Index from './Views/Sensor/Index.jsx'
import TankIndex from './Views/Tank/Index.jsx'
import ClientsIndex from './Views/Clients/Index.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path='/' element={<LogIn />} />
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
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
)