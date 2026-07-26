import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Button, Card } from '@/components/ui';
import { useAuth } from '@/store/auth';
import { analyzeMeal } from '@/services/ai';
import { saveMeal } from '@/services/meals';
import { setLastResult } from '@/store/lastResult';
import { colors, font, radius, spacing } from '@/theme';

type Picked = { uri: string; base64: string };

export default function Scan() {
  const { user } = useAuth();
  const router = useRouter();
  const [picked, setPicked] = useState<Picked | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function takePhoto() {
    setError(null);
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      setError('Camera permission is needed to photograph your meal.');
      return;
    }
    const res = await ImagePicker.launchCameraAsync({
      quality: 0.6,
      base64: true,
      allowsEditing: true,
      aspect: [4, 3],
    });
    handlePicked(res);
  }

  async function pickFromLibrary() {
    setError(null);
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.6,
      base64: true,
      allowsEditing: true,
      aspect: [4, 3],
    });
    handlePicked(res);
  }

  function handlePicked(res: ImagePicker.ImagePickerResult) {
    if (res.canceled || !res.assets?.[0]) return;
    const asset = res.assets[0];
    if (!asset.base64) {
      setError('Could not read the image data. Please try another photo.');
      return;
    }
    setPicked({ uri: asset.uri, base64: asset.base64 });
  }

  async function analyze() {
    if (!picked || !user) return;
    setAnalyzing(true);
    setError(null);
    try {
      const result = await analyzeMeal(picked.base64, 'image/jpeg');
      // Persist to history (best-effort; ignore failure so the user still
      // sees their result).
      saveMeal(user.id, result, null).catch((e) =>
        console.warn('[scan] saveMeal failed', e)
      );
      setLastResult(result, picked.uri);
      setPicked(null);
      router.push('/meal/result');
    } catch (e: any) {
      setError(e.message ?? 'Analysis failed. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container}>
        <View>
          <Text style={styles.title}>Scan a meal</Text>
          <Text style={styles.sub}>
            Take a clear photo of your whole plate for the best analysis.
          </Text>
        </View>

        <Card style={styles.previewCard}>
          {picked ? (
            <Image source={{ uri: picked.uri }} style={styles.preview} />
          ) : (
            <View style={styles.placeholder}>
              <Text style={{ fontSize: 52 }}>🍽️</Text>
              <Text style={styles.placeholderText}>No photo selected yet</Text>
            </View>
          )}
        </Card>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {analyzing ? (
          <Card style={styles.analyzing}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.analyzingText}>
              Analyzing your meal against your health profile…
            </Text>
          </Card>
        ) : (
          <View style={{ gap: spacing.md }}>
            <Button label="📸 Take a photo" onPress={takePhoto} />
            <Button
              label="🖼️ Choose from library"
              variant="secondary"
              onPress={pickFromLibrary}
            />
            {picked ? (
              <Button label="Analyze this meal ✨" onPress={analyze} />
            ) : null}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing.lg, gap: spacing.xl, paddingBottom: spacing.xxl },
  title: { fontSize: font.size.xxl, fontWeight: font.weight.bold, color: colors.text },
  sub: { fontSize: font.size.md, color: colors.textMuted, marginTop: 2 },
  previewCard: { padding: spacing.sm },
  preview: { width: '100%', height: 260, borderRadius: radius.md },
  placeholder: {
    height: 260,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  placeholderText: { fontSize: font.size.md, color: colors.textFaint },
  error: { color: colors.danger, fontSize: font.size.sm },
  analyzing: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xl },
  analyzingText: {
    fontSize: font.size.md,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
