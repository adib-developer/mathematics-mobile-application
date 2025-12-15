import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function Pictogram({ onBack, title = 'Pictogram & Tally Chart Example', tallyData, pictogramData, keyValue = 3, subtitle = 'Key: 1 circle = 3 bars' }) {
  // Defaults resemble the worksheet if props not provided
  const tallyRows = tallyData ?? [
    { day: 'Monday', tally: '丨丨丨丨  丨丨', freq: 11 },
    { day: 'Tuesday', tally: '丨丨丨丨  丨丨丨', freq: 13 },
    { day: 'Wednesday', tally: '丨丨丨  丨丨', freq: 9 },
    { day: 'Thursday', tally: '丨丨丨丨  丨', freq: 11 },
    { day: 'Friday', tally: '丨丨  丨丨丨', freq: 9 }
  ];

  const pictogramRows = pictogramData ?? [
    { day: 'Monday', count: 11 },
    { day: 'Tuesday', count: 13 },
    { day: 'Wednesday', count: 9 },
    { day: 'Thursday', count: 11 },
    { day: 'Friday', count: 9 }
  ];

  // Each circle represents `keyValue` bars
  const circlesFor = (n) => {
    const full = Math.floor(n / keyValue);
    const rem = n % keyValue;
    return { full, rem };
  };

  const renderPartial = (rem) => {
    if (rem === 0) return null;
    // Fill proportionally by remainder / keyValue
    const widthPct = `${Math.round((rem / keyValue) * 100)}%`;
    return (
      <View style={styles.circle}>
        <View style={[styles.partialFill, { width: widthPct }]} />
      </View>
    );
  };

  return (
    <View style={styles.root}>
      <Text style={styles.title}>{title}</Text>

      <Text style={styles.sectionTitle}>Tally Chart</Text>
      <View style={styles.table}>
        <View style={[styles.row, styles.headerRow]}>
          <Text style={[styles.cell, styles.cellDay, styles.header]}>Day</Text>
          <Text style={[styles.cell, styles.cellTally, styles.header]}>Tally</Text>
          <Text style={[styles.cell, styles.cellFreq, styles.header]}>Frequency</Text>
        </View>
        {tallyRows.map((r) => (
          <View key={r.day} style={styles.row}>
            <Text style={[styles.cell, styles.cellDay]}>{r.day}</Text>
            <Text style={[styles.cell, styles.cellTally]}>{r.tally}</Text>
            <Text style={[styles.cell, styles.cellFreq]}>{r.freq}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Pictogram ({subtitle})</Text>
      <View style={styles.pictoTable}>
        {pictogramRows.map((r) => {
          const { full, rem } = circlesFor(r.count);
          return (
            <View key={r.day} style={styles.pictoRow}>
              <Text style={styles.pictoDay}>{r.day}</Text>
              <View style={styles.pictoIcons}>
                {Array.from({ length: full }).map((_, i) => (
                  <View key={`f-${i}`} style={styles.circle} />
                ))}
                {renderPartial(rem)}
              </View>
            </View>
          );
        })}
      </View>

      <View style={styles.keyBox}>
        <Text style={styles.keyTitle}>Key</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={styles.circle} />
          <Text>Represents {keyValue} chocolate bars</Text>
        </View>
      </View>

      <Text style={styles.note}>
        Activity: Spot what could be wrong in the tally or pictogram.
      </Text>

      <Text onPress={onBack} style={styles.back}>← Back</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginTop: 12, marginBottom: 8 },
  table: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, overflow: 'hidden' },
  row: { flexDirection: 'row', borderTopWidth: 1, borderColor: '#eee' },
  headerRow: { backgroundColor: '#f6f8fb' },
  cell: { paddingVertical: 10, paddingHorizontal: 8 },
  header: { fontWeight: '700' },
  cellDay: { width: '30%' },
  cellTally: { width: '40%', fontFamily: 'monospace' },
  cellFreq: { width: '30%' },

  pictoTable: { marginTop: 10, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, overflow: 'hidden' },
  pictoRow: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderColor: '#eee' },
  pictoDay: { width: '30%', padding: 10 },
  pictoIcons: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, padding: 10, width: '70%' },
  circle: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#333' },
  partialFill: { height: '100%', backgroundColor: '#8ecae6', borderTopLeftRadius: 12, borderBottomLeftRadius: 12 },

  keyBox: { marginTop: 10, padding: 10, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, backgroundColor: '#f9f9f9' },
  keyTitle: { fontWeight: '700', marginBottom: 6 },
  note: { marginTop: 12, color: '#555' },
  back: { marginTop: 16, color: '#007bff', fontWeight: '600' }
});
