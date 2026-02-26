import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/auth-context';
import { Input, Btn } from '../../components/ui';
import { theme } from '../../constants/theme';

export default function SignupScreen() {
  const router = useRouter();
  const { workerSignup } = useAuth();

  const [name, setName]               = useState('');
  const [email, setEmail]             = useState('');
  const [phone, setPhone]             = useState('');
  const [farmName, setFarmName]       = useState('');
  const [designation, setDesignation] = useState('');
  const [password, setPassword]       = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [loading, setLoading]         = useState(false);

  const handleSignup = async () => {
    if (!name.trim() || !email.trim() || !password) {
      Alert.alert('Error', 'Name, email and password are required.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPass) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await workerSignup({
        name:        name.trim(),
        email:       email.trim(),
        password,
        phone:       phone.trim()       || undefined,
        farm_name:   farmName.trim()    || undefined,
        designation: designation.trim() || undefined,
      });
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
        <Image
          source={require("../../assets/cow-desi-260nw-2641028419-removebg-preview.png")}
          style={s.logoImage}
        />
        <Text style={s.title}>Create Account</Text>
        <Text style={s.subtitle}>Register as a farm worker</Text>
      </View>

      <Input label="Full Name *"        value={name}        onChangeText={setName}        placeholder="Ramesh Kumar" />
      <Input label="Email *"            value={email}       onChangeText={setEmail}       placeholder="you@farm.com" keyboardType="email-address" autoCapitalize="none" />
      <Input label="Phone"              value={phone}       onChangeText={setPhone}       placeholder="+91 98765 43210" keyboardType="phone-pad" />
      <Input label="Farm Name"          value={farmName}    onChangeText={setFarmName}    placeholder="Green Pastures Farm" />
      <Input label="Designation"        value={designation} onChangeText={setDesignation} placeholder="Milkman / Cleaner / Supervisor" />
      <Input label="Password *"         value={password}    onChangeText={setPassword}    placeholder="Min 6 characters" secureTextEntry />
      <Input label="Confirm Password *" value={confirmPass} onChangeText={setConfirmPass} placeholder="Re-enter password" secureTextEntry />

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
  content:   { flexGrow: 1, justifyContent: 'center', padding: 28, paddingBottom: 48 },
  logoWrap:  { alignItems: 'center', marginBottom: 32 },
  logoImage: { width: 140, height: 140, resizeMode: 'contain', marginBottom: 15 },
  title:     { fontSize: 26, fontWeight: '900', color: theme.white },
  subtitle:  { fontSize: 13, color: theme.textMuted, marginTop: 4 },
  linkRow:   { alignItems: 'center', marginTop: 8 },
  linkText:  { fontSize: 14, color: theme.textMuted },
  link:      { color: theme.accent, fontWeight: '700' },
});