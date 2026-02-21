import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/auth-context';
import { Input, Btn } from '../../components/ui';
import { theme } from '../../constants/theme';
import { Image } from "react-native";

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    setLoading(true);
    try {
      await login(email.trim(), password);
      router.replace('/(tabs)');
    } catch (err: any) {
      Alert.alert('Login Failed', err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
      {/* Logo */}
      <View style={s.logoWrap}>
        <Image
          source={require("../../assets/cow-desi-260nw-2641028419-removebg-preview.png")}
          style={s.logoImage}
        />
        <Text style={s.title}>Welcome to GauSevak</Text>
        <Text style={s.subtitle}>The Smart Way To Manage And Taking Care Of Our Cow</Text>
      </View>

      {/* Form */}
      <Input label="Email" value={email} onChangeText={setEmail} placeholder="admin@farm.com" keyboardType="email-address" />
      <Input label="Password" value={password} onChangeText={setPassword} placeholder="••••••••" secureTextEntry />

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
  container: { flex: 1, backgroundColor: theme.bg },
  content: { flexGrow: 1, justifyContent: 'center', padding: 28 },
  logoWrap: { alignItems: 'center', marginBottom: 40 },
  logoImage: {
    width: 140,
    height: 140,
    resizeMode: "contain",
    marginBottom: 15,
  },
  logoEmoji: { fontSize: 56, marginBottom: 10 },
  title: { fontSize: 30, fontWeight: '900', color: theme.white, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: theme.textMuted, marginTop: 4 },
  linkRow: { alignItems: 'center', marginTop: 8 },
  linkText: { fontSize: 14, color: theme.textMuted },
  link: { color: theme.accent, fontWeight: '700' },
});
