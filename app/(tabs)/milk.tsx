import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TextInput,
  RefreshControl,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../../context/auth-context";
import {
  apiWorkerGetCows,
  apiWorkerAddMilk,
  apiWorkerGetTodayMilk,
  apiWorkerGetShiftStatus,
  ShiftStatus,
  MilkEntry,
} from "../../services/api";

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

function getCurrentShift(): "morning" | "evening" {
  return new Date().getHours() < 12 ? "morning" : "evening";
}

interface Cow {
  id: string;
  name: string;
  tag: string;
  breed?: string;
  isActive?: boolean;
  isSold?: boolean;
}

function QtyInput({
  qty,
  onChange,
  disabled,
}: {
  qty: number;
  onChange: (v: number) => void;
  disabled: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [raw, setRaw] = useState("");
  const ref = useRef<TextInput>(null);

  const startEdit = () => {
    if (disabled) return;
    setRaw(qty === 0 ? "" : String(qty));
    setEditing(true);
    setTimeout(() => ref.current?.focus(), 60);
  };

  const commit = () => {
    const n = parseFloat(raw);
    if (!isNaN(n) && n >= 0) onChange(Math.round(n * 10) / 10);
    setEditing(false);
  };

  return (
    <TouchableOpacity style={s.qtyWrap} onPress={startEdit} activeOpacity={0.8}>
      {editing ? (
        <TextInput
          ref={ref}
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
        <Text style={[s.qtyNum, disabled && { color: "#9ca3af" }]}>{qty}</Text>
      )}
      <Text style={s.qtyHint}>{editing ? "tap ✓" : "L"}</Text>
    </TouchableOpacity>
  );
}

export default function MilkScreen({
  onTotalChange,
}: {
  token?: string;
  cows?: any[];
  onTotalChange?: (total: number) => void;
}) {
  const { workerToken } = useAuth();
  const token = workerToken ?? "";
  const shift = getCurrentShift();
  const isMorning = shift === "morning";

  const [cows, setCows] = useState<Cow[]>([]);
  const [shiftStatus, setShiftStatus] = useState<ShiftStatus | null>(null);
  const [todayEntries, setTodayEntries] = useState<MilkEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // per-cow entry state
  const [cowData, setCowData] = useState<
    Record<
      string,
      {
        qty: number;
        saving: boolean;
        saved: boolean;
        savedShift?: string;
      }
    >
  >({});

  const get = (id: string) =>
    cowData[id] ?? { qty: 0, saving: false, saved: false };
  const patch = (id: string, p: Partial<ReturnType<typeof get>>) =>
    setCowData((prev) => ({ ...prev, [id]: { ...get(id), ...p } }));

  const fetchAll = useCallback(async () => {
    try {
      const [cowsData, status, entries] = await Promise.all([
        apiWorkerGetCows(token),
        apiWorkerGetShiftStatus(token),
        apiWorkerGetTodayMilk(token),
      ]);
      const activeCows = cowsData.filter(
        (c: Cow) => c.isActive !== false && !c.isSold,
      );
      setCows(activeCows);
      setShiftStatus(status);
      setTodayEntries(entries);

      const savedIds = new Set(
        entries.filter((e) => e.shift === shift).map((e) => e.cow_id),
      );
      setCowData(() => {
        const next: Record<
          string,
          { qty: number; saving: boolean; saved: boolean; savedShift?: string }
        > = {};
        activeCows.forEach((c: Cow) => {
          next[c.id] = savedIds.has(c.id)
            ? { qty: 0, saving: false, saved: true, savedShift: shift }
            : { qty: 0, saving: false, saved: false };
        });
        return next;
      });
    } catch (e) {
      console.log("fetch error:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token, shift]);

  useEffect(() => {
    fetchAll();
  }, []);

  const shiftEntries = todayEntries.filter((e) => e.shift === shift);
  const savedTotal = shiftEntries.reduce((s, e) => s + e.quantity, 0);
  const pendingTotal = cows.reduce((s, c) => {
    const d = get(c.id);
    return s + (d.saved ? 0 : d.qty);
  }, 0);
  const totalMilk = savedTotal + pendingTotal;

  useEffect(() => {
    onTotalChange?.(totalMilk);
  }, [totalMilk]);

  const doneCount = cows.filter((c) => get(c.id).saved).length;

  const handleSave = async (cow: Cow) => {
    const d = get(cow.id);
    if (d.qty === 0 || d.saving || !token) return;
    patch(cow.id, { saving: true });
    try {
      const entry = await apiWorkerAddMilk(token, {
        cow_id: cow.id,
        cow_name: cow.name,
        cow_tag: cow.tag,
        quantity: d.qty,
        shift,
        date: todayStr(),
      });
      setTodayEntries((prev) => [...prev, entry]);
      patch(cow.id, { saved: true, qty: 0, saving: false, savedShift: shift });
    } catch (err: any) {
      Alert.alert("Error", err?.message ?? "Could not save entry");
      patch(cow.id, { saving: false });
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchAll();
  };

  const accentColor = isMorning ? "#d97706" : "#4f46e5";
  const accentBg = isMorning ? "#fffbeb" : "#eef2ff";
  const accentLight = isMorning ? "#fef3c7" : "#e0e7ff";

  if (loading) {
    return (
      <View style={s.centered}>
        <ActivityIndicator size="large" color="#16a34a" />
        <Text style={s.loadingText}>Loading cows...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={s.container}
      contentContainerStyle={s.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#16a34a"
        />
      }
    >
      {/* ── Shift Banner ── */}
      <LinearGradient
        colors={isMorning ? ["#fffbeb", "#fef3c7"] : ["#eef2ff", "#e0e7ff"]}
        style={[
          s.shiftBanner,
          { borderColor: isMorning ? "#f59e0b40" : "#6366f140" },
        ]}
      >
        <View style={s.shiftLeft}>
          <View style={[s.shiftIconBox, { backgroundColor: accentLight }]}>
            <Ionicons
              name={isMorning ? "sunny" : "moon"}
              size={22}
              color={accentColor}
            />
          </View>
          <View>
            <Text style={[s.shiftTitle, { color: accentColor }]}>
              {isMorning ? "Morning Shift" : "Evening Shift"}
            </Text>
            <Text style={s.shiftDate}>{todayStr()}</Text>
          </View>
        </View>
        <View style={s.shiftRight}>
          <Text style={[s.totalNum, { color: accentColor }]}>
            {totalMilk.toFixed(1)}
            <Text style={s.totalUnit}> L</Text>
          </Text>
          <Text style={s.totalLbl}>Today Total</Text>
        </View>
      </LinearGradient>

      {/* ── Both shifts status strip ── */}
      {shiftStatus && (
        <View style={s.statusStrip}>
          <View
            style={[
              s.statusChip,
              {
                backgroundColor: shiftStatus.morning_done
                  ? "#f0fdf4"
                  : "#f9fafb",
                borderColor: shiftStatus.morning_done ? "#16a34a40" : "#e5e7eb",
              },
            ]}
          >
            <Ionicons
              name={
                shiftStatus.morning_done
                  ? "checkmark-circle"
                  : "ellipse-outline"
              }
              size={14}
              color={shiftStatus.morning_done ? "#16a34a" : "#9ca3af"}
            />
            <Text
              style={[
                s.statusText,
                { color: shiftStatus.morning_done ? "#16a34a" : "#9ca3af" },
              ]}
            >
              Morning{" "}
              {shiftStatus.morning_done
                ? `✓ ${shiftStatus.morning_count}`
                : "—"}
            </Text>
          </View>
          <View
            style={[
              s.statusChip,
              {
                backgroundColor: shiftStatus.evening_done
                  ? "#eef2ff"
                  : "#f9fafb",
                borderColor: shiftStatus.evening_done ? "#6366f140" : "#e5e7eb",
              },
            ]}
          >
            <Ionicons
              name={
                shiftStatus.evening_done
                  ? "checkmark-circle"
                  : "ellipse-outline"
              }
              size={14}
              color={shiftStatus.evening_done ? "#6366f1" : "#9ca3af"}
            />
            <Text
              style={[
                s.statusText,
                { color: shiftStatus.evening_done ? "#6366f1" : "#9ca3af" },
              ]}
            >
              Evening{" "}
              {shiftStatus.evening_done
                ? `✓ ${shiftStatus.evening_count}`
                : "—"}
            </Text>
          </View>
        </View>
      )}

      {/* ── Progress bar ── */}
      <View style={s.progressRow}>
        <Text style={s.progressTxt}>
          {doneCount}/{cows.length} cows logged
        </Text>
        <Text style={s.progressPct}>
          {cows.length > 0 ? Math.round((doneCount / cows.length) * 100) : 0}%
        </Text>
      </View>
      <View style={s.progressBg}>
        <View
          style={[
            s.progressFill,
            {
              width:
                `${cows.length > 0 ? (doneCount / cows.length) * 100 : 0}%` as any,
              backgroundColor: accentColor,
            },
          ]}
        />
      </View>

      {/* ── All-done inline note (non-blocking) ── */}
      {doneCount === cows.length && cows.length > 0 && (
        <View
          style={[
            s.allDoneBanner,
            { backgroundColor: accentBg, borderColor: accentColor + "40" },
          ]}
        >
          <Text style={s.allDoneEmoji}>{isMorning ? "☀️" : "🌙"}</Text>
          <View style={{ flex: 1 }}>
            <Text style={[s.allDoneTitle, { color: accentColor }]}>
              {isMorning
                ? "Morning shift complete!"
                : "Evening shift complete!"}
            </Text>
            <Text style={s.allDoneSub}>
              {isMorning
                ? "Evening shift opens at 12:00 PM — pull to refresh then."
                : "Come back tomorrow morning — pull to refresh then."}
            </Text>
          </View>
        </View>
      )}

      {/* ── Cow Cards ── always visible ── */}
      {cows.map((cow) => {
        const d = get(cow.id);

        return (
          <View
            key={cow.id}
            style={[
              s.card,
              d.saved && {
                borderColor: "#16a34a40",
                backgroundColor: "#f0fdf4",
              },
            ]}
          >
            {/* Cow info row */}
            <View style={s.cardTop}>
              <View
                style={[
                  s.cowAvatar,
                  { backgroundColor: d.saved ? "#dcfce7" : "#f3f4f6" },
                ]}
              >
                <MaterialCommunityIcons
                  name="cow"
                  size={22}
                  color={d.saved ? "#16a34a" : "#6b7280"}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.cowName}>{cow.name}</Text>
                <Text style={s.cowTag}>
                  #{cow.tag}
                  {cow.breed ? ` · ${cow.breed}` : ""}
                </Text>
              </View>

              {/* ✅ Tick badge when saved */}
              {d.saved && (
                <View style={s.savedBadge}>
                  <Ionicons name="checkmark-circle" size={16} color="#16a34a" />
                  <Text style={s.savedBadgeText}>Done</Text>
                </View>
              )}
            </View>

            {/* Saved summary line */}
            {d.saved &&
              (() => {
                const entry = todayEntries.find(
                  (e) => e.cow_id === cow.id && e.shift === shift,
                );
                return entry ? (
                  <View style={s.savedRow}>
                    <Ionicons name="water" size={13} color="#16a34a" />
                    <Text style={s.savedQtyText}>
                      {entry.quantity.toFixed(1)} L recorded this shift
                    </Text>
                  </View>
                ) : null;
              })()}

            {/* Controls — only when not saved */}
            {!d.saved && (
              <View style={s.controls}>
                <TouchableOpacity
                  style={s.stepBtn}
                  onPress={() =>
                    patch(cow.id, {
                      qty: Math.max(0, Math.round((d.qty - 0.5) * 10) / 10),
                    })
                  }
                  disabled={d.saving}
                >
                  <Ionicons name="remove" size={20} color="#374151" />
                </TouchableOpacity>

                <QtyInput
                  qty={d.qty}
                  disabled={d.saving}
                  onChange={(v) => patch(cow.id, { qty: v })}
                />

                <TouchableOpacity
                  style={s.stepBtn}
                  onPress={() =>
                    patch(cow.id, { qty: Math.round((d.qty + 0.5) * 10) / 10 })
                  }
                  disabled={d.saving}
                >
                  <Ionicons name="add" size={20} color="#374151" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    s.saveBtn,
                    {
                      backgroundColor: d.qty > 0 ? accentColor : "#f3f4f6",
                      borderColor: d.qty > 0 ? accentColor : "#e5e7eb",
                    },
                  ]}
                  onPress={() => handleSave(cow)}
                  disabled={d.saving || d.qty === 0}
                >
                  {d.saving ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text
                      style={[
                        s.saveBtnText,
                        { color: d.qty > 0 ? "#fff" : "#9ca3af" },
                      ]}
                    >
                      Save
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        );
      })}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ffffff" },
  content: { padding: 16 },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: { color: "#6b7280", fontSize: 14 },

  shiftBanner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 18,
    borderWidth: 1,
    padding: 18,
    marginBottom: 14,
  },
  shiftLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  shiftIconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  shiftTitle: { fontSize: 16, fontWeight: "900" },
  shiftDate: { fontSize: 12, color: "#9ca3af", marginTop: 2 },
  shiftRight: { alignItems: "flex-end" },
  totalNum: { fontSize: 28, fontWeight: "900" },
  totalUnit: { fontSize: 16, fontWeight: "700" },
  totalLbl: { fontSize: 11, color: "#9ca3af", marginTop: 2 },

  statusStrip: { flexDirection: "row", gap: 10, marginBottom: 16 },
  statusChip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  statusText: { fontSize: 12, fontWeight: "700" },

  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  progressTxt: { fontSize: 12, color: "#6b7280", fontWeight: "600" },
  progressPct: { fontSize: 12, fontWeight: "800", color: "#374151" },
  progressBg: {
    height: 6,
    backgroundColor: "#f3f4f6",
    borderRadius: 4,
    marginBottom: 16,
  },
  progressFill: { height: 6, borderRadius: 4 },

  allDoneBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  allDoneEmoji: { fontSize: 28 },
  allDoneTitle: { fontSize: 14, fontWeight: "800", marginBottom: 2 },
  allDoneSub: { fontSize: 12, color: "#6b7280" },

  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: "#f3f4f6",
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 10,
  },
  cowAvatar: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  cowName: { fontSize: 16, fontWeight: "800", color: "#111827" },
  cowTag: { fontSize: 12, color: "#9ca3af", marginTop: 2 },
  savedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#dcfce7",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  savedBadgeText: { fontSize: 12, fontWeight: "700", color: "#16a34a" },

  savedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 2,
    paddingBottom: 4,
  },
  savedQtyText: { fontSize: 12, color: "#16a34a", fontWeight: "600" },

  controls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  stepBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f9fafb",
  },
  qtyWrap: { flex: 1, alignItems: "center" },
  qtyNum: { fontSize: 26, fontWeight: "900", color: "#111827" },
  qtyInput: {
    fontSize: 24,
    fontWeight: "900",
    color: "#16a34a",
    textAlign: "center",
    borderBottomWidth: 2,
    borderBottomColor: "#16a34a",
    minWidth: 60,
  },
  qtyHint: { fontSize: 11, color: "#9ca3af", fontWeight: "600", marginTop: 2 },
  saveBtn: {
    paddingHorizontal: 18,
    height: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 72,
  },
  saveBtnText: { fontSize: 14, fontWeight: "800" },
});
