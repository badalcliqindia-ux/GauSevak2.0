// index.tsx — GauSevak Worker Dashboard (White UI)
import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Modal, Animated, StatusBar,
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
    desc: 'Record cow milk yield',
    color: '#16a34a',
    gradient: ['#16a34a', '#15803d'] as const,
    bg: '#f0fdf4',
    iconLib: 'MaterialCommunityIcons' as const,
    icon: 'water',
    emoji: '🥛',
  },
  feed: {
    label: 'Feed Status',
    desc: "Mark each cow's feeding",
    color: '#d97706',
    gradient: ['#f59e0b', '#d97706'] as const,
    bg: '#fffbeb',
    iconLib: 'FontAwesome5' as const,
    icon: 'seedling',
    emoji: '🌾',
  },
  health: {
    label: 'Health Check',
    desc: 'Log health condition',
    color: '#dc2626',
    gradient: ['#ef4444', '#dc2626'] as const,
    bg: '#fef2f2',
    iconLib: 'MaterialCommunityIcons' as const,
    icon: 'heart-pulse',
    emoji: '❤️',
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

// ─── Big Action Button ────────────────────────────────────────────────────────
function BigActionButton({
  actionKey, onPress, delay,
}: {
  actionKey: keyof typeof ACTION_META;
  onPress: () => void;
  delay: number;
}) {
  const meta       = ACTION_META[actionKey];
  const translateY = useRef(new Animated.Value(40)).current;
  const opacity    = useRef(new Animated.Value(0)).current;
  const pressScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateY, { toValue: 0, delay, useNativeDriver: true, tension: 70, friction: 9 }),
      Animated.timing(opacity,    { toValue: 1, delay, duration: 350, useNativeDriver: true }),
    ]).start();
  }, []);

  const onPressIn  = () => Animated.spring(pressScale, { toValue: 0.97, useNativeDriver: true }).start();
  const onPressOut = () => Animated.spring(pressScale, { toValue: 1,    useNativeDriver: true }).start();

  return (
    <Animated.View style={{ transform: [{ translateY }, { scale: pressScale }], opacity, marginBottom: 16 }}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={1}
      >
        <View style={[bb.card, { backgroundColor: meta.bg, borderColor: meta.color + '30' }]}>
          {/* Left color bar */}
          <View style={[bb.colorBar, { backgroundColor: meta.color }]} />

          {/* Icon circle */}
          <LinearGradient colors={meta.gradient} style={bb.iconCircle}>
            <Text style={{ fontSize: 28 }}>{meta.emoji}</Text>
          </LinearGradient>

          {/* Text */}
          <View style={bb.textWrap}>
            <Text style={[bb.label, { color: '#1a1a1a' }]}>{meta.label}</Text>
            <Text style={bb.desc}>{meta.desc}</Text>
          </View>

          {/* Arrow */}
          <View style={[bb.arrowWrap, { backgroundColor: meta.color + '15' }]}>
            <Ionicons name="chevron-forward" size={20} color={meta.color} />
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
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
        <View style={[ms.header, { borderBottomColor: meta.color + '20' }]}>
          <View style={[ms.colorBar, { backgroundColor: meta.color }]} />
          <LinearGradient colors={meta.gradient} style={ms.headerIcon}>
            <Text style={{ fontSize: 18 }}>{meta.emoji}</Text>
          </LinearGradient>
          <View style={{ flex: 1 }}>
            <Text style={ms.title}>{meta.label}</Text>
            <Text style={ms.sub}>{meta.desc}</Text>
          </View>
          <TouchableOpacity style={[ms.closeBtn, { backgroundColor: '#f3f4f6' }]} onPress={onClose}>
            <Ionicons name="close" size={18} color="#374151" />
          </TouchableOpacity>
        </View>
        <View style={ms.content}>
          {action === 'milk'   && <MilkScreen token={token} onTotalChange={onMilkTotal} />}
          {action === 'feed'   && <FeedScreen token={token} cows={COWS} onFedCountChange={onFedCount} />}
          {action === 'health' && <HealthScreen />}
        </View>
      </View>
    </Modal>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function DashboardScreen() {
  const { worker, workerLogout } = useAuth();
  const router = useRouter();
  const [activeAction, setActiveAction] = useState<QuickAction>(null);

  const [milkTotal, setMilkTotal] = useState(0);
  const [fedDone,   setFedDone]   = useState(0);
  const [fedTotal,  setFedTotal]  = useState(COWS.length);

  const headerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(headerAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  const handleLogout = async () => {
    await workerLogout();
    router.replace('/(auth)/login');
  };

  const firstName  = worker?.name?.split(' ')[0] ?? 'Worker';
  const initial    = worker?.name?.charAt(0)?.toUpperCase() ?? 'W';
  const fedPct     = fedTotal > 0 ? Math.round((fedDone / fedTotal) * 100) : 0;
  const todayDate  = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' });

  return (
    <ScrollView
      style={s.container}
      contentContainerStyle={s.content}
      showsVerticalScrollIndicator={false}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* ── Top Bar ── */}
      <Animated.View style={[s.topBar, { opacity: headerAnim }]}>
        <View>
          <Text style={s.greeting}>Good morning 👋</Text>
          <Text style={s.workerName}>{firstName}</Text>
          {worker?.farm_name ? (
            <Text style={s.farmName}>🏡 {worker.farm_name}</Text>
          ) : null}
        </View>

        <View style={s.topRight}>
          <LinearGradient colors={['#16a34a', '#15803d']} style={s.avatar}>
            <Text style={s.avatarText}>{initial}</Text>
          </LinearGradient>
          <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={16} color="#dc2626" />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* ── Date Strip ── */}
      <View style={s.dateStrip}>
        <Ionicons name="calendar-outline" size={13} color="#6b7280" />
        <Text style={s.dateText}> {todayDate}</Text>
      </View>

      {/* ── Stats Row ── */}
      <View style={s.statsRow}>
        <View style={[s.statCard, { borderColor: '#16a34a30', backgroundColor: '#f0fdf4' }]}>
          <Text style={[s.statValue, { color: '#16a34a' }]}>
            {milkTotal > 0 ? `${Number.isInteger(milkTotal) ? milkTotal : milkTotal.toFixed(1)}L` : '--'}
          </Text>
          <Text style={s.statLabel}>Milk Today</Text>
        </View>

        <View style={[s.statCard, { borderColor: '#d9770630', backgroundColor: '#fffbeb' }]}>
          <Text style={[s.statValue, { color: '#d97706' }]}>{fedPct}%</Text>
          <Text style={s.statLabel}>Fed</Text>
        </View>

        <View style={[s.statCard, { borderColor: '#3b82f630', backgroundColor: '#eff6ff' }]}>
          <Text style={[s.statValue, { color: '#3b82f6' }]}>{COWS.length}</Text>
          <Text style={s.statLabel}>Cows</Text>
        </View>
      </View>

      {/* ── Section Label ── */}
      <Text style={s.sectionLabel}>Quick Entry</Text>

      {/* ── Three Big Buttons ── */}
      <BigActionButton actionKey="milk"   delay={0}   onPress={() => setActiveAction('milk')} />
      <BigActionButton actionKey="feed"   delay={80}  onPress={() => setActiveAction('feed')} />
      <BigActionButton actionKey="health" delay={160} onPress={() => setActiveAction('health')} />

      <View style={{ height: 40 }} />

      {/* ── Modal ── */}
      <FullScreenModal
        action={activeAction}
        token={''}
        onClose={() => setActiveAction(null)}
        onMilkTotal={setMilkTotal}
        onFedCount={(done, total) => { setFedDone(done); setFedTotal(total); }}
      />
    </ScrollView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const bb = StyleSheet.create({
  card:      { flexDirection: 'row', alignItems: 'center', borderRadius: 20, borderWidth: 1.5, paddingVertical: 20, paddingHorizontal: 16, gap: 14, overflow: 'hidden' },
  colorBar:  { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, borderTopLeftRadius: 20, borderBottomLeftRadius: 20 },
  iconCircle:{ width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  textWrap:  { flex: 1 },
  label:     { fontSize: 18, fontWeight: '800', marginBottom: 4 },
  desc:      { fontSize: 13, color: '#6b7280' },
  arrowWrap: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});

const ms = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  header:    { flexDirection: 'row', alignItems: 'center', paddingTop: 56, paddingBottom: 18, paddingHorizontal: 16, gap: 12, borderBottomWidth: 1, backgroundColor: '#fff' },
  colorBar:  { width: 3, height: 38, borderRadius: 4 },
  headerIcon:{ width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  title:     { fontSize: 18, fontWeight: '800', color: '#111827' },
  sub:       { fontSize: 12, color: '#6b7280', marginTop: 2 },
  closeBtn:  { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  content:   { flex: 1 },
});

const s = StyleSheet.create({
  container:  { flex: 1, backgroundColor: '#ffffff' },
  content:    { paddingHorizontal: 20, paddingBottom: 20 },
  topBar:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingTop: 60, paddingBottom: 8 },
  greeting:   { fontSize: 14, color: '#6b7280', fontWeight: '500' },
  workerName: { fontSize: 28, fontWeight: '900', color: '#111827', marginTop: 2 },
  farmName:   { fontSize: 13, color: '#6b7280', marginTop: 3 },
  topRight:   { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 },
  avatar:     { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 18, fontWeight: '900', color: '#fff' },
  logoutBtn:  { width: 38, height: 38, borderRadius: 12, backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca', alignItems: 'center', justifyContent: 'center' },
  dateStrip:  { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  dateText:   { fontSize: 13, color: '#6b7280', fontWeight: '500' },
  statsRow:   { flexDirection: 'row', gap: 10, marginBottom: 28 },
  statCard:   { flex: 1, borderRadius: 16, borderWidth: 1.5, paddingVertical: 14, alignItems: 'center', gap: 4 },
  statValue:  { fontSize: 20, fontWeight: '900' },
  statLabel:  { fontSize: 10, color: '#9ca3af', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  sectionLabel:{ fontSize: 12, fontWeight: '800', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 16 },
});