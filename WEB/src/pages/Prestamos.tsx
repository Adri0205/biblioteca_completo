import { useState, useEffect, useCallback } from 'react';
import { Plus, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import { getPrestamos, registrarDevolucion } from '../api/prestamos';
import PrestamoFormModal from '../components/prestamos/PrestamoFormModal';
import EstadoBadge from '../components/prestamos/EstadoBadge';
import ConfirmDialog from '../components/ConfirmDialog';
import type { Prestamo, EstadoPrestamo } from '../types/prestamo';

const LIMIT = 10;

const fmt = (fecha: string | null) =>
  fecha
    ? new Date(fecha).toLocaleDateString('es-SV', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';

export default function Prestamos() {
  const [prestamos, setPrestamos] = useState<Prestamo[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [estadoFiltro, setEstadoFiltro] = useState<EstadoPrestamo | ''>('');

  // Modales
  const [showForm, setShowForm] = useState(false);
  const [devolucionTarget, setDevolucionTarget] = useState<Prestamo | null>(null);
  const [devolviendo, setDevolviendo] = useState(false);

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  const fetchPrestamos = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPrestamos({
        estado: estadoFiltro || undefined,
        page,
        limit: LIMIT,
      });
      setPrestamos(data.prestamos);
      setTotal(data.total);
    } finally {
      setLoading(false);
    }
  }, [estadoFiltro, page]);

  useEffect(() => {
    fetchPrestamos();
  }, [fetchPrestamos]);

  useEffect(() => {
    setPage(1);
  }, [estadoFiltro]);

  const handleDevolucion = async () => {
    if (!devolucionTarget) return;
    setDevolviendo(true);
    try {
      await registrarDevolucion(devolucionTarget.id);
      setDevolucionTarget(null);
      await fetchPrestamos();
    } finally {
      setDevolviendo(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Préstamos</h2>
          <p className="text-sm text-gray-500 mt-0.5">Administra los préstamos activos y el historial</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={16} />
          Nuevo préstamo
        </button>
      </div>

      {/* Filtro por estado */}
      <div className="flex items-center gap-2 flex-wrap">
        {(['', 'activo', 'vencido', 'devuelto'] as const).map((e) => (
          <button
            key={e}
            onClick={() => setEstadoFiltro(e)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              estadoFiltro === e
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {e === ''        ? 'Todos'
             : e === 'activo'  ? 'Activos'
             : e === 'vencido' ? 'Vencidos'
             : 'Devueltos'}
          </button>
        ))}
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase text-xs tracking-wide">
              <th className="px-4 py-3 text-left">ID</th>
              <th className="px-4 py-3 text-left">Usuario</th>
              <th className="px-4 py-3 text-left">Libro</th>
              <th className="px-4 py-3 text-left">Fecha préstamo</th>
              <th className="px-4 py-3 text-left">Fecha límite</th>
              <th className="px-4 py-3 text-left">Devolución</th>
              <th className="px-4 py-3 text-center">Estado</th>
              <th className="px-4 py-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-gray-400">Cargando...</td>
              </tr>
            ) : prestamos.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-gray-400">
                  No se encontraron préstamos.
                </td>
              </tr>
            ) : (
              prestamos.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-400 font-mono">#{p.id}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800">{p.usuario?.nombre ?? '—'}</p>
                    <p className="text-xs text-gray-400">{p.usuario?.correo}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800 max-w-44 truncate">{p.libro?.titulo ?? '—'}</p>
                    <p className="text-xs text-gray-400">{p.libro?.autor}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{fmt(p.fecha_prestamo)}</td>
                  <td className={`px-4 py-3 font-medium ${p.estado === 'vencido' ? 'text-red-500' : 'text-gray-600'}`}>
                    {fmt(p.fecha_limite)}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{fmt(p.fecha_devolucion)}</td>
                  <td className="px-4 py-3 text-center">
                    <EstadoBadge estado={p.estado} />
                  </td>
                  <td className="px-4 py-3 text-center">
                    {p.estado !== 'devuelto' ? (
                      <button
                        onClick={() => setDevolucionTarget(p)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Registrar devolución"
                      >
                        <RotateCcw size={13} />
                        Devolver
                      </button>
                    ) : (
                      <span className="text-xs text-gray-300">—</span>
                    )}
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

      {/* Modal nuevo préstamo */}
      {showForm && (
        <PrestamoFormModal
          onClose={() => setShowForm(false)}
          onCreated={fetchPrestamos}
        />
      )}

      {/* Confirmación devolución */}
      {devolucionTarget && (
        <ConfirmDialog
          title="Registrar devolución"
          message={`¿Confirmas la devolución del libro "${devolucionTarget.libro?.titulo}"? Se repondrá un ejemplar al stock.`}
          loading={devolviendo}
          confirmLabel="Confirmar devolución"
          confirmLoadingLabel="Registrando..."
          confirmClassName="bg-blue-600 hover:bg-blue-700"
          onConfirm={handleDevolucion}
          onCancel={() => setDevolucionTarget(null)}
        />
      )}
    </div>
  );
}
