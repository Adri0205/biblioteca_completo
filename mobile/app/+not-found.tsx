import { StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';

export default function NotFoundScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Página no encontrada</Text>
      <Link href="/" style={styles.link}>
        <Text style={styles.linkText}>Volver al inicio</Text>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  link: {
    marginTop: 8,
  },
  linkText: {
    fontSize: 15,
    color: '#2563eb',
    fontWeight: '600',
  },
});
