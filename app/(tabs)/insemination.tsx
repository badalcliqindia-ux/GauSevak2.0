import React, { useEffect, useState } from 'react';
import { ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '../../context/auth-context';
import { apiGetInsemination } from '../../services/api';
import { inseminationData } from '../../data/mockData';
import { Card, Row, SectionHeader, CardHeader } from '../../components/ui';
import { theme } from '../../constants/theme';

export default function InseminationScreen() {
  const { token } = useAuth();
  const [records, setRecords] = useState<any[]>(inseminationData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        if (token) {
          const data = await apiGetInsemination(token);
          if (data?.length > 0) setRecords(data);
        }
      } catch { }
      finally { setLoading(false); }
    })();
  }, [token]);

  if (loading) return <ActivityIndicator size="large" color={theme.accent} style={s.loader} />;

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <SectionHeader title="Insemination Records" emoji="💉" />
      {records.map((r: any) => (
        <Card key={r.id}>
          <CardHeader
            title={r.sire}
            badge={r.pregnancy}
            badgeColor={r.pregnancy === 'Confirmed' ? theme.accent : theme.warning}
          />
          {/* All required fields */}
          <Row label="Insemination Date"          value={r.date}        />
          <Row label="Sire"                        value={r.sire}        />
          <Row label="Pregnancy Status"            value={r.pregnancy}   highlight />
          <Row label="Determination Date"          value={r.detDate}     />
          <Row label="PD Done By (Vet)"            value={r.pdBy}        />
          <Row label="Expected Calving"            value={r.expCalving}  highlight />
          <Row label="Actual Calving"              value={r.actCalving}  />
          <Row label="Expected Heat After Calving" value={r.expHeat}     />
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
