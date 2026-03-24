import React from 'react';
import {useState} from 'react';
import {AppTab} from './src/components/AppBottomNav';
import {AccountScreen} from './src/screens/AccountScreen';
import {BookingsScreen} from './src/screens/BookingsScreen';
import {HomeScreen} from './src/screens/HomeScreen';
import {LoginScreen} from './src/screens/LoginScreen';
import {PropertiesScreen} from './src/screens/PropertiesScreen';
import {SignUpScreen} from './src/screens/SignUpScreen';

const App: React.FC = () => {
  const [screen, setScreen] = useState<'login' | 'signup' | 'home'>('login');
  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');

  if (screen === 'home') {
    if (activeTab === 'properties') {
      return (
        <PropertiesScreen activeTab={activeTab} onTabPress={setActiveTab} />
      );
    }

    if (activeTab === 'bookings') {
      return (
        <BookingsScreen
          activeTab={activeTab}
          onSearchPress={() => setActiveTab('properties')}
          onTabPress={setActiveTab}
        />
      );
    }

    if (activeTab === 'account') {
      return (
        <AccountScreen
          activeTab={activeTab}
          onLogout={() => {
            setActiveTab('dashboard');
            setScreen('login');
          }}
          onTabPress={setActiveTab}
        />
      );
    }

    return (
      <HomeScreen
        activeTab={activeTab}
        onSearchPress={() => setActiveTab('properties')}
        onTabPress={setActiveTab}
      />
    );
  }

  if (screen === 'signup') {
    return (
      <SignUpScreen
        onNavigateToHome={() => {
          setActiveTab('dashboard');
          setScreen('home');
        }}
        onNavigateToSignIn={() => setScreen('login')}
      />
    );
  }

  return <LoginScreen onNavigateToSignUp={() => setScreen('signup')} />;
};

export default App;
