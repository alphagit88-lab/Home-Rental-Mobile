import React from 'react';
import { useState } from 'react';
import { HomeScreen } from './src/screens/HomeScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { SignUpScreen } from './src/screens/SignUpScreen';

const App: React.FC = () => {
  const [screen, setScreen] = useState<'login' | 'signup' | 'home'>('login');

  if (screen === 'home') {
    return <HomeScreen />;
  }

  if (screen === 'signup') {
    return (
      <SignUpScreen
        onNavigateToHome={() => setScreen('home')}
        onNavigateToSignIn={() => setScreen('login')}
      />
    );
  }

  return <LoginScreen onNavigateToSignUp={() => setScreen('signup')} />;
};

export default App;
