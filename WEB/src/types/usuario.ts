export interface Usuario {
  id: number;
  nombre: string;
  correo: string;
  rol: 'admin' | 'usuario';
  createdAt: string;
  updatedAt: string;
}

export interface UsuarioFormData {
  nombre: string;
  correo: string;
  password: string;
  rol: 'admin' | 'usuario';
}
