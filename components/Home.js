import React, {useState, useEffect} from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

export default function Home({onNavigate, initialGrade}){
  const [selectedGrade, setSelectedGrade] = useState(initialGrade || null);

  // Keep internal selectedGrade in sync when App passes a new initialGrade
  useEffect(() => {
    if (initialGrade && initialGrade !== selectedGrade) {
      setSelectedGrade(initialGrade);
    }
    // If initialGrade is explicitly null, clear selection
    if (initialGrade === null && selectedGrade !== null) {
      setSelectedGrade(null);
    }
  }, [initialGrade]);

  const grades = ['1','2','3','4','5','6','7'];

  const grade1Topics = [
    { title: '1.1 Addition & Subtraction', topic: 'addition-subtraction' },
    { title: '1.2 Multiplication & Division', topic: 'multiplication-division' },
    { title: '1.3 Time', topic: 'time' },
    { title: '1.4 Metric Conversions', topic: 'metric-conversions' },
    { title: '1.5 Fractions', topic: 'fractions' },
    { title: '1.6 Place Value', topic: 'place-value' },
    { title: '1.7 Rounding', topic: 'rounding' },
    { title: '1.8 Negative Numbers', topic: 'negative-numbers' },
    { title: '1.9 Powers & Roots', topic: 'powers-roots' },
    { title: '1.10 BIDMAS', topic: 'bidmas' },
    { title: '1.11 Factors & Multiples', topic: 'factors-multiples' },
    { title: '1.12 Coordinates', topic: 'coordinates' },
    { title: '1.13 Pictograms', topic: 'pictograms' }
  ];

  const grade2Topics = [
    { title: '2.1 Calculation Problems', topic: 'calculation-problems' },
    { title: '2.2 Using a Calculator', topic: 'using-calculator' },
    { title: '2.3 Systematic Listing', topic: 'systematic-listing' },
    { title: '2.4 Fractions of an Amount', topic: 'fractions-of-amount' },
    { title: '2.5 Fractions, Decimals and Percentages', topic: 'fractions-decimals-percentages' },
    { title: '2.6 Simplifying Algebra', topic: 'simplifying-algebra' },
    { title: '2.7 Writing an Expression', topic: 'writing-expression' },
    { title: '2.8 Function Machines', topic: 'function-machines' },
    { title: '2.9 Solving One Step Equations', topic: 'one-step-equations' },
    { title: '2.10 Angles', topic: 'angles' },
    { title: '2.11 Area and Perimeter', topic: 'area-perimeter' },
    { title: '2.12 Probability', topic: 'probability' },
    { title: '2.13 Frequency Polygons', topic: 'frequency-polygons' },
    { title: '2.14 Averages', topic: 'averages' },
    { title: '2.15 Bar Charts', topic: 'bar-charts' },
    { title: '2.16 Stem and Leaf', topic: 'stem-leaf' },
    { title: '2.17 Pie Charts', topic: 'pie-charts' }
  ];

  const grade3Topics = [
    { title: '3.1 Error Intervals', topic: 'error-intervals' },
    { title: '3.2 Fractions', topic: 'fractions-g3' },
    { title: '3.3 Estimating', topic: 'estimating' },
    { title: '3.4 Writing and Simplifying Ratio', topic: 'writing-simplifying-ratio' },
    { title: '3.5 Ratio', topic: 'ratio' },
    { title: '3.6 Proportion', topic: 'proportion' },
    { title: '3.7 Percentages', topic: 'percentages' },
    { title: '3.8 Percentage Change', topic: 'percentage-change' },
    { title: '3.9 Exchange Rates', topic: 'exchange-rates' },
    { title: '3.10 Conversions and Units', topic: 'conversions-units' },
    { title: '3.11 Scale Drawings', topic: 'scale-drawings' },
    { title: '3.12 Best Buy Questions', topic: 'best-buy' },
    { title: '3.13 Substitution', topic: 'substitution' },
    { title: '3.14 Solving Equations', topic: 'solving-equations' },
    { title: '3.15 Drawing Linear Graphs', topic: 'drawing-linear-graphs' },
    { title: '3.16 Area and Circumference of Circles', topic: 'circles' },
    { title: '3.17 Transformations', topic: 'transformations' },
    { title: '3.18 Area of Compound Shapes', topic: 'area-compound-shapes' },
    { title: '3.19 Frequency Trees', topic: 'frequency-trees' },
    { title: '3.20 Two Way Tables', topic: 'two-way-tables' }
  ];

  const grade4Topics = [
    { title: '4.1 Compound Interest and Depreciation', topic: 'compound-interest' },
    { title: '4.2 Indices', topic: 'indices' },
    { title: '4.3 Prime Factors, HCF and LCM', topic: 'prime-factors-hcf-lcm' },
    { title: '4.4 Real Life and Distance Time Graphs', topic: 'distance-time-graphs' },
    { title: '4.5 Inequalities', topic: 'inequalities' },
    { title: '4.6 Forming and Solving Equations', topic: 'forming-solving-equations' },
    { title: '4.7 Sequences (Nth Term)', topic: 'sequences-nth-term' },
    { title: '4.8 Expanding and Factorising', topic: 'expanding-factorising' },
    { title: '4.9 Pythagoras', topic: 'pythagoras' },
    { title: '4.10 Angles in Parallel Lines', topic: 'angles-parallel-lines' },
    { title: '4.11 Angles in Polygons', topic: 'angles-polygons' },
    { title: '4.12 Surface Area', topic: 'surface-area' },
    { title: '4.13 Volume of a Prism', topic: 'volume-prism' },
    { title: '4.14 Cylinders', topic: 'cylinders' },
    { title: '4.15 Loci and Construction', topic: 'loci-construction' },
    { title: '4.16 Bearings', topic: 'bearings' },
    { title: '4.17 Plans and Elevations', topic: 'plans-elevations' },
    { title: '4.18 Averages from Frequency Tables', topic: 'averages-frequency-tables' },
    { title: '4.19 Probability', topic: 'probability-g4' },
    { title: '4.20 Scatter Graphs', topic: 'scatter-graphs' }
  ];

  const grade5Topics = [
    { title: '5.1 Writing a Ratio as a Fraction or Linear Function', topic: 'ratio-fraction-function' },
    { title: '5.2 Direct and Inverse Proportion', topic: 'direct-inverse-proportion' },
    { title: '5.3 Reverse Percentages', topic: 'reverse-percentages' },
    { title: '5.4 Standard Form', topic: 'standard-form' },
    { title: '5.5 Speed and Density', topic: 'speed-density' },
    { title: '5.6 Changing the Subject of a Formula', topic: 'changing-subject-formula' },
    { title: '5.7 Expanding and Factorising Quadratics', topic: 'expanding-factorising-quadratics' },
    { title: '5.8 Solving Quadratics', topic: 'solving-quadratics' },
    { title: '5.9 Drawing Quadratic Graphs', topic: 'drawing-quadratic-graphs' },
    { title: '5.10 Drawing Other Graphs: Cubic/Reciprocal', topic: 'cubic-reciprocal-graphs' },
    { title: '5.11 Simultaneous Equations', topic: 'simultaneous-equations' },
    { title: '5.12 Solving Simultaneous Equations Graphically', topic: 'simultaneous-equations-graphically' },
    { title: '5.13 Midpoint of a Line Segment', topic: 'midpoint-line-segment' },
    { title: '5.14 Gradient of a Line', topic: 'gradient-line' },
    { title: '5.15 Equation of a Line', topic: 'equation-line' },
    { title: '5.16 Spheres and Cones', topic: 'spheres-cones' },
    { title: '5.17 Sector Areas and Arc Lengths', topic: 'sectors-arcs' },
    { title: '5.18 Similar Shapes (Lengths)', topic: 'similar-shapes-lengths' },
    { title: '5.19 SOHCAHTOA (Trigonometry)', topic: 'sohcahtoa' },
    { title: '5.20 Exact trig values', topic: 'exact-trig-values' },
    { title: '5.21 Vectors', topic: 'vectors' },
    { title: '5.22 Probability Trees', topic: 'probability-trees' },
    { title: '5.23 Venn Diagrams', topic: 'venn-diagrams' }
  ];

  const grade6Topics = [
    { title: '6.1 Recurring Decimals to Fractions', topic: 'recurring-decimals-fractions' },
    { title: '6.2 Fractional and Negative Indices', topic: 'fractional-negative-indices' },
    { title: '6.3 The Product Rule for Counting', topic: 'product-rule-counting' },
    { title: '6.4 Repeated Percentage Change', topic: 'repeated-percentage-change' },
    { title: '6.5 Expanding Triple Brackets', topic: 'expanding-triple-brackets' },
    { title: '6.6 Parallel and Perpendicular Lines', topic: 'parallel-perpendicular-lines' },
    { title: '6.7 Inequalities on Graphs', topic: 'inequalities-graphs' },
    { title: '6.8 Similar Shapes (Area and Volume)', topic: 'similar-shapes-area-volume' },
    { title: '6.9 Enlarging with Negative Scale Factors', topic: 'enlarging-negative-scale' },
    { title: '6.10 Circle Theorems', topic: 'circle-theorems' },
    { title: '6.11 Cumulative Frequency', topic: 'cumulative-frequency' },
    { title: '6.12 Box Plots', topic: 'box-plots' },
    { title: '6.13 Capture Recapture', topic: 'capture-recapture' }
  ];

  const grade7Topics = [
    { title: '7.1 Surds', topic: 'surds' },
    { title: '7.2 Bounds', topic: 'bounds' },
    { title: '7.3 Direct and Inverse Proportion', topic: 'direct-inverse-proportion-g7' },
    { title: '7.4 Quadratic Formula', topic: 'quadratic-formula' },
    { title: '7.5 Factorising Harder Quadratics', topic: 'factorising-harder-quadratics' },
    { title: '7.6 Algebraic Fractions', topic: 'algebraic-fractions' },
    { title: '7.7 Rearranging Harder Formulae', topic: 'rearranging-harder-formulae' },
    { title: '7.8 Trigonometric and Exponential Graphs', topic: 'trig-exponential-graphs' },
    { title: '7.9 Inverse and Composite Functions', topic: 'inverse-composite-functions' },
    { title: '7.10 Iteration', topic: 'iteration' },
    { title: '7.11 Finding the Area of Any Triangle', topic: 'area-any-triangle' },
    { title: '7.12 The Sine Rule', topic: 'sine-rule' },
    { title: '7.13 The Cosine Rule', topic: 'cosine-rule' },
    { title: '7.14 Congruent Triangles', topic: 'congruent-triangles' },
    { title: '7.15 3d Pythagoras and Trigonometry', topic: '3d-pythagoras-trig' },
    { title: '7.16 Histograms', topic: 'histograms' },
    { title: '7.17 Conditional Probability', topic: 'conditional-probability' }
  ];


  const topics = selectedGrade === '1' ? grade1Topics :
                 selectedGrade === '2' ? grade2Topics :
                 selectedGrade === '3' ? grade3Topics :
                 selectedGrade === '4' ? grade4Topics :
                 selectedGrade === '5' ? grade5Topics :
                 selectedGrade === '6' ? grade6Topics :
                 selectedGrade === '7' ? grade7Topics :
                 [];

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.scrollContent}>
      <View style={styles.container}>
        {!selectedGrade ? (
          <>
            <View style={styles.header}>
              <Text style={styles.title}>GCSE Maths</Text>
              <Text style={styles.subtitle}>Master Mathematics Step by Step</Text>
            </View>
            <Text style={styles.gradeTitle}>Choose Your Grade</Text>
            <View style={styles.gradeGrid}>
              {grades.map(g => (
                <TouchableOpacity 
                  key={g} 
                  style={styles.gradeBox} 
                  onPress={() => {
                    setSelectedGrade(g);
                    try {
                      if (typeof window !== 'undefined' && window.history && window.history.pushState) {
                        const state = { screen: 'home', props: { selectedGrade: g } };
                        window.history.pushState(state, '', window.location.pathname + window.location.search + `#grade${g}`);
                      }
                    } catch (_) {}
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.gradeNumber}>
                    <Text style={styles.gradeNumberText}>{g}</Text>
                  </View>
                  <Text style={styles.gradeLabel}>Grade {g}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        ) : (
          <>
            <View style={styles.topHeader}>
              <TouchableOpacity 
                style={styles.backButton} 
                onPress={() => {
                  // Use history.back() so the browser navigates to the previous
                  // history entry (e.g. the real previous screen) instead of
                  // creating a new history entry that keeps us on the same view.
                  try {
                    if (typeof window !== 'undefined' && window.history && window.history.back) {
                      window.history.back();
                    }
                  } catch (_) {}
                  setSelectedGrade(null);
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.backButtonText}>← Back</Text>
              </TouchableOpacity>
              <Text style={styles.topicPageTitle}>Grade {selectedGrade}</Text>
              <View style={{width:60}} />
            </View>

            <ScrollView style={styles.topicsContainer}>
              <View style={styles.topicsGrid}>
                {topics.map(t => (
                  <View key={t.topic} style={styles.topicCard}>
                    <Text style={styles.topicTitle}>{t.title}</Text>
                    <TouchableOpacity
                      style={styles.startButton}
                      onPress={() => onNavigate('quiz', { topic: t.topic, grade: selectedGrade })}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.startButtonText}>Start Quiz →</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </ScrollView>
          </>
        )}
      </View>
    </ScrollView>
  );
}

// Sync selected grade with URL hash and `initialGrade` prop
// so browser navigation (back/forward) can restore the grade view.
// Note: App.js pushes history state on navigate; Home updates hash/state
// when selecting or clearing a grade.
/* istanbul ignore next */
export function useHomeSync(setSelectedGrade, initialGrade) {
  React.useEffect(() => {
    // If initialGrade provided by App restore, use it
    if (initialGrade) {
      setSelectedGrade(initialGrade);
      try {
        if (typeof window !== 'undefined' && window.history && window.history.replaceState) {
          const state = { screen: 'home', props: { selectedGrade: initialGrade } };
          window.history.replaceState(state, '', window.location.pathname + window.location.search + `#grade${initialGrade}`);
        }
      } catch (_) {}
      return;
    }

    // Otherwise, check the current URL hash on mount
    try {
      if (typeof window !== 'undefined') {
        const hash = window.location.hash ? window.location.hash.replace('#','') : '';
        const m = hash.match(/^grade(\d+)$/i);
        if (m) setSelectedGrade(m[1]);
      }
    } catch (_) {}
  }, [initialGrade, setSelectedGrade]);
}


const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  scrollContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  container: {
    backgroundColor: '#fff',
    backgroundImage: 'linear-gradient(#e8f0fe 1px, transparent 1px), linear-gradient(90deg, #e8f0fe 1px, transparent 1px)',
    backgroundSize: '20px 20px',
    marginHorizontal: 16,
    padding: 24,
    borderRadius: 20,
    width: '96%',
    maxWidth: 1200,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    paddingVertical: 20,
  },
  title: {
    fontSize: 42,
    fontWeight: '800',
    color: '#000000',
    marginBottom: 8,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  gradeTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 24,
    color: '#1f2937',
    textAlign: 'center',
  },
  gradeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: '100%',
    gap: 16,
  },
  gradeBox: {
    width: 120,
    height: 140,
    backgroundColor: '#fff',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    marginHorizontal: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  gradeNumber: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  gradeNumberText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
  },
  gradeLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
  },
  topHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
  },
  backButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  topicPageTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1f2937',
  },
  topicsContainer: {
    width: '100%',
    maxHeight: 600,
  },
  topicsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
    paddingBottom: 20,
  },
  topicCard: {
    width: '23%',
    minWidth: 180,
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    minHeight: 140,
  },
  topicTitle: {
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
    color: '#1f2937',
    marginBottom: 16,
    lineHeight: 20,
  },
  startButton: {
    backgroundColor: '#000000',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    width: '100%',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
});
