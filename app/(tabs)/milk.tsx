// milk.tsx — Milk Entry Screen
import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, TextInput, Animated,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/auth-context';
import { apiAddMilkYield } from '../../services/api';

const COWS = [
  { id: 'cow_1', name: 'Cow 1', tag_id: 'T001' },
  { id: 'cow_2', name: 'Cow 2', tag_id: 'T002' },
  { id: 'cow_3', name: 'Cow 3', tag_id: 'T003' },
  { id: 'cow_4', name: 'Cow 4', tag_id: 'T004' },
  { id: 'cow_5', name: 'Cow 5', tag_id: 'T005' },
];

function todayStr() { return new Date().toISOString().split('T')[0]; }
function getShift() {
  return new Date().getHours() < 12
    ? { label: 'Morning Shift', session: 'morning' as const }
    : { label: 'Evening Shift', session: 'evening' as const };
}

// ─── Add Button: Red pulsing → Green checkmark after save ────────────────────
function AddButton({ loading, saved, onPress }: {
  loading: boolean; saved: boolean; onPress: () => void;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (saved) {
      Animated.sequence([
        Animated.spring(scaleAnim, { toValue: 1.12, useNativeDriver: true, tension: 200, friction: 5 }),
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 100, friction: 6 }),
      ]).start();
    }
  }, [saved]);

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[s.addBtn, saved ? s.addBtnGreen : s.addBtnRed]}
        onPress={onPress}
        disabled={loading || saved}
        activeOpacity={0.85}
      >
        {loading ? (
          <ActivityIndicator size="small" color={saved ? '#22d3a0' : '#ff6b6b'} />
        ) : (
          <View style={s.addBtnInner}>
            <Ionicons
              name={saved ? 'checkmark-circle' : 'add-circle-outline'}
              size={16}
              color={saved ? '#22d3a0' : '#ff6b6b'}
            />
            <Text style={[s.addBtnTxt, { color: saved ? '#22d3a0' : '#ff6b6b' }]}>
              {saved ? 'Added' : 'Add'}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Quantity tap-to-type ─────────────────────────────────────────────────────
function QtyDisplay({ qty, onQtyChange, loading }: {
  qty: number; onQtyChange: (v: number) => void; loading: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [raw, setRaw] = useState('');
  const inputRef = useRef<TextInput>(null);

  const startEdit = () => {
    if (loading) return;
    setRaw(qty === 0 ? '' : String(qty));
    setEditing(true);
    setTimeout(() => inputRef.current?.focus(), 60);
  };

  const commit = () => {
    const num = parseFloat(raw);
    if (!isNaN(num) && num >= 0) onQtyChange(Math.round(num * 10) / 10);
    setEditing(false);
  };

  return (
    <TouchableOpacity style={s.qtyDisplay} onPress={startEdit} activeOpacity={0.7}>
      {editing ? (
        <TextInput
          ref={inputRef}
          style={s.qtyInput}
          value={raw}
          onChangeText={setRaw}
          onBlur={commit}
          onSubmitEditing={commit}
          keyboardType="decimal-pad"
          maxLength={5}
          selectTextOnFocus
        />
      ) : (
        <Text style={s.qtyNum}>{qty}</Text>
      )}
      <Text style={s.qtyUnit}>{editing ? '✓ confirm' : 'L · tap to type'}</Text>
    </TouchableOpacity>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function MilkScreen({ onTotalChange }: {
  token?: string;
  cows?: any[];
  onTotalChange?: (total: number) => void;
}) {
  const { token } = useAuth();
  const shift = getShift();
  const [cowData, setCowData] = useState<Record<string, {
    qty: number; saved: boolean; total: number; loading: boolean;
  }>>({});

  const get = (id: string) => cowData[id] ?? { qty: 0, saved: false, total: 0, loading: false };
  const set = (id: string, patch: Partial<ReturnType<typeof get>>) =>
    setCowData(prev => ({ ...prev, [id]: { ...get(id), ...patch } }));

  const totalMilk = COWS.reduce((sum, c) => {
    const d = get(c.id);
    return sum + d.total + (d.saved ? 0 : d.qty);
  }, 0);

  useEffect(() => { onTotalChange?.(totalMilk); }, [totalMilk]);

  const handleAdd = async (cow: typeof COWS[0]) => {
    const d = get(cow.id);
    if (d.qty === 0 || d.loading || !token) return;
    set(cow.id, { loading: true });
    try {
      await apiAddMilkYield(token, {
        location: cow.name,
        date: todayStr(),
        morning: shift.session === 'morning' ? d.qty : 0,
        evening: shift.session === 'evening' ? d.qty : 0,
        notes: `Quick entry — ${cow.name}`,
      });
      set(cow.id, { saved: true, total: d.total + d.qty, qty: 0, loading: false });
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'Could not save');
      set(cow.id, { loading: false });
    }
  };

  const doneCount = COWS.filter(c => get(c.id).saved).length;
  const isMorning = shift.session === 'morning';

  return (
    <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
      {/* Banner */}
      <View style={s.banner}>
        <View style={s.bannerLeft}>
          <View style={[s.shiftIcon, {
            backgroundColor: isMorning ? 'rgba(245,200,66,0.15)' : 'rgba(96,165,250,0.15)',
          }]}>
            <Ionicons name={isMorning ? 'sunny' : 'moon'} size={20} color={isMorning ? '#f5c842' : '#60a5fa'} />
          </View>
          <View>
            <Text style={s.shiftLabel}>{shift.label}</Text>
            <Text style={s.shiftDate}>{todayStr()}</Text>
          </View>
        </View>
        <View style={s.bannerRight}>
          <Text style={s.totalMilk}>
            {Number.isInteger(totalMilk) ? totalMilk : totalMilk.toFixed(1)}{' '}
            <Text style={s.totalUnit}>L</Text>
          </Text>
          <Text style={s.totalLbl}>Total Today</Text>
        </View>
      </View>

      {/* Progress */}
      <View style={s.progressRow}>
        <Text style={s.progressTxt}>{doneCount}/{COWS.length} cows logged</Text>
        <Text style={s.progressPct}>{Math.round((doneCount / COWS.length) * 100)}%</Text>
      </View>
      <View style={s.progressBg}>
        <View style={[s.progressFill, { width: `${(doneCount / COWS.length) * 100}%` as any }]} />
      </View>

      {/* Cow Cards */}
      {COWS.map(cow => {
        const d = get(cow.id);
        return (
          <View key={cow.id} style={[s.card, d.saved && s.cardDone]}>
            <View style={s.cardHeader}>
              <View style={s.cowRow}>
                <View style={[s.cowAvatar, {
                  backgroundColor: d.saved ? 'rgba(34,211,160,0.2)' : 'rgba(255,255,255,0.06)',
                }]}>
                  <MaterialCommunityIcons name="cow" size={22} color={d.saved ? '#22d3a0' : '#888'} />
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
              {d.total > 0 && (
                <View style={s.totalBadge}>
                  <MaterialCommunityIcons name="water" size={13} color="#22d3a0" />
                  <Text style={s.totalBadgeTxt}>{d.total} L</Text>
                </View>
              )}
            </View>

            <View style={s.controls}>
              <TouchableOpacity
                style={s.qtyBtn}
                onPress={() => set(cow.id, { qty: Math.max(0, Math.round((d.qty - 1) * 10) / 10), saved: false })}
                disabled={d.loading || d.saved}
              >
                <Ionicons name="remove" size={22} color={d.saved ? '#333' : '#fff'} />
              </TouchableOpacity>

              <QtyDisplay
                qty={d.qty}
                loading={d.loading}
                onQtyChange={v => set(cow.id, { qty: v, saved: false })}
              />

              <TouchableOpacity
                style={s.qtyBtn}
                onPress={() => set(cow.id, { qty: Math.round((d.qty + 1) * 10) / 10, saved: false })}
                disabled={d.loading || d.saved}
              >
                <Ionicons name="add" size={22} color={d.saved ? '#333' : '#fff'} />
              </TouchableOpacity>

              <AddButton
                loading={d.loading}
                saved={d.saved}
                onPress={() => handleAdd(cow)}
              />
            </View>
          </View>
        );
      })}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  scroll:        { flex: 1, paddingHorizontal: 14, paddingTop: 8, backgroundColor: '#0f0f1a' },
  banner:        { backgroundColor: '#0d2137', borderRadius: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 18, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(34,211,160,0.15)' },
  bannerLeft:    { flexDirection: 'row', alignItems: 'center', gap: 12 },
  shiftIcon:     { width: 44, height: 44, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  shiftLabel:    { fontSize: 14, fontWeight: '900', color: '#fff' },
  shiftDate:     { fontSize: 11, color: '#a8f0d8', marginTop: 2, fontWeight: '700' },
  bannerRight:   { alignItems: 'flex-end' },
  totalMilk:     { fontSize: 32, fontWeight: '900', color: '#22d3a0', lineHeight: 36 },
  totalUnit:     { fontSize: 18, fontWeight: '700' },
  totalLbl:      { fontSize: 11, color: '#1aca87', marginTop: 2 },
  progressRow:   { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  progressTxt:   { fontSize: 12, color: '#666', fontWeight: '700' },
  progressPct:   { fontSize: 12, color: '#22d3a0', fontWeight: '800' },
  progressBg:    { height: 5, backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 4, marginBottom: 14 },
  progressFill:  { height: 5, borderRadius: 4, backgroundColor: '#22d3a0' },
  card:          { backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', padding: 16, marginBottom: 12 },
  cardDone:      { borderColor: 'rgba(34,211,160,0.3)', backgroundColor: 'rgba(34,211,160,0.04)' },
  cardHeader:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  cowRow:        { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cowAvatar:     { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  cowName:       { fontSize: 16, fontWeight: '900', color: '#fff' },
  tagRow:        { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  tagId:         { fontSize: 11, color: '#e9dfdf' },
  totalBadge:    { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, backgroundColor: 'rgba(34,211,160,0.1)', borderWidth: 1, borderColor: 'rgba(34,211,160,0.3)' },
  totalBadgeTxt: { fontSize: 13, fontWeight: '800', color: '#22d3a0' },
  controls:      { flexDirection: 'row', alignItems: 'center', gap: 10 },
  qtyBtn:        { width: 44, height: 44, borderRadius: 13, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },
  qtyDisplay:    { flex: 1, alignItems: 'center' },
  qtyNum:        { fontSize: 26, fontWeight: '900', color: '#fff' },
  qtyInput:      { fontSize: 24, fontWeight: '900', color: '#22d3a0', textAlign: 'center', borderBottomWidth: 2, borderBottomColor: '#22d3a0', minWidth: 60, paddingBottom: 2 },
  qtyUnit:       { fontSize: 10, color: '#666', fontWeight: '700', marginTop: 3 },
  // Glow ring shared
  glowRing:      { position: 'absolute', top: -6, left: -6, right: -6, bottom: -6, borderRadius: 20, borderWidth: 2, zIndex: -1 },
  // Add button base
  addBtn:        { borderWidth: 1.5, borderRadius: 13, paddingHorizontal: 14, paddingVertical: 10, minWidth: 90, alignItems: 'center', justifyContent: 'center' },
  // Red state — not saved
 addBtnRed: {
  backgroundColor: 'rgba(255,50,50,0.15)',
  borderColor: '#ff4444',
},
  // Green state — saved
  addBtnGreen: {
  backgroundColor: 'rgba(34,211,160,0.2)',
  borderColor: '#22d3a0',
},
  addBtnInner:   { flexDirection: 'row', alignItems: 'center', gap: 5 },
  addBtnTxt:     { fontWeight: '800', fontSize: 13 },
});