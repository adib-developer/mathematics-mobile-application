import React, {useEffect, useState, Component} from 'react';
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

  // Use sessionStorage so state persists across reloads but is cleared
  // when the tab/window is closed (matches user's preference).
  const persist = (route, p = {}) => {
    try {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify({screen: route, props: p}));
      }
    } catch (_) {}
  };

  const restore = () => {
    try {
      // Prefer URL hash when present: #gradeN or #home
      if (typeof window !== 'undefined' && window.location && window.location.hash) {
        const hash = window.location.hash.replace('#','');
        const gradeMatch = hash.match(/^grade(\d+)$/i);
        if (gradeMatch) {
          setScreen('home');
          setProps({ selectedGrade: gradeMatch[1] });
          return;
        }
        if (hash === 'home') {
          // Clear any persisted selection
          try { sessionStorage.removeItem(STORAGE_KEY); } catch (_) {}
          setScreen('home');
          setProps({});
          return;
        }
        // If hash corresponds to other screens, use it
        const allowedScreens = new Set(['home','quiz','practice','calculator','pictogram']);
        if (hash && allowedScreens.has(hash)) {
          // If the hash is 'quiz' we may have the topic stored in sessionStorage
          // (history state is lost across reloads in some browsers). Prefer
          // restoring props from sessionStorage when available.
          let restoredProps = {};
          try {
            const raw = sessionStorage.getItem(STORAGE_KEY);
            if (raw) {
              const parsed = JSON.parse(raw);
              if (parsed && parsed.props) restoredProps = parsed.props;
            }
          } catch (_) {}
          setScreen(hash);
          setProps(restoredProps || {});
          return;
        }
      }

      if (typeof sessionStorage !== 'undefined') {
        const raw = sessionStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          // Only restore if the saved screen is one we still support.
          const allowedScreens = new Set(['home', 'quiz', 'practice', 'calculator', 'pictogram']);
          if (parsed && parsed.screen && allowedScreens.has(parsed.screen)) {
            setScreen(parsed.screen);
            setProps(parsed.props || {});
          } else {
            // Stored route is invalid (e.g. removed grades) — clear it and
            // ensure the app starts at the main menu.
            try { sessionStorage.removeItem(STORAGE_KEY); } catch (_) {}
            setScreen('home');
            setProps({});
          }
        }
      }
    } catch (_) {}
  };

  // Restore persisted route from sessionStorage (persists across reloads
  // but is cleared when the tab is closed). This preserves the user's
  // location when they reload the tab, while still discarding state on
  // tab/window close.
  useEffect(() => {
    // Restore app route from sessionStorage
    restore();

    // Initialize history state for single-page navigation. Replace the
    // current entry so popstate events include our route object.
    try {
      if (typeof window !== 'undefined' && window.history && window.history.replaceState) {
        const current = { screen, props };
        window.history.replaceState(current, '', window.location.pathname + window.location.search + (window.location.hash || `#${current.screen}`));
      }
    } catch (_) {}

    // Handle browser back/forward buttons to navigate within the app.
    const onPop = (ev) => {
      try {
        const st = ev.state;
        if (st && st.screen) {
          setProps(st.props || {});
          setScreen(st.screen);
          // Persist the popped state to sessionStorage so reloads reflect it
          try { persist(st.screen, st.props || {}); } catch (_) {}
        } else if (typeof window !== 'undefined') {
          // Fallback to hash parsing when state is not available
          const hash = window.location.hash ? window.location.hash.replace('#','') : null;
          if (hash) {
            setScreen(hash);
            try { persist(hash, {}); } catch (_) {}
          } else {
            setScreen('home');
            setProps({});
            try { sessionStorage.removeItem(STORAGE_KEY); } catch(_){}
          }
        }
      } catch (_) {}
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('popstate', onPop);
    }

    return () => {
      try { if (typeof window !== 'undefined') window.removeEventListener('popstate', onPop); } catch (_) {}
    };
  }, []);

  const navigate = (to, p = {}) => {
    setProps(p);
    setScreen(to);
    persist(to, p);
    try {
      if (typeof window !== 'undefined' && window.history && window.history.pushState) {
        const state = { screen: to, props: p };
        // Update URL hash for readability and push history state
        window.history.pushState(state, '', window.location.pathname + window.location.search + `#${to}`);
      }
    } catch (_) {}
  };

  return (
    <ErrorBoundary>
    <View style={styles.container}>
      {screen === 'home' && <Home onNavigate={navigate} initialGrade={props.selectedGrade ?? null} />}
      {screen === 'quiz' && <Quiz onBack={() => navigate('home', { selectedGrade: props.grade })} topic={props.topic} />}
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
    </ErrorBoundary>
  );
}

class ErrorBoundary extends Component {
  constructor(props){
    super(props);
    this.state = { error: null, info: null };
  }

  componentDidCatch(error, info){
    this.setState({ error, info });
    // Also log to console
    console.error('ErrorBoundary caught error:', error, info);
  }

  render(){
    if (this.state.error) {
      const err = this.state.error;
      const info = this.state.info;
      return (
        <View style={{padding:20}}>
          <Text style={{fontSize:20,fontWeight:'700',marginBottom:8}}>Application Error</Text>
          <Text style={{color:'#900',marginBottom:8}}>{err && err.toString()}</Text>
          <Text style={{fontFamily:'monospace'}}>{info && info.componentStack}</Text>
          <Text style={{marginTop:12,color:'#333'}}>Session storage:</Text>
          <Text style={{fontFamily:'monospace'}}>{(() => { try { return JSON.stringify(sessionStorage || {}, null, 2); } catch(e){ return String(e); } })()}</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: { 
    flex:1, 
    backgroundColor:'#f0f0f0',
  },
  footer:{textAlign:'center', padding:8, color:'#666'}
});
