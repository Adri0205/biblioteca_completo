import { ActivityIndicator, View } from 'react-native';

export default function Index() {
  // El guard en _layout.tsx maneja la redirección.
  // Esta pantalla solo se ve un instante mientras isLoading=false resuelve.
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#2563eb" />
    </View>
  );
}


