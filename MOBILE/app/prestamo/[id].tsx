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
import { getPrestamoById } from '../../src/api/prestamos';
import { EstadoPrestamo, Prestamo } from '../../src/types/prestamo';

const ESTADO_CONFIG: Record<EstadoPrestamo, { label: string; bg: string; text: string }> = {
  activo:   { label: 'Activo',   bg: '#eff6ff', text: '#1d4ed8' },
  vencido:  { label: 'Vencido',  bg: '#fef2f2', text: '#dc2626' },
  devuelto: { label: 'Devuelto', bg: '#f0fdf4', text: '#16a34a' },
};

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

function InfoRow({
  label,
  value,
  valueStyle,
}: {
  label: string;
  value: string;
  valueStyle?: object;
}) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, valueStyle]}>{value}</Text>
    </View>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-SV', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export default function PrestamoDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router  = useRouter();

  const [prestamo, setPrestamo] = useState<Prestamo | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  useEffect(() => {
    if (!id) return;
    getPrestamoById(Number(id))
      .then(({ data }) => setPrestamo(data))
      .catch(() => setError('No se pudo cargar el préstamo.'))
      .finally(() => setLoading(false));
  }, [id]);

  const cfg = prestamo ? ESTADO_CONFIG[prestamo.estado] : null;
  const isVencido = prestamo?.estado === 'vencido';
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.7}>
          <BackIcon />
          <Text style={styles.backText}>Préstamos</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalle</Text>
        <View style={{ width: 88 }} />
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
      ) : prestamo && cfg ? (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Estado badge */}
          <View style={styles.badgeRow}>
            <View style={[styles.estadoBadge, { backgroundColor: cfg.bg }]}>
              <Text style={[styles.estadoText, { color: cfg.text }]}>{cfg.label}</Text>
            </View>
          </View>

          {/* Libro */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Libro</Text>
            <View style={styles.libroCard}>
              <Text style={styles.libroTitulo}>{prestamo.libro.titulo}</Text>
              <Text style={styles.libroAutor}>{prestamo.libro.autor}</Text>
              <View style={styles.libroMeta}>
                <View style={styles.categoriaChip}>
                  <Text style={styles.categoriaText}>{prestamo.libro.categoria}</Text>
                </View>
                {prestamo.libro.isbn && (
                  <Text style={styles.isbnText}>ISBN: {prestamo.libro.isbn}</Text>
                )}
              </View>
            </View>
          </View>

          {/* Fechas */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Fechas del préstamo</Text>
            <View style={styles.infoCard}>
              <InfoRow
                label="Fecha de préstamo"
                value={formatDate(prestamo.fecha_prestamo)}
              />
              <InfoRow
                label="Fecha límite"
                value={formatDate(prestamo.fecha_limite)}
                valueStyle={isVencido ? styles.textVencido : undefined}
              />
              {prestamo.fecha_devolucion && (
                <InfoRow
                  label="Fecha de devolución"
                  value={formatDate(prestamo.fecha_devolucion)}
                  valueStyle={styles.textDevuelto}
                />
              )}
            </View>
          </View>

          {/* Aviso si vencido */}
          {isVencido && (
            <View style={styles.alertBox}>
              <Text style={styles.alertText}>
                Este préstamo ha superado su fecha límite. Por favor acércate a la biblioteca para regularizar la devolución.
              </Text>
            </View>
          )}
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
    width: 88,
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
    gap: 4,
  },
  badgeRow: {
    marginBottom: 8,
  },
  estadoBadge: {
    alignSelf: 'flex-start',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  estadoText: {
    fontSize: 13,
    fontWeight: '700',
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
  libroCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 16,
    gap: 6,
  },
  libroTitulo: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
    lineHeight: 24,
  },
  libroAutor: {
    fontSize: 14,
    color: '#4b5563',
    fontWeight: '500',
  },
  libroMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  categoriaChip: {
    backgroundColor: '#eff6ff',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  categoriaText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1d4ed8',
  },
  isbnText: {
    fontSize: 12,
    color: '#9ca3af',
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
    paddingVertical: 13,
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
    maxWidth: '55%',
    textAlign: 'right',
  },
  textVencido: {
    color: '#dc2626',
  },
  textDevuelto: {
    color: '#16a34a',
  },
  alertBox: {
    marginTop: 16,
    backgroundColor: '#fef2f2',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#fecaca',
    padding: 14,
  },
  alertText: {
    fontSize: 13,
    color: '#b91c1c',
    lineHeight: 20,
  },
});
