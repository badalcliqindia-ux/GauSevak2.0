import React, { useEffect, useState } from 'react';
import { ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '../../context/auth-context';
import { apiGetGenetic } from '../../services/api';
import { geneticData } from '../../data/mockData';
import { Card, Row, SectionHeader, CardHeader } from '../../components/ui';
import { theme } from '../../constants/theme';

const statusColor = (s: string) =>
  s === 'Healthy' ? theme.accent : s === 'Sold' ? theme.warning : theme.danger;

export default function GeneticRecordScreen() {
  const { token } = useAuth();
  const [records, setRecords] = useState<any[]>(geneticData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        if (token) {
          const data = await apiGetGenetic(token);
          if (data?.length > 0) setRecords(data);
        }
      } catch { }
      finally { setLoading(false); }
    })();
  }, [token]);

  if (loading) return <ActivityIndicator size="large" color={theme.accent} style={s.loader} />;

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <SectionHeader title="Genetic Record" emoji="🔬" />
      {records.map((r: any) => (
        <Card key={r.id}>
          <CardHeader
            title={`Tag: ${r.tag}`}
            badge={r.status}
            badgeColor={statusColor(r.status)}
          />
          {/* All required fields */}
          <Row label="Sire (Father)"     value={r.sire}   />
          <Row label="Size of Calf"      value={r.size}   highlight />
          <Row label="D.O.B of Calf"     value={r.dob}    />
          <Row label="Status of Calf"    value={r.status} />
        </Card>
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  content:   { padding: 16 },
  loader:    { flex: 1, marginTop: 40 },
});
