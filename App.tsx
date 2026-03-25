import React from 'react';
import {useState} from 'react';
import {AppTab} from './src/components/AppBottomNav';
import {AccountScreen} from './src/screens/AccountScreen';
import {BookingsScreen} from './src/screens/BookingsScreen';
import {HomeScreen} from './src/screens/HomeScreen';
import {LoginScreen} from './src/screens/LoginScreen';
import {OwnerAddPropertyScreen} from './src/screens/OwnerAddPropertyScreen';
import {OwnerBookingsScreen} from './src/screens/OwnerBookingsScreen';
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
  const [ownerPropertiesView, setOwnerPropertiesView] = useState<'list' | 'create'>(
    'list',
  );

  const handleTabPress = (tab: AppTab) => {
    if (tab !== 'properties') {
      setOwnerPropertiesView('list');
    }

    setActiveTab(tab);
  };

  if (screen === 'home') {
    if (activeTab === 'properties') {
      if (dashboardVariant === 'owner') {
        if (ownerPropertiesView === 'create') {
          return (
            <OwnerAddPropertyScreen
              activeTab={activeTab}
              onBackPress={() => setOwnerPropertiesView('list')}
              onTabPress={handleTabPress}
            />
          );
        }

        return (
          <OwnerPropertiesScreen
            activeTab={activeTab}
            onAddNewPropertyPress={() => setOwnerPropertiesView('create')}
            onTabPress={handleTabPress}
          />
        );
      }

      return (
        <PropertiesScreen activeTab={activeTab} onTabPress={handleTabPress} />
      );
    }

    if (activeTab === 'bookings') {
      if (dashboardVariant === 'owner') {
        return (
          <OwnerBookingsScreen
            activeTab={activeTab}
            onTabPress={handleTabPress}
          />
        );
      }

      return (
        <BookingsScreen
          activeTab={activeTab}
          onSearchPress={() => setActiveTab('properties')}
          onTabPress={handleTabPress}
        />
      );
    }

    if (activeTab === 'account') {
      return (
        <AccountScreen
          activeTab={activeTab}
          onLogout={() => {
            setDashboardVariant('standard');
            setOwnerPropertiesView('list');
            setActiveTab('dashboard');
            setScreen('login');
          }}
          onTabPress={handleTabPress}
        />
      );
    }

    if (dashboardVariant === 'owner') {
      return (
        <OwnerHomeScreen
          activeTab={activeTab}
          onTabPress={handleTabPress}
          onViewBookingsPress={() => setActiveTab('bookings')}
        />
      );
    }

    return (
      <HomeScreen
        activeTab={activeTab}
        onSearchPress={() => setActiveTab('properties')}
        onTabPress={handleTabPress}
      />
    );
  }

  if (screen === 'signup') {
    return (
      <SignUpScreen
        onNavigateToHome={variant => {
          setDashboardVariant(variant);
          setOwnerPropertiesView('list');
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
        setOwnerPropertiesView('list');
        setActiveTab('dashboard');
        setScreen('home');
      }}
      onNavigateToSignUp={() => setScreen('signup')}
    />
  );
};

export default App;
