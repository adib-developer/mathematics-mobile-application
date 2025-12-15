import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function Grid({ points = {}, min = -5, max = 5, width = 300, height = 300 }) {
  // Ensure width/height are exact multiples of cell size so labels align
  const range = max - min; // e.g. -5..5 => 10 cells
  const rawCell = width / range;
  const cellSize = Math.floor(rawCell); // integer pixels to avoid drift
  const gridW = cellSize * range;
  const gridH = cellSize * range;

  // Axis origin in pixels (top-left coordinate space)
  const centerX = (0 - min) * cellSize;
  const centerY = (max) * cellSize;

  // Grid lines (vertical + horizontal), with bold axes at x=0 and y=0
  const lines = [];
  for (let i = min; i <= max; i++) {
    const xPos = centerX + i * cellSize;
    lines.push(
      <View
        key={`v-${i}`}
        style={[styles.vLine, { left: xPos, height: gridH }, i === 0 && styles.axis]}
      />
    );
  }
  for (let j = min; j <= max; j++) {
    const yPos = centerY - j * cellSize;
    lines.push(
      <View
        key={`h-${j}`}
        style={[styles.hLine, { top: yPos, width: gridW }, j === 0 && styles.axis]}
      />
    );
  }

  // Axis labels aligned to each grid step, rendered INSIDE the grid
  const xLabelsInside = [];
  for (let i = min; i <= max; i++) {
    if (i === 0) continue; // skip origin label
    const left = centerX + i * cellSize - cellSize / 2;
    const top = centerY + 2; // just below x-axis, inside the grid
    xLabelsInside.push(
      <Text key={`xl-${i}`} style={[styles.xLabelInside, { left, top, width: cellSize }]}>
        {i}
      </Text>
    );
  }
  const yLabelsInside = [];
  for (let j = min; j <= max; j++) {
    if (j === 0) continue;
    // place label in the cell immediately to the left of the y-axis
    const top = centerY - j * cellSize - 10; // vertically center text in cell
    const left = centerX - cellSize + 2; // inside grid, left side of axis
    yLabelsInside.push(
      <Text key={`yl-${j}`} style={[styles.yLabelInside, { left, top, width: cellSize - 4 }]}>
        {j}
      </Text>
    );
  }

  // Points, clamped to stay inside the grid box
  const r = 6; // point radius
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const pointElements = Object.entries(points).map(([label, coord]) => {
    if (!coord || coord.length < 2) return null;
    const [x, y] = coord;
    const px = clamp(centerX + x * cellSize, r, gridW - r);
    const py = clamp(centerY - y * cellSize, r, gridH - r);

    return (
      <View key={`point-${label}`} style={[styles.point, { left: px - r, top: py - r }]}> 
        <View style={[styles.dot, { width: r * 2, height: r * 2, borderRadius: r }]} />
        <Text style={styles.pointLabel}>{label}</Text>
      </View>
    );
  });

  return (
    <View style={styles.gridContainer}>
      <View style={[styles.gridBox, { width: gridW, height: gridH }]}> 
        {lines}
        {xLabelsInside}
        {yLabelsInside}
        {pointElements}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  gridContainer: { alignItems: 'center', marginVertical: 12 },
  gridBox: { position: 'relative', backgroundColor: '#fff', borderWidth: 1, borderColor: '#bbb' },
  xLabelInside: { position: 'absolute', textAlign: 'center', fontSize: 11, color: '#666' },
  yLabelInside: { position: 'absolute', textAlign: 'right', fontSize: 11, color: '#666' },
  vLine: { position: 'absolute', top: 0, width: 1, backgroundColor: '#e6e6e6' },
  hLine: { position: 'absolute', left: 0, height: 1, backgroundColor: '#e6e6e6' },
  axis: { backgroundColor: '#000' },
  point: { position: 'absolute', alignItems: 'flex-start' },
  dot: { backgroundColor: '#d9534f' },
  pointLabel: { marginLeft: 6, marginTop: -6, fontWeight: '700', color: '#333' }
});
