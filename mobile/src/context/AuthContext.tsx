import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { loginRequest, logoutRequest, meRequest } from '../api/auth';
import { LoginCredentials, Usuario } from '../types/auth';
import { TOKEN_KEY } from '../api/client';

interface AuthContextValue {
  usuario: Usuario | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Al iniciar la app, verifica si hay sesión guardada
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const token = await SecureStore.getItemAsync(TOKEN_KEY);
        if (token) {
          const { data } = await meRequest();
          setUsuario(data);
        }
      } catch {
        // Token expirado o inválido: limpiar
        await SecureStore.deleteItemAsync(TOKEN_KEY);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    const { data } = await loginRequest(credentials);
    await SecureStore.setItemAsync(TOKEN_KEY, data.token);
    setUsuario(data.usuario);
  };

  const logout = async () => {
    try {
      await logoutRequest();
    } finally {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      setUsuario(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        usuario,
        isLoading,
        isAuthenticated: usuario !== null,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  }
  return context;
}
