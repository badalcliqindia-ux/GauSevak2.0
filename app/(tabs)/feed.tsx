import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import {
  MaterialCommunityIcons,
  Ionicons,
  FontAwesome5,
} from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../../context/auth-context";
import {
  apiWorkerGetCows,
  apiWorkerGetFeedStatus,
  apiWorkerMarkFed,
  apiWorkerUnmarkFed,
} from "../../services/api";

interface Cow {
  id: string;
  name: string;
  tag_id?: string;
  tag?: string;
  isActive?: boolean;
  isSold?: boolean;
}

function getCurrentShift(): "morning" | "evening" {
  const hour = new Date().getHours();
  return hour >= 2 && hour < 14 ? "morning" : "evening";
}

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

export default function FeedScreen({
  onFedCountChange,
}: {
  onFedCountChange?: (done: number, total: number) => void;
}) {
  const { workerToken } = useAuth();
  const token = workerToken ?? "";
  const shift = getCurrentShift();

  const [cows, setCows] = useState<Cow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [feedStatus, setFeedStatus] = useState<
    Record<string, { done: boolean; loading: boolean }>
  >({});

  const get = (id: string) => feedStatus[id] ?? { done: false, loading: false };
  const patch = (id: string, p: Partial<ReturnType<typeof get>>) =>
    setFeedStatus((prev) => ({ ...prev, [id]: { ...get(id), ...p } }));

  const fetchAll = useCallback(async () => {
    try {
      const [cowsData, statusData] = await Promise.all([
        apiWorkerGetCows(token),
        apiWorkerGetFeedStatus(token, todayStr(), shift),
      ]);

      const activeCows: Cow[] = cowsData.filter(
        (c: Cow) => c.isActive !== false && !c.isSold,
      );
      setCows(activeCows);

      const fedIds = new Set<string>(
        statusData.map((e: { cow_id: string }) => e.cow_id),
      );
      setFeedStatus(() => {
        const next: Record<string, { done: boolean; loading: boolean }> = {};
        activeCows.forEach((c) => {
          next[c.id] = { done: fedIds.has(c.id), loading: false };
        });
        return next;
      });
    } catch (e) {
      console.log("feed fetch error:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token, shift]);

  useEffect(() => {
    fetchAll();
  }, []);

  const doneCount = cows.filter((c) => get(c.id).done).length;
  useEffect(() => {
    onFedCountChange?.(doneCount, cows.length);
  }, [doneCount, cows.length]);

  const handleToggle = async (cow: Cow) => {
    const d = get(cow.id);
    if (d.loading) return;
    const newDone = !d.done;
    patch(cow.id, { loading: true });
    try {
      if (newDone) {
        await apiWorkerMarkFed(token, {
          cow_id: cow.id,
          cow_name: cow.name,
          cow_tag: cow.tag_id ?? cow.tag ?? "",
          date: todayStr(),
          shift,
        });
      } else {
        await apiWorkerUnmarkFed(token, cow.id, todayStr(), shift);
      }
      patch(cow.id, { done: newDone, loading: false });
    } catch (e) {
      console.log("toggle feed error:", e);
      patch(cow.id, { loading: false });
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchAll();
  };

  const pct = cows.length > 0 ? doneCount / cows.length : 0;
  const progressColors: [string, string] =
    pct === 1
      ? ["#22d3a0", "#059669"]
      : pct > 0.5
        ? ["#f5c842", "#ca8a04"]
        : ["#fb923c", "#ea580c"];

  if (loading) {
    return (
      <View style={fd.centered}>
        <ActivityIndicator size="large" color="#f5c842" />
        <Text style={{ color: "#555", marginTop: 10, fontSize: 14 }}>
          Loading cows...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={fd.scroll}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#f5c842"
        />
      }
    >
      {/* ── Banner ── */}
      <LinearGradient colors={["#1a1a0a", "#12120a"]} style={fd.banner}>
        <View style={fd.bannerTop}>
          <View style={fd.bannerLeft}>
            <LinearGradient colors={["#f5c842", "#ca8a04"]} style={fd.feedIcon}>
              <FontAwesome5 name="seedling" size={18} color="#fff" />
            </LinearGradient>
            <View>
              <Text style={fd.bannerSub}>{todayStr()}</Text>
              <Text
                style={{ color: "#f5c842", fontSize: 12, fontWeight: "700" }}
              >
                {shift.toUpperCase()} SHIFT
              </Text>
            </View>
          </View>
          <View style={fd.countBubble}>
            <Text style={fd.countNum}>{doneCount}</Text>
            <Text style={fd.countDen}>/{cows.length}</Text>
          </View>
        </View>

        <View style={fd.progressBg}>
          <LinearGradient
            colors={progressColors}
            style={[fd.progressFill, { width: `${pct * 100}%` as any }]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
        </View>
        <Text style={fd.progressLbl}>
          {doneCount === cows.length && cows.length > 0
            ? "✓ All cows fed!"
            : `${cows.length - doneCount} cows remaining`}
        </Text>
      </LinearGradient>

      {/* ── Stats Row ── */}
      <View style={fd.statsRow}>
        {[
          {
            icon: "checkmark-circle",
            label: "Fed",
            value: `${doneCount}`,
            color: "#22d3a0",
            lib: "Ionicons",
          },
          {
            icon: "time-outline",
            label: "Pending",
            value: `${cows.length - doneCount}`,
            color: "#fb923c",
            lib: "Ionicons",
          },
          {
            icon: "cow",
            label: "Total",
            value: `${cows.length}`,
            color: "#f5c842",
            lib: "MaterialCommunityIcons",
          },
        ].map((stat) => (
          <LinearGradient
            key={stat.label}
            colors={["rgba(255,255,255,0.04)", "rgba(255,255,255,0.01)"]}
            style={fd.statCard}
          >
            {stat.lib === "MaterialCommunityIcons" ? (
              <MaterialCommunityIcons
                name={stat.icon as any}
                size={20}
                color={stat.color}
              />
            ) : (
              <Ionicons name={stat.icon as any} size={20} color={stat.color} />
            )}
            <Text style={[fd.statValue, { color: stat.color }]}>
              {stat.value}
            </Text>
            <Text style={fd.statLabel}>{stat.label}</Text>
          </LinearGradient>
        ))}
      </View>

      {/* ── Cow Cards ── */}
      {cows.map((cow) => {
        const d = get(cow.id);
        return (
          <View key={cow.id} style={[fd.card, d.done && fd.cardDone]}>
            <View style={fd.cardInner}>
              <View style={fd.cowRow}>
                <LinearGradient
                  colors={
                    d.done ? ["#f5c842", "#ca8a04"] : ["#2a2a1e", "#1e1e0a"]
                  }
                  style={fd.cowAvatar}
                >
                  <MaterialCommunityIcons
                    name="cow"
                    size={22}
                    color={d.done ? "#fff" : "#666"}
                  />
                </LinearGradient>
                <View>
                  <Text style={fd.cowName}>{cow.name}</Text>
                  {(cow.tag_id || cow.tag) && (
                    <View style={fd.tagRow}>
                      <MaterialCommunityIcons
                        name="tag-outline"
                        size={11}
                        color="#555"
                      />
                      <Text style={fd.tagId}> {cow.tag_id ?? cow.tag}</Text>
                    </View>
                  )}
                  <View
                    style={[
                      fd.statusBadge,
                      d.done ? fd.badgeDone : fd.badgeDue,
                    ]}
                  >
                    <Ionicons
                      name={d.done ? "checkmark-circle" : "time-outline"}
                      size={12}
                      color={d.done ? "#22d3a0" : "#fb923c"}
                    />
                    <Text
                      style={[fd.statusTxt, d.done ? fd.txtDone : fd.txtDue]}
                    >
                      {d.done ? "Fed" : "Pending"}
                    </Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity
                style={[fd.toggleBtn, d.done ? fd.toggleDone : fd.toggleDue]}
                onPress={() => handleToggle(cow)}
                disabled={d.loading}
              >
                {d.loading ? (
                  <ActivityIndicator
                    size="small"
                    color={d.done ? "#888" : "#f5c842"}
                  />
                ) : (
                  <View style={fd.toggleInner}>
                    <FontAwesome5
                      name={d.done ? "undo" : "check"}
                      size={13}
                      color={d.done ? "#666" : "#f5c842"}
                    />
                    <Text
                      style={[
                        fd.toggleTxt,
                        d.done ? fd.toggleTxtDone : fd.toggleTxtDue,
                      ]}
                    >
                      {d.done ? "Undo" : "Mark Fed"}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
        );
      })}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const fd = StyleSheet.create({
  scroll: { flex: 1, paddingHorizontal: 14, paddingTop: 8 },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 100,
  },
  banner: {
    borderRadius: 20,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(245,200,66,0.15)",
  },
  bannerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  bannerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  feedIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  bannerSub: { fontSize: 12, color: "#aaa", fontWeight: "700" },
  countBubble: { flexDirection: "row", alignItems: "baseline" },
  countNum: { fontSize: 34, fontWeight: "900", color: "#f5c842" },
  countDen: { fontSize: 16, fontWeight: "700", color: "#555" },
  progressBg: {
    height: 6,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: { height: 6, borderRadius: 4 },
  progressLbl: { fontSize: 11, color: "#555", fontWeight: "700" },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 14 },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 13,
    alignItems: "center",
    gap: 5,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  statValue: { fontSize: 18, fontWeight: "900" },
  statLabel: { fontSize: 10, color: "#555", fontWeight: "700" },
  card: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    padding: 16,
    marginBottom: 10,
  },
  cardDone: {
    borderColor: "rgba(245,200,66,0.3)",
    backgroundColor: "rgba(245,200,66,0.04)",
  },
  cardInner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cowRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  cowAvatar: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  cowName: { fontSize: 16, fontWeight: "900", color: "#fff" },
  tagRow: { flexDirection: "row", alignItems: "center", marginTop: 2 },
  tagId: { fontSize: 11, color: "#555" },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  badgeDue: {
    backgroundColor: "rgba(251,146,60,0.1)",
    borderColor: "rgba(251,146,60,0.35)",
  },
  badgeDone: {
    backgroundColor: "rgba(34,211,160,0.1)",
    borderColor: "rgba(34,211,160,0.35)",
  },
  statusTxt: { fontSize: 11, fontWeight: "800" },
  txtDue: { color: "#fb923c" },
  txtDone: { color: "#22d3a0" },
  toggleBtn: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 13,
    borderWidth: 1.5,
    minWidth: 105,
    alignItems: "center",
  },
  toggleDue: {
    backgroundColor: "rgba(245,200,66,0.12)",
    borderColor: "#f5c842",
  },
  toggleDone: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderColor: "rgba(255,255,255,0.12)",
  },
  toggleInner: { flexDirection: "row", alignItems: "center", gap: 7 },
  toggleTxt: { fontSize: 13, fontWeight: "800" },
  toggleTxtDue: { color: "#f5c842" },
  toggleTxtDone: { color: "#666" },
});
