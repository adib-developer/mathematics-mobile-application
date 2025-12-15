import React, {useEffect, useState} from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Home from './components/Home';
import Quiz from './components/Quiz';
import Practice from './components/Practice';
import Calculator from './components/Calculator';
import Pictogram from './components/Pictogram';

export default function App(){
  const [screen, setScreen] = useState('home');
  const [props, setProps] = useState({});

  const STORAGE_KEY = 'maths-mobile-app.route';

  const persist = (route, p = {}) => {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({screen: route, props: p}));
      }
    } catch (_) {}
  };

  const restore = () => {
    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && parsed.screen) {
            setScreen(parsed.screen);
            setProps(parsed.props || {});
          }
        }
      }
    } catch (_) {}
  };

  useEffect(() => { restore(); }, []);

  const navigate = (to, p = {}) => { setProps(p); setScreen(to); persist(to, p); };

  return (
    <View style={styles.container}>
      {screen === 'home' && <Home onNavigate={navigate} />}
      {screen === 'quiz' && <Quiz onBack={() => navigate('home')} topic={props.topic} />}
      {screen === 'practice' && <Practice onBack={() => navigate('home')} />}
      {screen === 'calculator' && <Calculator onBack={() => navigate('home')} />}
      {screen === 'pictogram' && (
        <Pictogram
          onBack={() => navigate('home')}
          title={props.title}
          subtitle={props.subtitle}
          keyValue={props.keyValue}
          tallyData={props.tallyData}
          pictogramData={props.pictogramData}
        />
      )}
      <Text style={styles.footer}>Simple Maths App • Demo</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, paddingTop:50, backgroundColor:'#f0f0f0' },
  footer:{textAlign:'center', padding:8, color:'#666'}
});
