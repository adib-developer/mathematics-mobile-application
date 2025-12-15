import React, {useState} from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';

export default function Calculator({onBack}){
  const [expr, setExpr] = useState('');
  const [out, setOut] = useState('');

  const evaluate = () => {
    try{
      // very small sandbox: only allow digits, operators and spaces
      if (!/^[0-9+\-*/. ()]*$/.test(expr)) return setOut('Invalid characters');
      // eslint-disable-next-line no-eval
      const r = eval(expr);
      setOut(String(r));
    }catch(e){ setOut('Error'); }
  };

  return (
    <View style={styles.root}>
      <Text style={styles.title}>Calculator</Text>
      <TextInput style={styles.input} value={expr} onChangeText={setExpr} placeholder='Enter expression e.g. 12 / (3+1)' />
      <TouchableOpacity style={styles.btn} onPress={evaluate}><Text style={styles.btnt}>Evaluate</Text></TouchableOpacity>
      <Text style={styles.output}>{out}</Text>
      <TouchableOpacity onPress={onBack} style={styles.link}><Text style={styles.linkt}>Back</Text></TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root:{alignItems:'center'},
  title:{fontSize:24,fontWeight:'700',marginBottom:10},
  input:{borderWidth:1,borderColor:'#ccc',width:'90%',padding:8,borderRadius:6,textAlign:'left'},
  btn:{backgroundColor:'#6f42c1',padding:10,borderRadius:6,marginTop:10,width:'60%'},
  btnt:{color:'#fff',textAlign:'center',fontWeight:'600'},
  output:{marginTop:12,fontSize:20},
  link:{marginTop:20},
  linkt:{color:'#007bff'}
});
