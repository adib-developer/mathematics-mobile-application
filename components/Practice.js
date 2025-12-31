import React, {useState} from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';

export default function Practice({onBack}){
  const [a, setA] = useState('5');
  const [b, setB] = useState('3');
  const [op, setOp] = useState('+');
  const [result, setResult] = useState(null);

  const compute = () => {
    const ai = Number(a), bi = Number(b);
    if (!Number.isFinite(ai) || !Number.isFinite(bi)) return setResult('Invalid');
    let r = 0;
    if (op === '+') r = ai + bi;
    if (op === '-') r = ai - bi;
    if (op === '*') r = ai * bi;
    if (op === '/') r = bi !== 0 ? ai / bi : '∞';
    setResult(String(r));
  };

  return (
    <View style={styles.root}>
      <Text style={styles.title}>Practice</Text>
      <View style={styles.row}>
        <TextInput style={styles.num} value={a} onChangeText={setA} keyboardType='numeric' />
        <TouchableOpacity style={styles.op} onPress={() => setOp('+')}><Text style={styles.opt}>+</Text></TouchableOpacity>
        <TouchableOpacity style={styles.op} onPress={() => setOp('-')}><Text style={styles.opt}>-</Text></TouchableOpacity>
        <TouchableOpacity style={styles.op} onPress={() => setOp('*')}><Text style={styles.opt}>×</Text></TouchableOpacity>
        <TouchableOpacity style={styles.op} onPress={() => setOp('/')}><Text style={styles.opt}>÷</Text></TouchableOpacity>
        <TextInput style={styles.num} value={b} onChangeText={setB} keyboardType='numeric' />
      </View>
      <TouchableOpacity style={styles.btn} onPress={compute}><Text style={styles.btnt}>Compute</Text></TouchableOpacity>
      {result !== null && <Text style={styles.result}>Result: {result}</Text>}
      <TouchableOpacity onPress={onBack} style={styles.link}><Text style={styles.linkt}>Back</Text></TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root:{alignItems:'center'},
  title:{fontSize:24,fontWeight:'700',marginBottom:10},
  // Use Times New Roman for question-like text to match Quiz styles
  titleText:{fontSize:24,fontWeight:'700',marginBottom:10, fontFamily: 'Times New Roman'},
  row:{flexDirection:'row',alignItems:'center',gap:8},
  num:{borderWidth:1,borderColor:'#ccc',padding:8,borderRadius:6,width:70,textAlign:'center',marginHorizontal:6},
  op:{padding:8,marginHorizontal:2,backgroundColor:'#eee',borderRadius:6},
  opt:{fontSize:18},
  btn:{backgroundColor:'#17a2b8',padding:10,borderRadius:6,marginTop:12,width:'60%'},
  btnt:{color:'#fff',textAlign:'center',fontWeight:'600'},
  result:{marginTop:12,fontSize:18},
  link:{marginTop:20},
  linkt:{color:'#007bff'}
});
