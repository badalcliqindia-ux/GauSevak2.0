// app/(tabs)/health.tsx — Health Check Screen
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/auth-context';
import { apiAddMedical } from '../../services/api';
import { COWS } from '../../constants/cows-config';

function todayStr() { return new Date().toISOString().split('T')[0]; }

const HEALTH_OPTIONS = [
  { key: 'healthy',       icon: 'heart-pulse',      lib: 'MCI', label: 'Healthy',       color: '#22d3a0' },
  { key: 'fever',         icon: 'thermometer-high', lib: 'MCI', label: 'Fever',         color: '#f87171' },
  { key: 'upset_stomach', icon: 'stomach',          lib: 'MCI', label: 'Upset Stomach', color: '#fb923c' },
  { key: 'injury',        icon: 'bandage',          lib: 'MCI', label: 'Injury',        color: '#facc15' },
  { key: 'other',         icon: 'help-circle',      lib: 'I',   label: 'Other',         color: '#60a5fa' },
] as const;

function HealthIcon({ opt, size = 18 }: { opt: typeof HEALTH_OPTIONS[number]; size?: number }) {
  if (opt.lib === 'I') return <Ionicons name={opt.icon as any} size={size} color={opt.color} />;
  return <MaterialCommunityIcons name={opt.icon as any} size={size} color={opt.color} />;
}

