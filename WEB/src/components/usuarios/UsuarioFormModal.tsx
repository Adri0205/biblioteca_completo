import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { X } from 'lucide-react';
import type { Usuario, UsuarioFormData } from '../../types/usuario';

interface Props {
  usuario?: Usuario | null;
  onClose: () => void;
  onSubmit: (data: UsuarioFormData) => Promise<void>;
}

const empty: UsuarioFormData = {
  nombre: '',
  correo: '',
  password: '',
  rol: 'usuario',
};

export default function UsuarioFormModal({ usuario, onClose, onSubmit }: Props) {
  const [form, setForm] = useState<UsuarioFormData>(empty);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const isEditing = !!usuario;

  useEffect(() => {
    if (usuario) {
      setForm({
        nombre: usuario.nombre,
        correo: usuario.correo,
        password: '',
        rol: usuario.rol,
      });
    } else {
      setForm(empty);
    }
    setError('');
  }, [usuario]);

  const set = <K extends keyof UsuarioFormData>(field: K, value: UsuarioFormData[K]) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isEditing && form.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    if (isEditing && form.password && form.password.length < 8) {
      setError('La nueva contraseña debe tener al menos 8 caracteres.');
      return;
    }

    setLoading(true);
    try {
      // Al editar, solo enviar password si se completó
      const payload: Partial<UsuarioFormData> = {
        nombre: form.nombre,
        correo: form.correo,
        rol: form.rol,
      };
      if (form.password) payload.password = form.password;

      await onSubmit(payload as UsuarioFormData);
      onClose();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? 'Error al guardar el usuario.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            {isEditing ? 'Editar usuario' : 'Nuevo usuario'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              maxLength={100}
              value={form.nombre}
              onChange={(e) => set('nombre', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Correo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Correo electrónico <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              required
              maxLength={100}
              value={form.correo}
              onChange={(e) => set('correo', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Contraseña */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña {!isEditing && <span className="text-red-500">*</span>}
            </label>
            <input
              type="password"
              required={!isEditing}
              minLength={isEditing ? undefined : 8}
              value={form.password}
              onChange={(e) => set('password', e.target.value)}
              placeholder={isEditing ? 'Dejar en blanco para mantener la actual' : ''}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Rol */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rol <span className="text-red-500">*</span>
            </label>
            <select
              value={form.rol}
              onChange={(e) => set('rol', e.target.value as 'admin' | 'usuario')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="usuario">Usuario</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
              {error}
            </p>
          )}

          {/* Acciones */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-lg transition-colors"
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
