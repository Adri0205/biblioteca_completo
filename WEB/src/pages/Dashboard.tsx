import { useAuth } from '../context/useAuth';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg p-10 text-center">
        <h1 className="text-3xl font-bold text-blue-600 mb-2">Dashboard</h1>
        <p className="text-gray-600 mb-1">
          Bienvenido, <span className="font-semibold">{usuario?.nombre}</span>
        </p>
        <p className="text-sm text-gray-400 mb-6">Rol: {usuario?.rol}</p>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg px-6 py-2 transition-colors"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
