import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/auth-context';
import { Input, Btn } from '../../components/ui';
import { theme } from '../../constants/theme';

export default function SignupScreen() {
  const router = useRouter();
  const { signup } = useAuth();
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [farm, setFarm]         = useState('');
  const [phone, setPhone]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSignup = async () => {
    if (!name || !email || !farm || !password) {
      Alert.alert('Error', 'All fields are required.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      await signup(name.trim(), email.trim(), farm.trim(), password, phone.trim());
      router.replace('/(tabs)');
    } catch (err: any) {
      Alert.alert('Signup Failed', err.message || 'Could not create account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
      <View style={s.logoWrap}>
        <Text style={s.logoEmoji}>🌾</Text>
        <Text style={s.title}>Create Account</Text>
        <Text style={s.subtitle}>Register your farm</Text>
      </View>

      <Input label="Full Name"  value={name}     onChangeText={setName}     placeholder="Dr. Ramesh Kumar" />
      <Input label="Email"      value={email}    onChangeText={setEmail}    placeholder="you@farm.com"     keyboardType="email-address" />
      <Input label="Farm Name"  value={farm}     onChangeText={setFarm}     placeholder="Green Pastures Farm" />
      <Input label="Phone"      value={phone}    onChangeText={setPhone}    placeholder="+91 98765 43210"  keyboardType="phone-pad" />
      <Input label="Password"   value={password} onChangeText={setPassword} placeholder="Min 6 characters" secureTextEntry />

      {loading
        ? <ActivityIndicator size="large" color={theme.accent} style={{ marginVertical: 16 }} />
        : <Btn label="Create Account" onPress={handleSignup} />
      }

      <TouchableOpacity onPress={() => router.push('/(auth)/login')} style={s.linkRow}>
        <Text style={s.linkText}>Already have an account? <Text style={s.link}>Login</Text></Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  content:   { flexGrow: 1, justifyContent: 'center', padding: 28 },
  logoWrap:  { alignItems: 'center', marginBottom: 32 },
  logoEmoji: { fontSize: 48, marginBottom: 8 },
  title:     { fontSize: 26, fontWeight: '900', color: theme.white },
  subtitle:  { fontSize: 13, color: theme.textMuted, marginTop: 4 },
  linkRow:   { alignItems: 'center', marginTop: 8 },
  linkText:  { fontSize: 14, color: theme.textMuted },
  link:      { color: theme.accent, fontWeight: '700' },
});
