import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { getLibroById } from '../../src/api/libros';
import { Libro } from '../../src/types/libro';

function BackIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M15 18l-6-6 6-6"
        stroke="#2563eb"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

export default function LibroDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router  = useRouter();

  const [libro, setLibro]     = useState<Libro | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    if (!id) return;
    getLibroById(Number(id))
      .then(({ data }) => setLibro(data))
      .catch(() => setError('No se pudo cargar el libro.'))
      .finally(() => setLoading(false));
  }, [id]);

  const disponible = (libro?.cantidad_disponible ?? 0) > 0;
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.7}>
          <BackIcon />
          <Text style={styles.backText}>Libros</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Detalle</Text>
        <View style={{ width: 72 }} />
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
            <Text style={styles.retryText}>Volver</Text>
          </TouchableOpacity>
        </View>
      ) : libro ? (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Badges */}
          <View style={styles.badgesRow}>
            <View style={styles.categoriaChip}>
              <Text style={styles.categoriaText}>{libro.categoria}</Text>
            </View>
            <View style={[styles.disponibilidadBadge, disponible ? styles.badgeGreen : styles.badgeRed]}>
              <Text style={[styles.disponibilidadText, disponible ? styles.textGreen : styles.textRed]}>
                {disponible ? 'Disponible' : 'No disponible'}
              </Text>
            </View>
          </View>

          {/* Título y autor */}
          <Text style={styles.titulo}>{libro.titulo}</Text>
          <Text style={styles.autor}>{libro.autor}</Text>

          {/* Descripción */}
          {libro.descripcion && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Descripción</Text>
              <Text style={styles.descripcion}>{libro.descripcion}</Text>
            </View>
          )}

          {/* Detalles */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Información</Text>
            <View style={styles.infoCard}>
              {libro.isbn && <InfoRow label="ISBN" value={libro.isbn} />}
              {libro.anio_publicacion && (
                <InfoRow label="Año de publicación" value={String(libro.anio_publicacion)} />
              )}
              <InfoRow label="Ejemplares totales"     value={String(libro.cantidad_total)} />
              <InfoRow label="Ejemplares disponibles" value={String(libro.cantidad_disponible)} />
            </View>
          </View>
        </ScrollView>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    width: 72,
  },
  backText: {
    fontSize: 15,
    color: '#2563eb',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
    textAlign: 'center',
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
  content: {
    padding: 20,
    gap: 8,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  categoriaChip: {
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  categoriaText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1d4ed8',
  },
  disponibilidadBadge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  disponibilidadText: {
    fontSize: 12,
    fontWeight: '600',
  },
  badgeGreen:  { backgroundColor: '#f0fdf4' },
  badgeRed:    { backgroundColor: '#fef2f2' },
  textGreen:   { color: '#16a34a' },
  textRed:     { color: '#dc2626' },
  titulo: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    lineHeight: 30,
    marginBottom: 4,
  },
  autor: {
    fontSize: 16,
    color: '#4b5563',
    fontWeight: '500',
    marginBottom: 8,
  },
  section: {
    marginTop: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  descripcion: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 22,
  },
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  infoLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
    maxWidth: '60%',
    textAlign: 'right',
  },
});
