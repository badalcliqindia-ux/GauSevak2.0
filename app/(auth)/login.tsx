import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/auth-context';
import { Input, Btn } from '../../components/ui';
import { theme } from '../../constants/theme';

export default function LoginScreen() {
  const router = useRouter();
  const { workerLogin } = useAuth();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    setLoading(true);
    try {
      await workerLogin(email.trim(), password);
      router.replace('/(tabs)');
    } catch (err: any) {
      Alert.alert('Login Failed', err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
      <View style={s.logoWrap}>
        <Image
          source={require("../../assets/cow-desi-260nw-2641028419-removebg-preview.png")}
          style={s.logoImage}
        />
        <Text style={s.title}>Welcome to GauSevak</Text>
        <Text style={s.subtitle}>Farm Worker Portal</Text>
      </View>

      <Input
        label="Email"
        value={email}
        onChangeText={setEmail}
        placeholder="worker@farm.com"
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <Input
        label="Password"
        value={password}
        onChangeText={setPassword}
        placeholder="••••••••"
        secureTextEntry
      />

      {loading
        ? <ActivityIndicator size="large" color={theme.accent} style={{ marginVertical: 16 }} />
        : <Btn label="Login" onPress={handleLogin} />
      }

      <TouchableOpacity onPress={() => router.push('/(auth)/signup')} style={s.linkRow}>
        <Text style={s.linkText}>Don't have an account? <Text style={s.link}>Sign Up</Text></Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content:   { flexGrow: 1, justifyContent: 'center', padding: 28 },
  logoWrap:  { alignItems: 'center', marginBottom: 40 },
  logoImage: { width: 140, height: 140, resizeMode: 'contain', marginBottom: 15 },
  title:     { fontSize: 30, fontWeight: '900', color: '#000', letterSpacing: -0.5 },
  subtitle:  { fontSize: 14, color: theme.textMuted, marginTop: 4 },
  linkRow:   { alignItems: 'center', marginTop: 8 },
  linkText:  { fontSize: 14, color: theme.textMuted },
  link:      { color: theme.accent, fontWeight: '700' },
});