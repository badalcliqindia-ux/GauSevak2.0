import React, { useState, useEffect } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  FlatList, StyleSheet, Alert, ActivityIndicator,
  ScrollView,
} from "react-native";
import { useAuth } from "../../context/auth-context";
import {
  apiGetMilkYield,
  apiAddMilkYield,
  apiUpdateMilkYield,
  apiDeleteMilkYield,
} from "../../services/api";

interface MilkYieldRecord {
  id: string;
  location: string;
  date: string;
  morning: number;
  evening: number;
  total_yield: number;
  milking_period?: string;
  notes?: string;
  recorded_by: string;
  created_at: string;
}

interface FormState {
  location: string;
  date: string;
  morning: string;
  evening: string;
  milking_period: string;
  notes: string;
}

export default function MilkYieldScreen() {
  const { token } = useAuth();
  const [records, setRecords] = useState<MilkYieldRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState<FormState>({
    location: "",
    date: new Date().toISOString().split("T")[0],
    morning: "",
    evening: "",
    milking_period: "",
    notes: "",
  });

  useEffect(() => {
    if (token) fetchRecords();
  }, [token]);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const data = await apiGetMilkYield(token!);
      setRecords(data);
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      location: "",
      date: new Date().toISOString().split("T")[0],
      morning: "",
      evening: "",
      milking_period: "",
      notes: "",
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async () => {
    if (!form.location.trim() || !form.morning || !form.evening) {
      Alert.alert("Validation Error", "Location, Morning aur Evening required hai");
      return;
    }
    const morning = parseFloat(form.morning);
    const evening = parseFloat(form.evening);

    const payload = {
      location: form.location.trim(),
      date: form.date,
      morning,
      evening,
      milking_period: form.milking_period.trim() || undefined,
      notes: form.notes.trim() || undefined,
    };

    try {
      setSubmitting(true);
      if (editingId) {
        await apiUpdateMilkYield(token!, editingId, payload);
        Alert.alert("Updated ✅", "Record update ho gaya!");
      } else {
        await apiAddMilkYield(token!, payload);
        Alert.alert("Saved ✅", "Record save ho gaya!");
      }
      resetForm();
      fetchRecords();
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item: MilkYieldRecord) => {
    setForm({
      location: item.location,
      date: item.date,
      morning: String(item.morning),
      evening: String(item.evening),
      milking_period: item.milking_period || "",
      notes: item.notes || "",
    });
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    Alert.alert("Delete Karo?", "Ye record permanently delete ho jayega", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive",
        onPress: async () => {
          try {
            await apiDeleteMilkYield(token!, id);
            fetchRecords();
          } catch (e: any) {
            Alert.alert("Error", e.message);
          }
        },
      },
    ]);
  };

  // ── Stats calculations ──────────────────────────
  const totalYieldAll = records.reduce((s, r) => s + r.total_yield, 0);
  const peakYield = records.length
    ? Math.max(...records.map((r) => r.total_yield))
    : 0;
  const totalDays = records.length;

  // Highest month calculation
  const monthMap: Record<string, number> = {};
  records.forEach((r) => {
    const month = r.date.substring(0, 7); // YYYY-MM
    monthMap[month] = (monthMap[month] || 0) + r.total_yield;
  });
  const highestMonth = Object.entries(monthMap).sort((a, b) => b[1] - a[1])[0];

  const totalMorning = records.reduce((s, r) => s + r.morning, 0);
  const totalEvening = records.reduce((s, r) => s + r.evening, 0);

  const renderRecord = ({ item }: { item: MilkYieldRecord }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>📍 {item.location}</Text>
        <View style={styles.cardActions}>
          <TouchableOpacity onPress={() => handleEdit(item)} style={styles.actionBtn}>
            <Text>✏️</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.actionBtn}>
            <Text>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.divider} />

      <Row label="Total Yield in Location"    value={`${item.total_yield.toFixed(1)} L`} highlight />
      <Row label="Peak in Complete Location"  value={`${Math.max(item.morning, item.evening).toFixed(1)} L`} />
      <Row label="Total Period of Milking"    value={item.milking_period || "—"} />
      <Row label="Date"                       value={item.date} />

      <View style={styles.statRow}>
        <View style={[styles.statBox, { backgroundColor: "#fff8e1" }]}>
          <Text style={styles.statIcon}>🌅</Text>
          <Text style={styles.statValue}>{item.morning} L</Text>
          <Text style={styles.statLabel}>Morning</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: "#e8eaf6" }]}>
          <Text style={styles.statIcon}>🌙</Text>
          <Text style={styles.statValue}>{item.evening} L</Text>
          <Text style={styles.statLabel}>Evening</Text>
        </View>
      </View>

      {item.notes ? <Text style={styles.notesText}>📝 {item.notes}</Text> : null}
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── Summary Stats ── */}
        <View style={styles.statsGrid}>
          <StatCard label="Total Yield" value={`${totalYieldAll.toFixed(1)} L`} color="#2e7d32" />
          <StatCard label="Peak Yield"  value={`${peakYield.toFixed(1)} L`}     color="#1565c0" />
          <StatCard label="Total Days"  value={`${totalDays}`}                  color="#6a1b9a" />
          <StatCard
            label="Best Month"
            value={highestMonth ? highestMonth[0] : "—"}
            color="#e65100"
          />
          <StatCard label="Morning Total" value={`${totalMorning.toFixed(1)} L`} color="#f57f17" />
          <StatCard label="Evening Total" value={`${totalEvening.toFixed(1)} L`} color="#283593" />
        </View>

        {/* ── Add Button ── */}
        {!showForm && (
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => setShowForm(true)}
          >
            <Text style={styles.addBtnText}>➕ Add new record</Text>
          </TouchableOpacity>
        )}

        {/* ── Form ── */}
        {showForm && (
          <View style={styles.formBox}>
            <Text style={styles.formTitle}>
              {editingId ? "✏️ Update Record" : "➕ Add New Milk Yield Record"}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Location (e.g. Farm A)"
              placeholderTextColor="#aaa"
              value={form.location}
              onChangeText={(v) => setForm({ ...form, location: v })}
            />
            <TextInput
              style={styles.input}
              placeholder="Date (YYYY-MM-DD)"
              placeholderTextColor="#aaa"
              value={form.date}
              onChangeText={(v) => setForm({ ...form, date: v })}
            />
            <TextInput
              style={styles.input}
              placeholder="Milking Period (e.g. Jan 2025 - Feb 2025)"
              placeholderTextColor="#aaa"
              value={form.milking_period}
              onChangeText={(v) => setForm({ ...form, milking_period: v })}
            />

            <View style={styles.row2}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="🌅 Morning (L)"
                placeholderTextColor="#aaa"
                keyboardType="numeric"
                value={form.morning}
                onChangeText={(v) => setForm({ ...form, morning: v })}
              />
              <View style={{ width: 10 }} />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="🌙 Evening (L)"
                placeholderTextColor="#aaa"
                keyboardType="numeric"
                value={form.evening}
                onChangeText={(v) => setForm({ ...form, evening: v })}
              />
            </View>

            <TextInput
              style={[styles.input, styles.notesInput]}
              placeholder="Notes (optional)"
              placeholderTextColor="#aaa"
              multiline
              value={form.notes}
              onChangeText={(v) => setForm({ ...form, notes: v })}
            />

            <View style={styles.btnRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={resetForm}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleSubmit}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveBtnText}>
                    {editingId ? "Update" : "💾 Save"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ── Records ── */}
        <Text style={styles.sectionTitle}>📋 All Records ({records.length})</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#2e7d32" style={{ marginTop: 20 }} />
        ) : (
          <FlatList
            data={records}
            keyExtractor={(item) => item.id}
            renderItem={renderRecord}
            scrollEnabled={false}
            ListEmptyComponent={
              <Text style={styles.emptyText}>  No records found  🐄</Text>
            }
          />
        )}
      </ScrollView>
    </View>
  );
}

