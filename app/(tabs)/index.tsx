// index.tsx — GauSevak Main Dashboard
import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Modal, Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  MaterialCommunityIcons, Ionicons, FontAwesome5,
} from '@expo/vector-icons';
import { useAuth } from '../../context/auth-context';
import { theme } from '../../constants/theme';

import MilkScreen from './milk';
import FeedScreen from './feed';
// @ts-ignore
import HealthScreen from './health';

type QuickAction = 'milk' | 'feed' | 'health' | null;

interface Cow {
  id: string;
  name: string;
  tag_id?: string;
}

const COWS: Cow[] = [
  { id: 'cow_1', name: 'Cow 1', tag_id: 'T001' },
  { id: 'cow_2', name: 'Cow 2', tag_id: 'T002' },
  { id: 'cow_3', name: 'Cow 3', tag_id: 'T003' },
  { id: 'cow_4', name: 'Cow 4', tag_id: 'T004' },
  { id: 'cow_5', name: 'Cow 5', tag_id: 'T005' },
];

const ACTION_META = {
  milk: {
    label: 'Milk Entry',
    desc: 'Record cow milk yield — litre by litre',
    color: '#22d3a0',
    gradient: ['#22d3a0', '#059669'] as const,
    iconLib: 'MaterialCommunityIcons' as const,
    icon: 'water',
  },
  feed: {
    label: 'Feed Status',
    desc: 'Mark each cow\'s feeding as done',
    color: '#f5c842',
    gradient: ['#f5c842', '#ca8a04'] as const,
    iconLib: 'FontAwesome5' as const,
    icon: 'seedling',
  },
  health: {
    label: 'Health Check',
    desc: 'Log health condition for each cow',
    color: '#f87171',
    gradient: ['#f87171', '#dc2626'] as const,
    iconLib: 'MaterialCommunityIcons' as const,
    icon: 'heart-pulse',
  },
};

function ActionMetaIcon({
  meta, size = 22, color,
}: { meta: typeof ACTION_META[keyof typeof ACTION_META]; size?: number; color?: string }) {
  const c = color ?? meta.color;
  if (meta.iconLib === 'FontAwesome5') {
    return <FontAwesome5 name={meta.icon as any} size={size} color={c} />;
  }
  return <MaterialCommunityIcons name={meta.icon as any} size={size} color={c} />;
}

