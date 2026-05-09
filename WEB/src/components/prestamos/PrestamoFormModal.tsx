import { useState, useEffect, FormEvent } from 'react';
import { X, Search } from 'lucide-react';
import { getUsuarios } from '../../api/usuarios';
import { getLibros } from '../../api/libros';
import { createPrestamo } from '../../api/prestamos';
import type { Usuario } from '../../types/usuario';
import type { Libro } from '../../types/libro';

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

export default function PrestamoFormModal({ onClose, onCreated }: Props) {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [libros, setLibros] = useState<Libro[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Selección
  const [usuarioQuery, setUsuarioQuery] = useState('');
  const [libroQuery, setLibroQuery] = useState('');
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<Usuario | null>(null);
  const [libroSeleccionado, setLibroSeleccionado] = useState<Libro | null>(null);
  const [diasPrestamo, setDiasPrestamo] = useState('14');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([getUsuarios(), getLibros({ limit: 100 })])
      .then(([us, lb]) => {
        setUsuarios(us);
        setLibros(lb.libros);
      })
      .finally(() => setLoadingData(false));
  }, []);

  const usuariosFiltrados = usuarios.filter(
    (u) =>
      u.nombre.toLowerCase().includes(usuarioQuery.toLowerCase()) ||
      u.correo.toLowerCase().includes(usuarioQuery.toLowerCase())
  );

  const librosFiltrados = libros.filter(
    (l) =>
      l.cantidad_disponible > 0 &&
      (l.titulo.toLowerCase().includes(libroQuery.toLowerCase()) ||
        l.autor.toLowerCase().includes(libroQuery.toLowerCase()))
  );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!usuarioSeleccionado) { setError('Debes seleccionar un usuario.'); return; }
    if (!libroSeleccionado)   { setError('Debes seleccionar un libro.'); return; }

    const dias = parseInt(diasPrestamo);
    if (!dias || dias < 1) { setError('Los días de préstamo deben ser al menos 1.'); return; }

    setLoading(true);
    try {
      await createPrestamo({
        usuario_id: usuarioSeleccionado.id,
        libro_id: libroSeleccionado.id,
        dias_prestamo: dias,
      });
      onCreated();
      onClose();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? 'Error al registrar el préstamo.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Nuevo préstamo</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {loadingData ? (
          <div className="px-6 py-10 text-center text-gray-400">Cargando datos...</div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
            {/* Selección de usuario */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Usuario <span className="text-red-500">*</span>
              </label>
              {usuarioSeleccionado ? (
                <div className="flex items-center justify-between border border-blue-300 bg-blue-50 rounded-lg px-3 py-2">
                  <div>
                    <p className="text-sm font-medium text-blue-800">{usuarioSeleccionado.nombre}</p>
                    <p className="text-xs text-blue-500">{usuarioSeleccionado.correo}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setUsuarioSeleccionado(null); setUsuarioQuery(''); }}
                    className="text-blue-400 hover:text-blue-600"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2">
                    <Search size={15} className="text-gray-400 shrink-0" />
                    <input
                      type="text"
                      placeholder="Buscar por nombre o correo..."
                      value={usuarioQuery}
                      onChange={(e) => setUsuarioQuery(e.target.value)}
                      className="flex-1 text-sm focus:outline-none"
                    />
                  </div>
                  {usuarioQuery && (
                    <div className="border border-gray-200 rounded-lg max-h-36 overflow-y-auto divide-y divide-gray-100">
                      {usuariosFiltrados.length === 0 ? (
                        <p className="px-3 py-2 text-sm text-gray-400">Sin resultados</p>
                      ) : (
                        usuariosFiltrados.slice(0, 6).map((u) => (
                          <button
                            key={u.id}
                            type="button"
                            onClick={() => { setUsuarioSeleccionado(u); setUsuarioQuery(''); }}
                            className="w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors"
                          >
                            <p className="text-sm font-medium text-gray-800">{u.nombre}</p>
                            <p className="text-xs text-gray-400">{u.correo}</p>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Selección de libro */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Libro <span className="text-red-500">*</span>
              </label>
              {libroSeleccionado ? (
                <div className="flex items-center justify-between border border-blue-300 bg-blue-50 rounded-lg px-3 py-2">
                  <div>
                    <p className="text-sm font-medium text-blue-800">{libroSeleccionado.titulo}</p>
                    <p className="text-xs text-blue-500">
                      {libroSeleccionado.autor} · {libroSeleccionado.cantidad_disponible} disponible(s)
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setLibroSeleccionado(null); setLibroQuery(''); }}
                    className="text-blue-400 hover:text-blue-600"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2">
                    <Search size={15} className="text-gray-400 shrink-0" />
                    <input
                      type="text"
                      placeholder="Buscar por título o autor (solo disponibles)..."
                      value={libroQuery}
                      onChange={(e) => setLibroQuery(e.target.value)}
                      className="flex-1 text-sm focus:outline-none"
                    />
                  </div>
                  {libroQuery && (
                    <div className="border border-gray-200 rounded-lg max-h-36 overflow-y-auto divide-y divide-gray-100">
                      {librosFiltrados.length === 0 ? (
                        <p className="px-3 py-2 text-sm text-gray-400">Sin resultados disponibles</p>
                      ) : (
                        librosFiltrados.slice(0, 6).map((l) => (
                          <button
                            key={l.id}
                            type="button"
                            onClick={() => { setLibroSeleccionado(l); setLibroQuery(''); }}
                            className="w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors"
                          >
                            <p className="text-sm font-medium text-gray-800">{l.titulo}</p>
                            <p className="text-xs text-gray-400">
                              {l.autor} · {l.cantidad_disponible} disponible(s)
                            </p>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Días de préstamo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Días de préstamo <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min={1}
                max={90}
                value={diasPrestamo}
                onChange={(e) => setDiasPrestamo(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-400 mt-1">Por defecto: 14 días</p>
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
                {error}
              </p>
            )}

            {/* Acciones */}
            <div className="flex justify-end gap-3 pt-1">
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
                {loading ? 'Registrando...' : 'Registrar préstamo'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
