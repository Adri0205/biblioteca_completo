import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Login from './pages/Login'
import Libros from './pages/Libros'
import Prestamos from './pages/Prestamos'
import Usuarios from './pages/Usuarios'
import './index.css'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Rutas protegidas — solo administradores */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route index element={<Navigate to="/libros" replace />} />
              <Route path="/libros"    element={<Libros />} />
              <Route path="/prestamos" element={<Prestamos />} />
              <Route path="/usuarios"  element={<Usuarios />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/libros" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
