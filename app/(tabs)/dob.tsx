import React, { useEffect, useState } from 'react';
import { ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '../../context/auth-context';
import { apiGetDOB } from '../../services/api';
import { dobData } from '../../data/mockData';
import { Card, Row, SectionHeader, CardHeader } from '../../components/ui';
import { theme } from '../../constants/theme';

export default function DOBScreen() {
  const { token } = useAuth();
  const [records, setRecords] = useState<any[]>(dobData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        if (token) {
          const data = await apiGetDOB(token);
          if (data?.length > 0) setRecords(data);
        }
      } catch { }
      finally { setLoading(false); }
    })();
  }, [token]);

  if (loading) return <ActivityIndicator size="large" color={theme.accent} style={s.loader} />;

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <SectionHeader title="Date of Birth Records" emoji="🐄" />
      {records.map((r: any) => (
        <Card key={r.id}>
          <CardHeader title={`Tag: ${r.tag}`} />
          {/* All required fields */}
          <Row label="Date of Birth (DOB)"          value={r.dob}                      />
          <Row label="Duration Between Calvings"    value={r.durationBetweenCalvings}  highlight />
          <Row label="1st Calving"                   value={r.firstCalving}             />
          <Row label="Maturity Date (1st Heat)"      value={r.maturityDate}             />
          <Row label="6-Month Deworming Date"        value={r.deworming}                />
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
