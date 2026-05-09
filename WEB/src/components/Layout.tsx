import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { BookOpen, Bookmark, Users, LogOut, Library } from 'lucide-react';
import { useAuth } from '../context/useAuth';

const navItems = [
  { to: '/libros',    label: 'Libros',    icon: BookOpen },
  { to: '/prestamos', label: 'Préstamos', icon: Bookmark },
  { to: '/usuarios',  label: 'Usuarios',  icon: Users },
];

export default function Layout() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md flex flex-col">
        {/* Logo / título */}
        <div className="px-6 py-5 border-b border-gray-200">
          <h1 className="text-xl font-bold text-blue-600 flex items-center gap-2">
            <Library size={22} />
            Biblioteca
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">Panel de administración</p>
        </div>

        {/* Navegación */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Usuario y logout */}
        <div className="px-4 py-4 border-t border-gray-200">
          <div className="mb-3 px-2">
            <p className="text-sm font-semibold text-gray-700 truncate">{usuario?.nombre}</p>
            <p className="text-xs text-gray-400 truncate">{usuario?.correo}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut size={16} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Contenido principal */}
      <main className="flex-1 overflow-y-auto p-8">
        <Outlet />
      </main>
    </div>
  );
}
