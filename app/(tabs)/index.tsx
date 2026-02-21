import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/auth-context';
import { theme } from '../../constants/theme';

const MODULES = [
  { key: 'milk-yield',     emoji: '🥛', label: 'Milk Yield',      color: '#22d3a0', desc: 'Yield tracking & records'    },
  { key: 'insemination',   emoji: '💉', label: 'Insemination',    color: '#60a5fa', desc: 'Breeding & pregnancy'         },
  { key: 'dob',            emoji: '🐄', label: 'Date of Birth',   color: '#f5c842', desc: 'Calving & maturity'           },
  { key: 'semen-record',   emoji: '🧬', label: 'Semen Record',    color: '#c084fc', desc: 'Calves & conception'          },
  { key: 'genetic-record', emoji: '🔬', label: 'Genetic Record',  color: '#fb923c', desc: 'Calf genetics & growth'       },
  { key: 'medical',        emoji: '💊', label: 'Medical Checkup', color: '#f87171', desc: 'Vaccination & deworming'      },
];

export default function DashboardScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  return (
    <ScrollView style={s.container} showsVerticalScrollIndicator={false}>

      {/* ── Admin Profile Card ── */}
      <View style={s.profileCard}>
        <View style={s.avatarRow}>
          <View style={s.avatar}>
            <Text style={s.avatarText}>{user?.name?.charAt(0)?.toUpperCase() ?? 'A'}</Text>
          </View>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={s.adminName}>{user?.name ?? 'Admin'}</Text>
            <Text style={s.adminRole}>{user?.role?.toUpperCase()}</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={s.logoutBtn}>
            <Text style={s.logoutText}>🚪 Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Detail rows */}
        <View style={s.detailBox}>
          <View style={s.detailRow}>
            <Text style={s.detailIcon}>📧</Text>
            <Text style={s.detailLabel}>Email</Text>
            <Text style={s.detailValue}>{user?.email ?? '-'}</Text>
          </View>
          <View style={s.detailRow}>
            <Text style={s.detailIcon}>📞</Text>
            <Text style={s.detailLabel}>Phone</Text>
            <Text style={s.detailValue}>{user?.phone ?? 'Not set'}</Text>
          </View>
          <View style={s.detailRow}>
            <Text style={s.detailIcon}>✅</Text>
            <Text style={s.detailLabel}>Status</Text>
            <Text style={[s.detailValue, { color: user?.is_active ? theme.accent : theme.danger }]}>
              {user?.is_active ? 'Active' : 'Inactive'}
            </Text>
          </View>
          <View style={[s.detailRow, { borderBottomWidth: 0 }]}>
            <Text style={s.detailIcon}>📍</Text>
            <Text style={s.detailLabel}>Zone</Text>
            <Text style={s.detailValue}>{user?.zone ?? 'N/A'}</Text>
          </View>
        </View>
      </View>

      {/* ── Modules Grid ── */}
      <View style={s.section}>
        <Text style={s.sectionLabel}>Farm Modules</Text>
        <View style={s.grid}>
          {MODULES.map(m => (
            <TouchableOpacity
              key={m.key}
              style={[s.moduleCard, { borderLeftColor: m.color }]}
              onPress={() => router.push(`/(tabs)/${m.key}` as any)}
              activeOpacity={0.75}
            >
              <Text style={{ fontSize: 30, marginBottom: 8 }}>{m.emoji}</Text>
              <Text style={s.moduleLabel}>{m.label}</Text>
              <Text style={s.moduleDesc}>{m.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

    </ScrollView>
  );
}

const s = StyleSheet.create({
  container:    { flex: 1, backgroundColor: theme.bg },
  profileCard:  { backgroundColor: theme.cardLight, margin: 16, borderRadius: 20, padding: 18, borderWidth: 1, borderColor: theme.border },
  avatarRow:    { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  avatar:       { width: 54, height: 54, borderRadius: 27, backgroundColor: theme.accent, justifyContent: 'center', alignItems: 'center' },
  avatarText:   { fontSize: 22, fontWeight: '900', color: '#000' },
  adminName:    { fontSize: 18, fontWeight: '900', color: theme.white },
  adminRole:    { fontSize: 12, color: theme.accent, fontWeight: '700', marginTop: 2 },
  logoutBtn:    { backgroundColor: 'rgba(255,90,90,0.15)', borderWidth: 1, borderColor: 'rgba(255,90,90,0.4)', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  logoutText:   { color: theme.danger, fontWeight: '700', fontSize: 13 },
  detailBox:    { backgroundColor: theme.bg + 'aa', borderRadius: 12, overflow: 'hidden' },
  detailRow:    { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: theme.border + '44' },
  detailIcon:   { fontSize: 15, marginRight: 10 },
  detailLabel:  { fontSize: 13, color: theme.textMuted, width: 60 },
  detailValue:  { fontSize: 13, fontWeight: '700', color: theme.text, flex: 1, textAlign: 'right' },
  section:      { padding: 16 },
  sectionLabel: { fontSize: 11, color: theme.textMuted, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 },
  grid:         { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  moduleCard:   { width: '47%', backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, borderLeftWidth: 3, borderRadius: 16, padding: 16 },
  moduleLabel:  { fontWeight: '800', fontSize: 14, color: theme.white },
  moduleDesc:   { fontSize: 11, color: theme.textMuted, marginTop: 4 },
});
