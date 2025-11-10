import React, { useState } from 'react'
import axios from 'axios'
import { toast, Toaster } from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

function LogIn() {
  const [user, setUser] = useState({ nameUser: '', userPassword: '' })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  const login = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await axios.post('http://localhost:3000/api/auth/login', {
        nameUser: user.nameUser,
        userPassword: user.userPassword
      }, { withCredentials: true })

      if (response.data.success) {
        toast.success('Inicio de sesión exitoso 🔥', {
          duration: 1500,
          position: 'top-right',
        })
        setTimeout(() => navigate('/sensor'), 1000)
      } else {
        throw new Error()
      }
    } catch (error) {
      toast.error('Usuario o contraseña incorrectos', {
        duration: 1500,
        position: 'top-right',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value })
  }

  return (
    <>
      <Toaster />
      <div className="flex min-h-screen">
        {/* IZQUIERDA - Fondo suave y logo */}
        <div className="hidden md:flex w-1/2 bg-gradient-to-br from-orange-100 via-orange-200 to-rose-200 items-center justify-center">
          <div className="bg-white/30 backdrop-blur-sm p-8 rounded-2xl shadow-inner">
            <img
              src="/img/gasCaqueta.png"
              alt="Logo GasCaquetá"
              className="w-3/4 max-w-md drop-shadow-lg"
            />
          </div>
        </div>

        {/* DERECHA - Tarjeta login */}
        <div className="flex w-full md:w-1/2 items-center justify-center bg-gray-50">
          <div className="bg-white rounded-3xl shadow-lg p-10 w-full max-w-lg mx-6">
            <h1 className="text-4xl font-bold text-center text-red-500 mb-3">
              GasCaquetá
            </h1>
            <p className="text-center text-gray-600 mb-8 text-lg">
              Bienvenido al sistema de gestión
            </p>

            <form onSubmit={login} className="space-y-6">
              {/* Usuario */}
              <input
                name="nameUser"
                value={user.nameUser}
                onChange={handleChange}
                placeholder="Ingrese su usuario"
                type="text"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300"
              />

              {/* Contraseña + ojito 👁️ */}
              <div className="relative">
                <input
                  name="userPassword"
                  value={user.userPassword}
                  onChange={handleChange}
                  placeholder="Ingrese su contraseña"
                  type={showPassword ? 'text' : 'password'}
                  className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-orange-400 transition-colors"
                >
                  {showPassword ? (
                    // Ojo abierto
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none"
                      viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    // Ojo cerrado
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none"
                      viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round"
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 013.142-4.568M9.88 9.88A3 3 0 0012 15a3 3 0 002.12-5.12M3 3l18 18" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Botón Ingresar */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full px-4 py-3 text-lg font-semibold rounded-lg text-white bg-gradient-to-r from-orange-300 to-rose-400 hover:from-orange-400 hover:to-rose-500 transition-all duration-300 ${loading ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
              >
                {loading ? 'Ingresando...' : 'Ingresar'}
              </button>
            </form>

            <div className="mt-10 text-center text-sm text-gray-500">
              © {new Date().getFullYear()} GasCaquetá — Seguridad y Energía
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default LogIn
