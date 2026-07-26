import { Redirect } from 'expo-router';

// The RouteGuard in _layout.tsx handles the real logic; this just points
// the initial route at the tabs (guard will bounce to login if needed).
export default function Index() {
  return <Redirect href="/(tabs)" />;
}
