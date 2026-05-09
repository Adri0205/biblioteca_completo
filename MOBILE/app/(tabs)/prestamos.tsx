import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { getMisPrestamos } from '../../src/api/prestamos';
import { EstadoPrestamo, Prestamo } from '../../src/types/prestamo';

const PAGE_SIZE = 12;

type FiltroEstado = EstadoPrestamo | 'todos';

const FILTROS: { key: FiltroEstado; label: string }[] = [
  { key: 'todos',    label: 'Todos'     },
  { key: 'activo',   label: 'Activos'   },
  { key: 'vencido',  label: 'Vencidos'  },
  { key: 'devuelto', label: 'Devueltos' },
];

const ESTADO_CONFIG: Record<EstadoPrestamo, { label: string; bg: string; text: string }> = {
  activo:   { label: 'Activo',    bg: '#eff6ff', text: '#1d4ed8' },
  vencido:  { label: 'Vencido',   bg: '#fef2f2', text: '#dc2626' },
  devuelto: { label: 'Devuelto',  bg: '#f0fdf4', text: '#16a34a' },
};

function ChevronIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 18l6-6-6-6"
        stroke="#9ca3af"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('es-SV', { day: '2-digit', month: 'short', year: 'numeric' });
}

function PrestamoCard({ prestamo, onPress }: { prestamo: Prestamo; onPress: () => void }) {
  const cfg = ESTADO_CONFIG[prestamo.estado];
  const isVencido = prestamo.estado === 'vencido';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.75}>
      <View style={styles.cardBody}>
        {/* Título y badge */}
        <View style={styles.cardTop}>
          <Text style={styles.cardTitulo} numberOfLines={2}>{prestamo.libro.titulo}</Text>
          <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
            <Text style={[styles.badgeText, { color: cfg.text }]}>{cfg.label}</Text>
          </View>
        </View>

        <Text style={styles.cardAutor} numberOfLines={1}>{prestamo.libro.autor}</Text>
        <View style={styles.cardDates}>
          <Text style={styles.dateLabel}>
            Prestado: <Text style={styles.dateValue}>{formatDate(prestamo.fecha_prestamo)}</Text>
          </Text>
          <Text style={[styles.dateLabel, isVencido && styles.dateVencido]}>
            Límite: <Text style={[styles.dateValue, isVencido && styles.dateVencido]}>{formatDate(prestamo.fecha_limite)}</Text>
          </Text>
          {prestamo.fecha_devolucion && (
            <Text style={styles.dateLabel}>
              Devuelto: <Text style={styles.dateValue}>{formatDate(prestamo.fecha_devolucion)}</Text>
            </Text>
          )}
        </View>
      </View>
      <ChevronIcon />
    </TouchableOpacity>
  );
}

export default function PrestamosScreen() {
  const router = useRouter();

  const [prestamos, setPrestamos]     = useState<Prestamo[]>([]);
  const [total, setTotal]             = useState(0);
  const [page, setPage]               = useState(1);
  const [loading, setLoading]         = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError]             = useState('');
  const [filtro, setFiltro]           = useState<FiltroEstado>('todos');

  const fetchPrestamos = useCallback(async (
    estado: FiltroEstado,
    pageNum: number,
    replace: boolean,
  ) => {
    try {
      replace ? setLoading(true) : setLoadingMore(true);
      setError('');

      const { data } = await getMisPrestamos({
        estado: estado !== 'todos' ? estado : undefined,
        page: pageNum,
        limit: PAGE_SIZE,
      });

      setPrestamos(prev => replace ? data.prestamos : [...prev, ...data.prestamos]);
      setTotal(data.total);
      setPage(data.pagina);
    } catch {
      setError('No se pudieron cargar los préstamos. Verifica tu conexión.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchPrestamos('todos', 1, true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFiltro = (nuevo: FiltroEstado) => {
    if (nuevo === filtro) return;
    setFiltro(nuevo);
    fetchPrestamos(nuevo, 1, true);
  };

  const handleLoadMore = () => {
    if (prestamos.length >= total || loadingMore || loading) return;
    fetchPrestamos(filtro, page + 1, false);
  };

  return (
    <View style={styles.container}>
      {/* Filtros de estado */}
      <View style={styles.filtrosWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtrosScroll}
        >
          {FILTROS.map(f => (
            <TouchableOpacity
              key={f.key}
              style={[styles.filtroChip, filtro === f.key && styles.filtroChipActive]}
              onPress={() => handleFiltro(f.key)}
              activeOpacity={0.75}
            >
              <Text style={[styles.filtroText, filtro === f.key && styles.filtroTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Contador */}
      {!loading && !error && (
        <Text style={styles.resultCount}>
          {total} {total === 1 ? 'préstamo encontrado' : 'préstamos encontrados'}
        </Text>
      )}

      {/* Contenido */}
      {error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => fetchPrestamos(filtro, 1, true)}>
            <Text style={styles.retryText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : prestamos.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No tienes préstamos{filtro !== 'todos' ? ` ${ESTADO_CONFIG[filtro as EstadoPrestamo]?.label.toLowerCase()}s` : ''} aún.</Text>
        </View>
      ) : (
        <FlatList
          data={prestamos}
          keyExtractor={item => String(item.id)}
          renderItem={({ item }) => (
            <PrestamoCard
              prestamo={item}
              onPress={() => router.push(`/prestamo/${item.id}`)}
            />
          )}
          contentContainerStyle={styles.list}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            loadingMore
              ? <ActivityIndicator style={styles.loadingMore} color="#2563eb" />
              : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  filtrosWrapper: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  filtrosScroll: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    flexDirection: 'row',
  },
  filtroChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
  },
  filtroChipActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  filtroText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  filtroTextActive: {
    color: '#ffffff',
  },
  resultCount: {
    fontSize: 12,
    color: '#6b7280',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 4,
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 20,
    gap: 10,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  cardBody: {
    flex: 1,
    gap: 4,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 2,
  },
  cardTitulo: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    lineHeight: 20,
  },
  badge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  cardAutor: {
    fontSize: 13,
    color: '#4b5563',
    marginBottom: 6,
  },
  cardDates: {
    gap: 2,
  },
  dateLabel: {
    fontSize: 12,
    color: '#9ca3af',
  },
  dateValue: {
    fontWeight: '600',
    color: '#6b7280',
  },
  dateVencido: {
    color: '#dc2626',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  errorText: {
    fontSize: 14,
    color: '#dc2626',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  retryButton: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  retryText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyText: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  loadingMore: {
    paddingVertical: 16,
  },
});
