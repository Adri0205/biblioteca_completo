export interface Usuario {
  id: number;
  nombre: string;
  correo: string;
  rol: string;
}

export interface LoginCredentials {
  correo: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  usuario: Usuario;
}
