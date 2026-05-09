import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

export default function ProtectedRoute() {
  const { usuario, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-500 text-lg">Cargando...</p>
      </div>
    );
  }

  if (!usuario) return <Navigate to="/login" replace />;

  if (usuario.rol !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white rounded-2xl shadow-lg p-10 text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-2">Acceso denegado</h2>
          <p className="text-gray-500">Esta aplicación es de uso exclusivo para administradores.</p>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
