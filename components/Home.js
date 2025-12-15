import React, {useState} from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function Home({onNavigate}){
  const [selectedGrade, setSelectedGrade] = useState(null);

  const grades = ['1','2','3','4','5','6','7','8','9'];

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

  const genericTopicsFor = (g) => (
    [
      { title: `${g}.1 Topic 1`, topic: `grade-${g}-topic-1` },
      { title: `${g}.2 Topic 2`, topic: `grade-${g}-topic-2` },
      { title: `${g}.3 Topic 3`, topic: `grade-${g}-topic-3` },
      { title: `${g}.4 Topic 4`, topic: `grade-${g}-topic-4` }
    ]
  );

  const topics = selectedGrade === '1' ? grade1Topics : (selectedGrade ? genericTopicsFor(selectedGrade) : []);

  return (
    <View style={styles.root}>
      <View style={styles.container}>
        {!selectedGrade ? (
          <>
            <Text style={styles.title}>GCSE Maths</Text>
            <Text style={styles.gradeTitle}>Choose a Grade</Text>
            <View style={styles.gradeGrid}>
              {grades.map(g => (
                <TouchableOpacity key={g} style={styles.gradeBox} onPress={() => setSelectedGrade(g)}>
                  <Text style={styles.gradeLabel}>Grade {g}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        ) : (
          <>
            <View style={{width:'100%',flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
              <TouchableOpacity onPress={() => setSelectedGrade(null)}>
                <Text style={{color:'#007bff'}}>← Back</Text>
              </TouchableOpacity>
              <Text style={styles.title}>Grade {selectedGrade}</Text>
              <View style={{width:40}} />
            </View>

            <View style={styles.topicsRow}>
              {topics.map(t => (
                <View key={t.topic} style={styles.topicBox}>
                  <Text style={styles.topicTitle}>{t.title}</Text>
                  <TouchableOpacity
                    style={styles.smallBtn}
                    onPress={() => onNavigate('quiz', { topic: t.topic })}
                  >
                    <Text style={styles.smallBtnText}>Start Quiz</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            <TouchableOpacity style={styles.btn} onPress={() => setSelectedGrade(null)}>
              <Text style={styles.btnt}>Back to Grades</Text>
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity style={[styles.btn, {marginTop:12}]} onPress={() => onNavigate('calculator')}>
          <Text style={styles.btnt}>Calculator</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  root:{alignItems:'center', paddingHorizontal:12},
  container:{backgroundColor:'#fff', marginVertical:6, marginHorizontal:12, padding:16, borderRadius:10, width:'96%', maxWidth:1000, alignSelf:'center', alignItems:'center'},
  title:{fontSize:28,fontWeight:'700',marginBottom:20},
  gradeTitle:{fontSize:24,fontWeight:'700',marginTop:10,marginBottom:14},
  sectionTitle:{fontSize:18,fontWeight:'600',marginTop:15,marginBottom:10,color:'#333'},
  topicsRow:{flexDirection:'row',width:'100%',justifyContent:'space-between',flexWrap:'wrap',alignContent:'flex-start'},
  topicBox:{width:'23%',minWidth:140,backgroundColor:'#f6f8fb',padding:12,borderRadius:8,alignItems:'center',justifyContent:'center',marginBottom:12},
  topicTitle:{fontSize:20,fontWeight:'800',textAlign:'center',marginBottom:10},
  smallBtn:{backgroundColor:'#007bff',paddingVertical:10,paddingHorizontal:14,borderRadius:8},
  smallBtnText:{color:'#fff',fontSize:14,fontWeight:'700',textAlign:'center'},
  btn:{backgroundColor:'#007bff',padding:14,borderRadius:8,marginVertical:8,width:'80%',marginTop:10},
  btnt:{color:'#fff',textAlign:'center',fontWeight:'600'},
  gradeSectionTitle:{fontSize:18,fontWeight:'700',marginTop:18,marginBottom:8},
  gradeGrid:{flexDirection:'row',flexWrap:'wrap',justifyContent:'space-between',width:'100%'},
  gradeBox:{width:'23%',minWidth:100,backgroundColor:'#fff',padding:10,borderRadius:8,alignItems:'center',justifyContent:'center',borderWidth:1,borderColor:'#ddd',marginBottom:12},
  gradeLabel:{fontSize:16,fontWeight:'700',marginBottom:8}
});
