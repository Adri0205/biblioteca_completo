import type { EstadoPrestamo } from '../../types/prestamo';

const config: Record<EstadoPrestamo, { label: string; className: string }> = {
  activo:   { label: 'Activo',    className: 'bg-green-50 text-green-700' },
  vencido:  { label: 'Vencido',   className: 'bg-red-50 text-red-600' },
  devuelto: { label: 'Devuelto',  className: 'bg-gray-100 text-gray-500' },
};

export default function EstadoBadge({ estado }: { estado: EstadoPrestamo }) {
  const { label, className } = config[estado];
  return (
    <span className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full ${className}`}>
      {label}
    </span>
  );
}
