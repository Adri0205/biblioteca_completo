import { useState, useEffect, FormEvent } from 'react';
import { X } from 'lucide-react';
import type { Libro, LibroFormData } from '../../types/libro';

interface Props {
  libro?: Libro | null;
  onClose: () => void;
  onSubmit: (data: LibroFormData) => Promise<void>;
}

const empty: LibroFormData = {
  titulo: '',
  autor: '',
  categoria: '',
  isbn: '',
  descripcion: '',
  anio_publicacion: '',
  cantidad_total: 1,
  cantidad_disponible: 1,
};

export default function LibroFormModal({ libro, onClose, onSubmit }: Props) {
  const [form, setForm] = useState<LibroFormData>(empty);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (libro) {
      setForm({
        titulo: libro.titulo,
        autor: libro.autor,
        categoria: libro.categoria,
        isbn: libro.isbn ?? '',
        descripcion: libro.descripcion ?? '',
        anio_publicacion: libro.anio_publicacion?.toString() ?? '',
        cantidad_total: libro.cantidad_total,
        cantidad_disponible: libro.cantidad_disponible,
      });
    } else {
      setForm(empty);
    }
    setError('');
  }, [libro]);

  const set = (field: keyof LibroFormData, value: string | number) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.cantidad_disponible > form.cantidad_total) {
      setError('La cantidad disponible no puede ser mayor que la cantidad total.');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(form);
      onClose();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? 'Error al guardar el libro.';
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
          <h2 className="text-lg font-semibold text-gray-800">
            {libro ? 'Editar libro' : 'Nuevo libro'}
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
          {/* Título */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Título <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              maxLength={200}
              value={form.titulo}
              onChange={(e) => set('titulo', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Autor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Autor <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              maxLength={100}
              value={form.autor}
              onChange={(e) => set('autor', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoría <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              maxLength={50}
              value={form.categoria}
              onChange={(e) => set('categoria', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* ISBN y Año — fila */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ISBN</label>
              <input
                type="text"
                maxLength={20}
                value={form.isbn}
                onChange={(e) => set('isbn', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Año de publicación
              </label>
              <input
                type="number"
                min={1000}
                max={new Date().getFullYear()}
                value={form.anio_publicacion}
                onChange={(e) => set('anio_publicacion', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Cantidad total y disponible — fila */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cantidad total <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                min={1}
                value={form.cantidad_total}
                onChange={(e) => set('cantidad_total', parseInt(e.target.value) || 1)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cantidad disponible <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                min={0}
                max={form.cantidad_total}
                value={form.cantidad_disponible}
                onChange={(e) => set('cantidad_disponible', parseInt(e.target.value) || 0)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea
              rows={3}
              value={form.descripcion}
              onChange={(e) => set('descripcion', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
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
