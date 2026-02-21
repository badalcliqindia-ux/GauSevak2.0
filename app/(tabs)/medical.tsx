import React, { useEffect, useState } from 'react';
import { Text, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '../../context/auth-context';
import { apiGetMedical } from '../../services/api';
import { medicalData } from '../../data/mockData';
import { Card, Row, SectionHeader, CardHeader } from '../../components/ui';
import { theme } from '../../constants/theme';

const statusColor = (s: string) =>
  s === 'Up to date' ? theme.accent : s === 'Due Soon' ? theme.warning : theme.danger;

export default function MedicalScreen() {
  const { token } = useAuth();
  const [records, setRecords] = useState<any[]>(medicalData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        if (token) {
          const data = await apiGetMedical(token);
          if (data?.length > 0) setRecords(data);
        }
      } catch { }
      finally { setLoading(false); }
    })();
  }, [token]);

  if (loading) return <ActivityIndicator size="large" color={theme.accent} style={s.loader} />;

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <SectionHeader title="Annual Medical Checkup" emoji="💊" />
      {records.map((r: any) => (
        <Card key={r.id}>
          <CardHeader
            title={`Tag: ${r.tag}`}
            badge={r.status}
            badgeColor={statusColor(r.status)}
          />

          {/* Annual Vaccination */}
          <Text style={s.subhead}>💉 Annual Vaccination</Text>
          <Row label="Last Vaccination" value={r.lastVaccination} />
          <Row label="Next Vaccination" value={r.nextVaccination} highlight />

          {/* Annual Deworming */}
          <Text style={[s.subhead, { color: theme.warning, marginTop: 14 }]}>🪱 Annual Deworming</Text>
          <Row label="Last Deworming" value={r.lastDeworming} />
          <Row label="Next Deworming" value={r.nextDeworming} highlight />
        </Card>
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  content:   { padding: 16 },
  loader:    { flex: 1, marginTop: 40 },
  subhead:   { fontSize: 12, color: theme.accent, fontWeight: '700', marginBottom: 4, marginTop: 4 },
});
