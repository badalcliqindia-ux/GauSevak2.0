import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '../../context/auth-context';
import { apiGetSemen } from '../../services/api';
import { semenData } from '../../data/mockData';
import { Card, Row, SectionHeader, CardHeader } from '../../components/ui';
import { theme } from '../../constants/theme';

export default function SemenRecordScreen() {
  const { token } = useAuth();
  const [records, setRecords] = useState<any[]>(semenData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        if (token) {
          const data = await apiGetSemen(token);
          if (data?.length > 0) setRecords(data);
        }
      } catch { }
      finally { setLoading(false); }
    })();
  }, [token]);

  if (loading) return <ActivityIndicator size="large" color={theme.accent} style={s.loader} />;

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <SectionHeader title="Semen Record" emoji="🧬" />
      {records.map((r: any) => (
        <Card key={r.id}>
          <CardHeader title={r.bull} />

          {/* Female / Male calves boxes */}
          <View style={s.calvesRow}>
            <View style={[s.calvesBox, { backgroundColor: theme.pink + '18', borderColor: theme.pink + '44' }]}>
              <Text style={s.calvesLabel}>♀ Female Calves</Text>
              <Text style={[s.calvesVal, { color: theme.pink }]}>{r.femaleCalves}</Text>
            </View>
            <View style={{ width: 10 }} />
            <View style={[s.calvesBox, { backgroundColor: theme.blue + '18', borderColor: theme.blue + '44' }]}>
              <Text style={s.calvesLabel}>♂ Male Calves</Text>
              <Text style={[s.calvesVal, { color: theme.blue }]}>{r.maleCalves}</Text>
            </View>
          </View>

          {/* All required fields */}
          <Row label="Dam Yield"               value={r.damYield}    highlight />
          <Row label="Conception in (A/S)"     value={r.conception}  />
        </Card>
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container:  { flex: 1, backgroundColor: theme.bg },
  content:    { padding: 16 },
  loader:     { flex: 1, marginTop: 40 },
  calvesRow:  { flexDirection: 'row', marginBottom: 14 },
  calvesBox:  { flex: 1, borderWidth: 1, borderRadius: 12, padding: 12, alignItems: 'center' },
  calvesLabel:{ fontSize: 11, color: theme.textMuted },
  calvesVal:  { fontSize: 24, fontWeight: '900', marginTop: 4 },
});