export default function HealthScreen() {
  const { token } = useAuth();
  const [healthData, setHealthData] = useState<Record<string, { status: string | null; loading: string | null }>>({});

  const get = (id: string) => healthData[id] ?? { status: null, loading: null };
  const set = (id: string, patch: any) =>
    setHealthData(prev => ({ ...prev, [id]: { ...get(id), ...patch } }));

  const handleSelect = async (cow: typeof COWS[0], optKey: string) => {
    const d = get(cow.id);
    if (d.loading || !token) return;
    set(cow.id, { loading: optKey });
    try {
      await apiAddMedical(token, {
        cow_name: cow.name,
        tag_id: cow.tag_id ?? cow.id,
        age: 0,
        notes: optKey,
        date: todayStr(),
      });
      set(cow.id, { status: optKey, loading: null });
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'Could not save');
      set(cow.id, { loading: null });
    }
  };

  const healthyCount = COWS.filter(c => get(c.id).status === 'healthy').length;
  const checkedCount = COWS.filter(c => get(c.id).status !== null).length;

  return (
    <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
      {/* Stats Banner */}
      <View style={s.banner}>
        <View style={s.statItem}>
          <MaterialCommunityIcons name="heart-pulse" size={22} color="#22d3a0" />
          <Text style={[s.statNum, { color: '#22d3a0' }]}>{healthyCount}</Text>
          <Text style={s.statLbl}>Healthy</Text>
        </View>
        <View style={s.statDivider} />
        <View style={s.statItem}>
          <MaterialCommunityIcons name="clipboard-check" size={22} color="#60a5fa" />
          <Text style={[s.statNum, { color: '#60a5fa' }]}>{checkedCount}</Text>
          <Text style={s.statLbl}>Checked</Text>
        </View>
        <View style={s.statDivider} />
        <View style={s.statItem}>
          <MaterialCommunityIcons name="cow" size={22} color="#f5c842" />
          <Text style={[s.statNum, { color: '#f5c842' }]}>{COWS.length}</Text>
          <Text style={s.statLbl}>Total</Text>
        </View>
      </View>

      <View style={s.dateBadge}>
        <Ionicons name="calendar-outline" size={13} color="#666" />
        <Text style={s.dateText}> Health Check  •  {todayStr()}</Text>
      </View>

      {/* Cow Cards */}
      {COWS.map(cow => {
        const d = get(cow.id);
        const selectedOpt = HEALTH_OPTIONS.find(o => o.key === d.status);
        const isHealthy   = d.status === 'healthy';
        return (
          <View key={cow.id} style={[s.card, d.status && (isHealthy ? s.cardHealthy : s.cardSick)]}>
            <View style={s.cardHeader}>
              <View style={s.cowInfo}>
                <View style={[s.cowAvatar, { backgroundColor: selectedOpt ? selectedOpt.color + '22' : 'rgba(255,255,255,0.06)' }]}>
                  <MaterialCommunityIcons name="cow" size={22} color={selectedOpt?.color ?? '#888'} />
                </View>
                <View>
                  <Text style={s.cowName}>{cow.name}</Text>
                  {cow.tag_id && (
                    <View style={s.tagRow}>
                      <MaterialCommunityIcons name="tag-outline" size={11} color="#555" />
                      <Text style={s.tagId}> {cow.tag_id}</Text>
                    </View>
                  )}
                </View>
              </View>
              {selectedOpt && (
                <View style={[s.statusPill, { borderColor: selectedOpt.color, backgroundColor: selectedOpt.color + '22' }]}>
                  <HealthIcon opt={selectedOpt} size={13} />
                  <Text style={[s.statusPillTxt, { color: selectedOpt.color }]}>
                    {isHealthy ? 'Healthy' : 'Attention'}
                  </Text>
                </View>
              )}
            </View>

            <View style={s.optionList}>
              {HEALTH_OPTIONS.map(opt => {
                const isSelected = d.status === opt.key;
                const isLoading  = d.loading === opt.key;
                return (
                  <TouchableOpacity
                    key={opt.key}
                    style={[s.optBtn,
                      { borderColor: isSelected ? opt.color : 'rgba(255,255,255,0.08)' },
                      isSelected && { backgroundColor: opt.color + '18' },
                    ]}
                    onPress={() => handleSelect(cow, opt.key)}
                    disabled={!!d.loading}
                    activeOpacity={0.75}
                  >
                    {isLoading
                      ? <ActivityIndicator size="small" color={opt.color} />
                      : <HealthIcon opt={opt} size={18} />
                    }
                    <Text style={[s.optLabel, { color: isSelected ? opt.color : '#aaa' }]}>{opt.label}</Text>
                    {isSelected && <Ionicons name="checkmark-circle" size={16} color={opt.color} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        );
      })}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  scroll:       { flex: 1, paddingHorizontal: 14, paddingTop: 8, backgroundColor: '#0f0f1a' },
  banner:       { backgroundColor: '#1a1a2e', borderRadius: 18, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingVertical: 18, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' },
  statItem:     { alignItems: 'center', gap: 4 },
  statNum:      { fontSize: 24, fontWeight: '900' },
  statLbl:      { fontSize: 11, color: '#555', fontWeight: '700' },
  statDivider:  { width: 1, height: 40, backgroundColor: 'rgba(255,255,255,0.07)' },
  dateBadge:    { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7, marginBottom: 14, alignSelf: 'flex-start' },
  dateText:     { fontSize: 12, color: '#666', fontWeight: '700' },
  card:         { backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', padding: 16, marginBottom: 14 },
  cardHealthy:  { borderColor: 'rgba(34,211,160,0.35)', backgroundColor: 'rgba(34,211,160,0.04)' },
  cardSick:     { borderColor: 'rgba(248,113,113,0.35)', backgroundColor: 'rgba(248,113,113,0.04)' },
  cardHeader:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  cowInfo:      { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cowAvatar:    { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  cowName:      { fontSize: 16, fontWeight: '900', color: '#fff' },
  tagRow:       { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  tagId:        { fontSize: 11, color: '#555' },
  statusPill:   { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  statusPillTxt:{ fontSize: 11, fontWeight: '800' },
  optionList:   { gap: 8 },
  optBtn:       { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 11, paddingHorizontal: 14, borderRadius: 13, borderWidth: 1.5, backgroundColor: 'rgba(255,255,255,0.02)' },
  optLabel:     { fontSize: 14, fontWeight: '700', flex: 1 },
});