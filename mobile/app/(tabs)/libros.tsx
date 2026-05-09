import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Path, Circle } from 'react-native-svg';
import { getLibros } from '../../src/api/libros';
import { Libro } from '../../src/types/libro';

const PAGE_SIZE = 12;

function SearchIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Circle cx="11" cy="11" r="8" stroke="#9ca3af" strokeWidth="2" />
      <Path d="M21 21l-4.35-4.35" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

function ChevronIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path d="M9 18l6-6-6-6" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function DisponibleBadge({ disponible }: { disponible: boolean }) {
  return (
    <View style={[styles.badge, disponible ? styles.badgeGreen : styles.badgeRed]}>
      <Text style={[styles.badgeText, disponible ? styles.badgeTextGreen : styles.badgeTextRed]}>
        {disponible ? 'Disponible' : 'No disponible'}
      </Text>
    </View>
  );
}

function LibroCard({ libro, onPress }: { libro: Libro; onPress: () => void }) {
  const disponible = libro.cantidad_disponible > 0;
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.75}>
      <View style={styles.cardBody}>
        <View style={styles.cardHeader}>
          <View style={styles.categoriaChip}>
            <Text style={styles.categoriaText} numberOfLines={1}>{libro.categoria}</Text>
          </View>
          <DisponibleBadge disponible={disponible} />
        </View>
        <Text style={styles.cardTitulo} numberOfLines={2}>{libro.titulo}</Text>
        <Text style={styles.cardAutor} numberOfLines={1}>{libro.autor}</Text>
        {libro.anio_publicacion && (
          <Text style={styles.cardAnio}>{libro.anio_publicacion}</Text>
        )}
      </View>
      <ChevronIcon />
    </TouchableOpacity>
  );
}

export default function LibrosScreen() {
  const router = useRouter();

  const [libros, setLibros] = useState<Libro[]>([]);
  const [total, setTotal]   = useState(0);
  const [page, setPage]     = useState(1);
  const [loading, setLoading]         = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError]   = useState('');

  const [searchText, setSearchText]       = useState('');
  const [soloDisponible, setSoloDisponible] = useState(false);

  // Debounce search
  const searchRef = useRef('');
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchLibros = useCallback(async (
    query: string,
    disponible: boolean,
    pageNum: number,
    replace: boolean,
  ) => {
    try {
      replace ? setLoading(true) : setLoadingMore(true);
      setError('');

      const { data } = await getLibros({
        q: query || undefined,
        disponible: disponible || undefined,
        page: pageNum,
        limit: PAGE_SIZE,
      });

      setLibros(prev => replace ? data.libros : [...prev, ...data.libros]);
      setTotal(data.total);
      setPage(data.pagina);
    } catch {
      setError('No se pudieron cargar los libros. Verifica tu conexión.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchLibros(searchText, soloDisponible, 1, true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearchChange = (text: string) => {
    setSearchText(text);
    searchRef.current = text;
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      fetchLibros(searchRef.current, soloDisponible, 1, true);
    }, 400);
  };

  const handleToggleDisponible = () => {
    const next = !soloDisponible;
    setSoloDisponible(next);
    fetchLibros(searchText, next, 1, true);
  };

  const handleLoadMore = () => {
    const hasMore = libros.length < total;
    if (!hasMore || loadingMore || loading) return;
    fetchLibros(searchText, soloDisponible, page + 1, false);
  };

  const handleRetry = () => fetchLibros(searchText, soloDisponible, 1, true);

  return (
    <View style={styles.container}>
      {/* Barra de búsqueda */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <SearchIcon />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por título, autor o categoría..."
            placeholderTextColor="#9ca3af"
            value={searchText}
            onChangeText={handleSearchChange}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
        </View>

        {/* Filtro disponibilidad */}
        <TouchableOpacity
          style={[styles.filterChip, soloDisponible && styles.filterChipActive]}
          onPress={handleToggleDisponible}
          activeOpacity={0.75}
        >
          <Text style={[styles.filterChipText, soloDisponible && styles.filterChipTextActive]}>
            Disponibles
          </Text>
        </TouchableOpacity>
      </View>

      {/* Estado de resultados */}
      {!loading && !error && (
        <Text style={styles.resultCount}>
          {total} {total === 1 ? 'libro encontrado' : 'libros encontrados'}
        </Text>
      )}

      {/* Error */}
      {error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : libros.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No se encontraron libros.</Text>
        </View>
      ) : (
        <FlatList
          data={libros}
          keyExtractor={item => String(item.id)}
          renderItem={({ item }) => (
            <LibroCard
              libro={item}
              onPress={() => router.push(`/libro/${item.id}`)}
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
    padding: 0,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
  },
  filterChipActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  filterChipTextActive: {
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  categoriaChip: {
    backgroundColor: '#eff6ff',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  categoriaText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1d4ed8',
  },
  badge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeGreen: { backgroundColor: '#f0fdf4' },
  badgeRed:   { backgroundColor: '#fef2f2' },
  badgeText:  { fontSize: 11, fontWeight: '600' },
  badgeTextGreen: { color: '#16a34a' },
  badgeTextRed:   { color: '#dc2626' },
  cardTitulo: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    lineHeight: 20,
  },
  cardAutor: {
    fontSize: 13,
    color: '#4b5563',
  },
  cardAnio: {
    fontSize: 12,
    color: '#9ca3af',
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
  },
  loadingMore: {
    paddingVertical: 16,
  },
});
