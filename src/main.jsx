import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './protectedRoute.jsx'
import LogIn from './Views/Sesion/LogIn.jsx'
import Index from './Views/Sensor/Index.jsx'
import TankIndex from './Views/Tank/Index.jsx'
import ClientsIndex from './Views/Clients/Index.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
      <Route path='/' element={<LogIn />} />
      <Route
        path='/sensor'
        element={
          <ProtectedRoute>
            <Index />
          </ProtectedRoute>}
      />
      <Route
        path='/tank'
        element={
          <ProtectedRoute>
            <TankIndex />
          </ProtectedRoute>
        }
      />
      <Route
        path='/clients'
        element={
          <ProtectedRoute>
            <ClientsIndex />
          </ProtectedRoute>
        }
      />
    </Routes>
  </BrowserRouter>
)