function ActionButton({
  actionKey, onPress, delay,
}: {
  actionKey: keyof typeof ACTION_META;
  onPress: () => void;
  delay: number;
}) {
  const meta = ACTION_META[actionKey];
  const scale      = useRef(new Animated.Value(0.85)).current;
  const opacity    = useRef(new Animated.Value(0)).current;
  const pressScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale,   { toValue: 1, delay, useNativeDriver: true, tension: 80, friction: 8 }),
      Animated.timing(opacity, { toValue: 1, delay, duration: 320, useNativeDriver: true }),
    ]).start();
  }, []);

  const onPressIn  = () => Animated.spring(pressScale, { toValue: 0.96, useNativeDriver: true }).start();
  const onPressOut = () => Animated.spring(pressScale, { toValue: 1,    useNativeDriver: true }).start();

  return (
    <Animated.View style={{ transform: [{ scale: Animated.multiply(scale, pressScale) }], opacity }}>
      <TouchableOpacity
        style={[ab.btn, { borderLeftColor: meta.color }]}
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={1}
      >
        <LinearGradient colors={[meta.color + '33', meta.color + '11']} style={ab.iconBox}>
          <ActionMetaIcon meta={meta} size={24} />
        </LinearGradient>
        <View style={ab.textBox}>
          <Text style={ab.label}>{meta.label}</Text>
          <Text style={ab.desc}>{meta.desc}</Text>
        </View>
        <LinearGradient colors={meta.gradient} style={ab.arrowBox}>
          <Ionicons name="chevron-forward" size={16} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

function DetailRow({
  iconName, iconLib = 'Ionicons', label, value,
}: {
  iconName: string;
  iconLib?: 'Ionicons' | 'MaterialCommunityIcons';
  label: string;
  value: string;
}) {
  const Icon = iconLib === 'MaterialCommunityIcons' ? MaterialCommunityIcons : Ionicons;
  return (
    <View style={pr.row}>
      <View style={pr.iconWrap}><Icon name={iconName as any} size={15} color="#555" /></View>
      <Text style={pr.label}>{label}</Text>
      <Text style={pr.value}>{value}</Text>
    </View>
  );
}

// ─── Full Screen Modal ────────────────────────────────────────────────────────
function FullScreenModal({
  action, onClose, token, onMilkTotal, onFedCount,
}: {
  action: QuickAction;
  onClose: () => void;
  token: string;
  onMilkTotal: (v: number) => void;
  onFedCount: (done: number, total: number) => void;
}) {
  if (!action) return null;
  const meta = ACTION_META[action];

  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <View style={ms.container}>
        <LinearGradient colors={['#141428', '#0f0f1e']} style={ms.header}>
          <View style={[ms.colorBar, { backgroundColor: meta.color }]} />
          <LinearGradient colors={meta.gradient} style={ms.headerIcon}>
            <ActionMetaIcon meta={meta} size={18} color="#fff" />
          </LinearGradient>
          <View style={{ flex: 1 }}>
            <Text style={ms.title}>{meta.label}</Text>
            <Text style={ms.sub}>{meta.desc}</Text>
          </View>
          <TouchableOpacity style={ms.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={18} color="#fff" />
          </TouchableOpacity>
        </LinearGradient>

        <View style={ms.content}>
          {action === 'milk' && (
            <MilkScreen token={token} onTotalChange={onMilkTotal} />
          )}
          {action === 'feed' && (
            <FeedScreen token={token} cows={COWS} onFedCountChange={onFedCount} />
          )}
          {action === 'health' && (
            <HealthScreen />
          )}
        </View>
      </View>
    </Modal>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function DashboardScreen() {
  const { user, logout, token } = useAuth();
  const router = useRouter();
  const [activeAction, setActiveAction] = useState<QuickAction>(null);

  // ✅ Live stats from sub-screens
  const [milkTotal, setMilkTotal] = useState(0);
  const [fedDone, setFedDone]     = useState(0);
  const [fedTotal, setFedTotal]   = useState(COWS.length);

  const headerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(headerAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  const initial = user?.name?.charAt(0)?.toUpperCase() ?? 'A';
  const fedPct  = fedTotal > 0 ? Math.round((fedDone / fedTotal) * 100) : 0;

  return (
    <ScrollView style={s.container} showsVerticalScrollIndicator={false}>

      {/* ── Profile Card ── */}
      <Animated.View style={{ opacity: headerAnim }}>
        <LinearGradient colors={['#1a1a35', '#141428']} style={s.profileCard}>
          <View style={s.avatarRow}>
            <LinearGradient colors={[theme.accent, '#059669']} style={s.avatar}>
              <Text style={s.avatarText}>{initial}</Text>
            </LinearGradient>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={s.adminName}>{user?.name ?? 'Admin'}</Text>
              <View style={s.roleBadge}>
                <MaterialCommunityIcons name="shield-account" size={12} color={theme.accent} />
                <Text style={s.adminRole}> {user?.role?.toUpperCase()}</Text>
              </View>
            </View>
            <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={15} color="#f87171" />
              <Text style={s.logoutText}> Logout</Text>
            </TouchableOpacity>
          </View>

          <View style={s.divider} />

          <View style={s.detailBox}>
            <DetailRow iconName="mail-outline"             label="Email"  value={user?.email ?? '-'} />
            <DetailRow iconName="call-outline"             label="Phone"  value={user?.phone ?? 'Not set'} />
            <DetailRow iconName="checkmark-circle-outline" label="Status" value={user?.is_active ? 'Active' : 'Inactive'} />
            <DetailRow iconName="location-outline"         label="Zone"   value={user?.zone ?? 'N/A'} />
          </View>
        </LinearGradient>
      </Animated.View>

      {/* ── Stats Strip — live values ── */}
      <View style={s.statsRow}>
        {[
          {
            icon: 'cow', label: 'Cows',
            value: `${COWS.length}`,
            color: '#22d3a0', lib: 'MaterialCommunityIcons',
          },
          {
            icon: 'water', label: 'Milk Today',
            // ✅ Live milk total
            value: milkTotal > 0
              ? `${Number.isInteger(milkTotal) ? milkTotal : milkTotal.toFixed(1)} L`
              : '-- L',
            color: '#60a5fa', lib: 'MaterialCommunityIcons',
          },
          {
            icon: 'seedling', label: 'Fed',
            // ✅ Live feed percentage
            value: `${fedPct}%`,
            color: '#f5c842', lib: 'FontAwesome5',
          },
        ].map(stat => (
          <LinearGradient
            key={stat.label}
            colors={['rgba(255,255,255,0.04)', 'rgba(255,255,255,0.02)']}
            style={s.statCard}
          >
            {stat.lib === 'FontAwesome5'
              ? <FontAwesome5 name={stat.icon as any} size={18} color={stat.color} />
              : <MaterialCommunityIcons name={stat.icon as any} size={20} color={stat.color} />
            }
            <Text style={[s.statValue, { color: stat.color }]}>{stat.value}</Text>
            <Text style={s.statLabel}>{stat.label}</Text>
          </LinearGradient>
        ))}
      </View>

      {/* ── Quick Entry ── */}
      <View style={s.section}>
        <View style={s.sectionHeader}>
          <MaterialCommunityIcons name="lightning-bolt" size={15} color={theme.accent} />
          <Text style={s.sectionLabel}> Quick Entry</Text>
        </View>
        <ActionButton actionKey="milk"   delay={0}   onPress={() => setActiveAction('milk')} />
        <ActionButton actionKey="feed"   delay={80}  onPress={() => setActiveAction('feed')} />
        <ActionButton actionKey="health" delay={160} onPress={() => setActiveAction('health')} />
      </View>

      <View style={{ height: 40 }} />

      {/* ── Modal ── */}
      <FullScreenModal
        action={activeAction}
        token={token ?? ''}
        onClose={() => setActiveAction(null)}
        onMilkTotal={setMilkTotal}
        onFedCount={(done, total) => { setFedDone(done); setFedTotal(total); }}
      />
    </ScrollView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const ab = StyleSheet.create({
  btn:     { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', borderLeftWidth: 4, paddingVertical: 16, paddingHorizontal: 14, marginBottom: 12, gap: 14 },
  iconBox: { width: 52, height: 52, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  textBox: { flex: 1 },
  label:   { fontSize: 16, fontWeight: '900', color: '#fff', marginBottom: 3 },
  desc:    { fontSize: 12, color: '#666' },
  arrowBox:{ width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
});

const pr = StyleSheet.create({
  row:     { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 4, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)' },
  iconWrap:{ width: 28, alignItems: 'center' },
  label:   { fontSize: 13, color: '#555', width: 58, fontWeight: '600' },
  value:   { fontSize: 13, fontWeight: '700', color: '#ccc', flex: 1, textAlign: 'right' },
});

const ms = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f1a' },
  header:    { flexDirection: 'row', alignItems: 'center', paddingTop: 56, paddingBottom: 18, paddingHorizontal: 16, gap: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  colorBar:  { width: 3, height: 38, borderRadius: 4 },
  headerIcon:{ width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  title:     { fontSize: 19, fontWeight: '900', color: '#fff' },
  sub:       { fontSize: 12, color: '#666', marginTop: 2 },
  closeBtn:  { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },
  content:   { flex: 1 },
});

const s = StyleSheet.create({
  container:   { flex: 1, backgroundColor: theme.bg },
  profileCard: { margin: 16, borderRadius: 22, padding: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' },
  avatarRow:   { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  avatar:      { width: 56, height: 56, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  avatarText:  { fontSize: 22, fontWeight: '900', color: '#000' },
  adminName:   { fontSize: 18, fontWeight: '900', color: '#fff' },
  roleBadge:   { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  adminRole:   { fontSize: 12, color: theme.accent, fontWeight: '700' },
  logoutBtn:   { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(248,113,113,0.12)', borderWidth: 1, borderColor: 'rgba(248,113,113,0.3)', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  logoutText:  { color: '#f87171', fontWeight: '700', fontSize: 13 },
  divider:     { height: 1, backgroundColor: 'rgba(255,255,255,0.05)', marginBottom: 14 },
  detailBox:   {},
  statsRow:    { flexDirection: 'row', gap: 10, paddingHorizontal: 16, marginBottom: 8 },
  statCard:    { flex: 1, borderRadius: 16, padding: 14, alignItems: 'center', gap: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  statValue:   { fontSize: 17, fontWeight: '900' },
  statLabel:   { fontSize: 10, color: '#555', fontWeight: '700', textAlign: 'center' },
  section:     { paddingHorizontal: 16, paddingTop: 8 },
  sectionHeader:{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  sectionLabel: { fontSize: 11, color: '#555', fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.5 },
});