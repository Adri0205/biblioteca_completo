import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, ShieldCheck, User } from 'lucide-react';
import { getUsuarios, createUsuario, updateUsuario, deleteUsuario } from '../api/usuarios';
import UsuarioFormModal from '../components/usuarios/UsuarioFormModal';
import ConfirmDialog from '../components/ConfirmDialog';
import { useAuth } from '../context/useAuth';
import type { Usuario, UsuarioFormData } from '../types/usuario';

export default function Usuarios() {
  const { usuario: yo } = useAuth();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);

  // Modales
  const [showForm, setShowForm] = useState(false);
  const [editUsuario, setEditUsuario] = useState<Usuario | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Usuario | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchUsuarios = async () => {
    setLoading(true);
    try {
      setUsuarios(await getUsuarios());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const handleCreate = async (data: UsuarioFormData) => {
    await createUsuario(data);
    await fetchUsuarios();
  };

  const handleUpdate = async (data: UsuarioFormData) => {
    if (!editUsuario) return;
    await updateUsuario(editUsuario.id, data);
    await fetchUsuarios();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteUsuario(deleteTarget.id);
      setDeleteTarget(null);
      await fetchUsuarios();
    } finally {
      setDeleting(false);
    }
  };

  const esMiCuenta = (id: number) => id === yo?.id;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Usuarios</h2>
          <p className="text-sm text-gray-500 mt-0.5">Administra los usuarios del sistema</p>
        </div>
        <button
          onClick={() => { setEditUsuario(null); setShowForm(true); }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={16} />
          Nuevo usuario
        </button>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase text-xs tracking-wide">
              <th className="px-4 py-3 text-left">Nombre</th>
              <th className="px-4 py-3 text-left">Correo</th>
              <th className="px-4 py-3 text-left">Rol</th>
              <th className="px-4 py-3 text-left">Registrado</th>
              <th className="px-4 py-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-gray-400">
                  Cargando...
                </td>
              </tr>
            ) : usuarios.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-gray-400">
                  No hay usuarios registrados.
                </td>
              </tr>
            ) : (
              usuarios.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-800">
                    <div className="flex items-center gap-2">
                      {u.nombre}
                      {esMiCuenta(u.id) && (
                        <span className="text-xs text-blue-500 font-normal">(tú)</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{u.correo}</td>
                  <td className="px-4 py-3">
                    {u.rol === 'admin' ? (
                      <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        <ShieldCheck size={11} />
                        Administrador
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        <User size={11} />
                        Usuario
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(u.createdAt).toLocaleDateString('es-SV', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => { setEditUsuario(u); setShowForm(true); }}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(u)}
                        disabled={esMiCuenta(u.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        title={esMiCuenta(u.id) ? 'No puedes eliminar tu propia cuenta' : 'Eliminar'}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Footer con conteo */}
        {!loading && usuarios.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-400">
            {usuarios.length} usuario{usuarios.length !== 1 ? 's' : ''} en total
          </div>
        )}
      </div>

      {/* Modal formulario */}
      {showForm && (
        <UsuarioFormModal
          usuario={editUsuario}
          onClose={() => setShowForm(false)}
          onSubmit={editUsuario ? handleUpdate : handleCreate}
        />
      )}

      {/* Modal confirmación eliminar */}
      {deleteTarget && (
        <ConfirmDialog
          title="Eliminar usuario"
          message={`¿Estás seguro de que deseas eliminar a "${deleteTarget.nombre}"? Esta acción no se puede deshacer.`}
          loading={deleting}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
