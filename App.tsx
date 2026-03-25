import React from 'react';
import {useState} from 'react';
import {AppTab} from './src/components/AppBottomNav';
import {AccountScreen} from './src/screens/AccountScreen';
import {BookingsScreen} from './src/screens/BookingsScreen';
import {HomeScreen} from './src/screens/HomeScreen';
import {LoginScreen} from './src/screens/LoginScreen';
import {OwnerHomeScreen} from './src/screens/OwnerHomeScreen';
import {OwnerPropertiesScreen} from './src/screens/OwnerPropertiesScreen';
import {PropertiesScreen} from './src/screens/PropertiesScreen';
import {SignUpScreen} from './src/screens/SignUpScreen';
import {DashboardVariant} from './src/types/appFlow';

const App: React.FC = () => {
  const [screen, setScreen] = useState<'login' | 'signup' | 'home'>('login');
  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');
  const [dashboardVariant, setDashboardVariant] =
    useState<DashboardVariant>('standard');

  if (screen === 'home') {
    if (activeTab === 'properties') {
      if (dashboardVariant === 'owner') {
        return (
          <OwnerPropertiesScreen
            activeTab={activeTab}
            onTabPress={setActiveTab}
          />
        );
      }

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
            setDashboardVariant('standard');
            setActiveTab('dashboard');
            setScreen('login');
          }}
          onTabPress={setActiveTab}
        />
      );
    }

    if (dashboardVariant === 'owner') {
      return (
        <OwnerHomeScreen
          activeTab={activeTab}
          onTabPress={setActiveTab}
          onViewBookingsPress={() => setActiveTab('bookings')}
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
        onNavigateToHome={variant => {
          setDashboardVariant(variant);
          setActiveTab('dashboard');
          setScreen('home');
        }}
        onNavigateToSignIn={() => setScreen('login')}
      />
    );
  }

  return (
    <LoginScreen
      onNavigateToHome={variant => {
        setDashboardVariant(variant);
        setActiveTab('dashboard');
        setScreen('home');
      }}
      onNavigateToSignUp={() => setScreen('signup')}
    />
  );
};

export default App;
