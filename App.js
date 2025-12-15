import React, {useState} from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Home from './components/Home';
import Quiz from './components/Quiz';
import Practice from './components/Practice';
import Calculator from './components/Calculator';

export default function App(){
  const [screen, setScreen] = useState('home');
  const [props, setProps] = useState({});

  const navigate = (to, p = {}) => { setProps(p); setScreen(to); };

  return (
    <View style={styles.container}>
      {screen === 'home' && <Home onNavigate={navigate} />}
      {screen === 'quiz' && <Quiz onBack={() => navigate('home')} topic={props.topic} />}
      {screen === 'practice' && <Practice onBack={() => navigate('home')} />}
      {screen === 'calculator' && <Calculator onBack={() => navigate('home')} />}
      <Text style={styles.footer}>Simple Maths App • Demo</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, paddingTop:50, backgroundColor:'#f0f0f0' },
  footer:{textAlign:'center', padding:8, color:'#666'}
});
