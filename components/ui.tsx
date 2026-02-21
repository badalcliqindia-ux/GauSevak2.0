import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../constants/theme';

// ── Input ──────────────────────────────────────────
export const Input = ({ label, value, onChangeText, placeholder, secureTextEntry, keyboardType }: any) => (
  <View style={{ marginBottom: 14 }}>
    <Text style={s.label}>{label}</Text>
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={theme.textMuted}
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
      style={s.input}
    />
  </View>
);

// ── Button ─────────────────────────────────────────
export const Btn = ({ label, onPress, color = theme.accent, textColor = '#000', outline = false }: any) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.8}
    style={[s.btn, outline ? { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: color } : { backgroundColor: color }]}>
    <Text style={[s.btnText, { color: outline ? color : textColor }]}>{label}</Text>
  </TouchableOpacity>
);

// ── Badge ───────────────────────────────────────────
export const Badge = ({ text, color = theme.accent }: any) => (
  <View style={[s.badge, { backgroundColor: color + '22', borderColor: color + '55' }]}>
    <Text style={[s.badgeText, { color }]}>{text}</Text>
  </View>
);

// ── Card ────────────────────────────────────────────
export const Card = ({ children, style }: any) => (
  <View style={[s.card, style]}>{children}</View>
);

// ── Row ─────────────────────────────────────────────
export const Row = ({ label, value, highlight = false }: any) => (
  <View style={s.row}>
    <Text style={s.rowLabel}>{label}</Text>
    <Text style={[s.rowValue, highlight && { color: theme.accent }]}>{String(value ?? '-')}</Text>
  </View>
);

// ── SectionHeader ────────────────────────────────────
export const SectionHeader = ({ title, emoji }: any) => (
  <View style={s.secHead}>
    <Text style={{ fontSize: 24 }}>{emoji}</Text>
    <Text style={s.secTitle}>{title}</Text>
  </View>
);

// ── StatBox ──────────────────────────────────────────
export const StatBox = ({ icon, value, label, color = theme.accent }: any) => (
  <View style={[s.statBox, { backgroundColor: color + '15', borderColor: color + '33' }]}>
    <Text style={{ fontSize: 11, color: theme.textMuted }}>{icon}</Text>
    <Text style={[s.statVal, { color }]}>{String(value)}</Text>
    <Text style={s.statLab}>{label}</Text>
  </View>
);

// ── CardHeader ───────────────────────────────────────
export const CardHeader = ({ title, badge, badgeColor }: any) => (
  <View style={s.cardHead}>
    <Text style={s.cardTitle}>{title}</Text>
    {badge && <Badge text={badge} color={badgeColor || theme.accent} />}
  </View>
);

const s = StyleSheet.create({
  label:     { fontSize: 11, color: theme.textMuted, marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: '700' },
  input:     { backgroundColor: theme.cardLight, borderWidth: 1.5, borderColor: theme.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, color: theme.text, fontSize: 15 },
  btn:       { width: '100%', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginBottom: 10 },
  btnText:   { fontSize: 15, fontWeight: '700' },
  badge:     { borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3, alignSelf: 'flex-start' },
  badgeText: { fontSize: 12, fontWeight: '700' },
  card:      { backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, borderRadius: 16, padding: 16, marginBottom: 14 },
  row:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: theme.border + '33' },
  rowLabel:  { fontSize: 13, color: theme.textMuted, flex: 1 },
  rowValue:  { fontSize: 13, fontWeight: '700', color: theme.text, textAlign: 'right', flex: 1 },
  secHead:   { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: theme.border },
  secTitle:  { fontSize: 18, fontWeight: '800', color: theme.text },
  statBox:   { flex: 1, borderWidth: 1, borderRadius: 10, padding: 10, alignItems: 'center' },
  statVal:   { fontSize: 16, fontWeight: '900', marginTop: 2 },
  statLab:   { fontSize: 10, color: theme.textMuted, marginTop: 2 },
  cardHead:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardTitle: { fontSize: 15, fontWeight: '800', color: theme.white },
});
