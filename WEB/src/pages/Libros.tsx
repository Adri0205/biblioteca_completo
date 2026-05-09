import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { getLibros, createLibro, updateLibro, deleteLibro } from '../api/libros';
import LibroFormModal from '../components/libros/LibroFormModal';
import ConfirmDialog from '../components/ConfirmDialog';
import type { Libro, LibroFormData } from '../types/libro';

const LIMIT = 10;

export default function Libros() {
  const [libros, setLibros] = useState<Libro[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [query, setQuery] = useState('');
  const [soloDisponibles, setSoloDisponibles] = useState(false);
  const [inputQuery, setInputQuery] = useState('');

  // Modales
  const [showForm, setShowForm] = useState(false);
  const [editLibro, setEditLibro] = useState<Libro | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Libro | null>(null);
  const [deleting, setDeleting] = useState(false);

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  const fetchLibros = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getLibros({
        q: query || undefined,
        disponible: soloDisponibles || undefined,
        page,
        limit: LIMIT,
      });
      setLibros(data.libros);
      setTotal(data.total);
    } finally {
      setLoading(false);
    }
  }, [query, soloDisponibles, page]);

  useEffect(() => {
    fetchLibros();
  }, [fetchLibros]);

  // Resetear página al cambiar filtros
  useEffect(() => {
    setPage(1);
  }, [query, soloDisponibles]);

  const handleSearch = () => {
    setQuery(inputQuery.trim());
  };

  const handleCreate = async (data: LibroFormData) => {
    await createLibro(data);
    await fetchLibros();
  };

  const handleUpdate = async (data: LibroFormData) => {
    if (!editLibro) return;
    await updateLibro(editLibro.id, data);
    await fetchLibros();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteLibro(deleteTarget.id);
      setDeleteTarget(null);
      await fetchLibros();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Libros</h2>
          <p className="text-sm text-gray-500 mt-0.5">Gestiona el catálogo de la biblioteca</p>
        </div>
        <button
          onClick={() => { setEditLibro(null); setShowForm(true); }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={16} />
          Nuevo libro
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-1 min-w-60 items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 bg-white">
          <Search size={16} className="text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="Buscar por título, autor o categoría..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1 text-sm focus:outline-none"
          />
        </div>
        <button
          onClick={handleSearch}
          className="px-4 py-2 text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
        >
          Buscar
        </button>
        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={soloDisponibles}
            onChange={(e) => setSoloDisponibles(e.target.checked)}
            className="accent-blue-600"
          />
          Solo disponibles
        </label>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase text-xs tracking-wide">
              <th className="px-4 py-3 text-left">Título</th>
              <th className="px-4 py-3 text-left">Autor</th>
              <th className="px-4 py-3 text-left">Categoría</th>
              <th className="px-4 py-3 text-left">ISBN</th>
              <th className="px-4 py-3 text-left">Año</th>
              <th className="px-4 py-3 text-center">Disponibles</th>
              <th className="px-4 py-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-gray-400">
                  Cargando...
                </td>
              </tr>
            ) : libros.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-gray-400">
                  No se encontraron libros.
                </td>
              </tr>
            ) : (
              libros.map((libro) => (
                <tr key={libro.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-800 max-w-48 truncate">
                    {libro.titulo}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{libro.autor}</td>
                  <td className="px-4 py-3">
                    <span className="bg-blue-50 text-blue-700 text-xs font-medium px-2 py-0.5 rounded-full">
                      {libro.categoria}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{libro.isbn ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{libro.anio_publicacion ?? '—'}</td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`font-semibold ${
                        libro.cantidad_disponible === 0
                          ? 'text-red-500'
                          : 'text-green-600'
                      }`}
                    >
                      {libro.cantidad_disponible}
                    </span>
                    <span className="text-gray-400"> / {libro.cantidad_total}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => { setEditLibro(libro); setShowForm(true); }}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(libro)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar"
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
      </div>

      {/* Paginación */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>
          {total === 0
            ? 'Sin resultados'
            : `Mostrando ${(page - 1) * LIMIT + 1}–${Math.min(page * LIMIT, total)} de ${total}`}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage((p) => p - 1)}
            disabled={page === 1}
            className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="px-3 py-1 bg-blue-50 text-blue-600 font-medium rounded-lg">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page === totalPages}
            className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Modal formulario */}
      {showForm && (
        <LibroFormModal
          libro={editLibro}
          onClose={() => setShowForm(false)}
          onSubmit={editLibro ? handleUpdate : handleCreate}
        />
      )}

      {/* Modal confirmación eliminar */}
      {deleteTarget && (
        <ConfirmDialog
          title="Eliminar libro"
          message={`¿Estás seguro de que deseas eliminar "${deleteTarget.titulo}"? Esta acción no se puede deshacer.`}
          loading={deleting}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
