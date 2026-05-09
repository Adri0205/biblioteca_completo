import { createContext, useState, useEffect, ReactNode } from 'react';
import api from '../api/axios';

interface Usuario {
  id: number;
  nombre: string;
  correo: string;
  rol: 'admin' | 'usuario';
}

interface AuthContextType {
  usuario: Usuario | null;
  token: string | null;
  login: (correo: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Al montar, si hay un token guardado, validarlo con /auth/me
  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    api.get<Usuario>('/auth/me')
      .then(({ data }) => setUsuario(data))
      .catch(() => {
        localStorage.removeItem('token');
        setToken(null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const login = async (correo: string, password: string) => {
    const { data } = await api.post<{ token: string; usuario: Usuario }>('/auth/login', {
      correo,
      password,
    });
    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUsuario(data.usuario);
  };

  const logout = () => {
    api.post('/auth/logout').catch(() => {});
    localStorage.removeItem('token');
    setToken(null);
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}


