import React from 'react';
import { useState } from 'react';
import { LoginScreen } from './src/screens/LoginScreen';
import { SignUpScreen } from './src/screens/SignUpScreen';

const App: React.FC = () => {
  const [screen, setScreen] = useState<'login' | 'signup'>('login');

  if (screen === 'signup') {
    return <SignUpScreen onNavigateToSignIn={() => setScreen('login')} />;
  }

  return <LoginScreen onNavigateToSignUp={() => setScreen('signup')} />;
};

export default App;