// ── Helper Components ──────────────────────────────
function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <Text style={[styles.statCardValue, { color }]}>{value}</Text>
      <Text style={styles.statCardLabel}>{label}</Text>
    </View>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <View style={styles.rowContainer}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, highlight && styles.rowValueHighlight]}>{value}</Text>
    </View>
  );
}

// ── Styles ────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f4f0", padding: 16 },

  statsGrid: {
    flexDirection: "row", flexWrap: "wrap",
    gap: 10, marginBottom: 16,
  },
  statCard: {
    width: "47%", backgroundColor: "#fff",
    borderRadius: 12, padding: 14,
    borderLeftWidth: 4,
    shadowColor: "#000", shadowOpacity: 0.05,
    shadowRadius: 4, elevation: 2,
  },
  statCardValue: { fontSize: 20, fontWeight: "bold" },
  statCardLabel: { color: "#888", fontSize: 12, marginTop: 2 },

  addBtn: {
    backgroundColor: "#2e7d32", padding: 14,
    borderRadius: 12, alignItems: "center", marginBottom: 16,
  },
  addBtnText: { color: "#fff", fontWeight: "bold", fontSize: 15 },

  formBox: {
    backgroundColor: "#fff", borderRadius: 14,
    padding: 16, marginBottom: 16,
    shadowColor: "#000", shadowOpacity: 0.06,
    shadowRadius: 6, elevation: 3,
  },
  formTitle: { fontSize: 16, fontWeight: "bold", color: "#333", marginBottom: 12 },
  input: {
    borderWidth: 1, borderColor: "#e0e0e0", borderRadius: 10,
    padding: 12, marginBottom: 10, backgroundColor: "#fafafa",
    color: "#333", fontSize: 14,
  },
  notesInput: { height: 70, textAlignVertical: "top" },
  row2: { flexDirection: "row" },
  btnRow: { flexDirection: "row", gap: 8 },
  saveBtn: {
    flex: 1, backgroundColor: "#2e7d32",
    padding: 14, borderRadius: 10, alignItems: "center",
  },
  saveBtnText: { color: "#fff", fontWeight: "bold", fontSize: 15 },
  cancelBtn: {
    flex: 1, backgroundColor: "#f5f5f5",
    padding: 14, borderRadius: 10, alignItems: "center",
    borderWidth: 1, borderColor: "#e0e0e0",
  },
  cancelBtnText: { color: "#666", fontWeight: "bold" },

  sectionTitle: { fontSize: 17, fontWeight: "bold", color: "#333", marginBottom: 10 },
  card: {
    backgroundColor: "#fff", borderRadius: 12,
    padding: 14, marginBottom: 12,
    shadowColor: "#000", shadowOpacity: 0.05,
    shadowRadius: 4, elevation: 2,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  cardTitle: { fontSize: 15, fontWeight: "bold", color: "#333" },
  cardActions: { flexDirection: "row", gap: 8 },
  actionBtn: { padding: 4 },
  divider: { height: 1, backgroundColor: "#f0f0f0", marginBottom: 10 },

  rowContainer: {
    flexDirection: "row", justifyContent: "space-between",
    paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: "#f5f5f5",
  },
  rowLabel: { color: "#666", fontSize: 13 },
  rowValue: { color: "#333", fontSize: 13, fontWeight: "500" },
  rowValueHighlight: { color: "#2e7d32", fontWeight: "bold", fontSize: 14 },

  statRow: { flexDirection: "row", gap: 10, marginTop: 12 },
  statBox: {
    flex: 1, borderRadius: 10, padding: 12, alignItems: "center",
  },
  statIcon: { fontSize: 20 },
  statValue: { fontSize: 18, fontWeight: "bold", color: "#333", marginTop: 4 },
  statLabel: { color: "#888", fontSize: 12, marginTop: 2 },

  notesText: { color: "#888", fontSize: 13, marginTop: 8, fontStyle: "italic" },
  emptyText: { textAlign: "center", color: "#aaa", marginTop: 30, fontSize: 15 },
});