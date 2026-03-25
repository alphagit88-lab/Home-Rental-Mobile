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
import {OwnerPropertyDetailsScreen} from './src/screens/OwnerPropertyDetailsScreen';
import {OwnerPropertiesScreen} from './src/screens/OwnerPropertiesScreen';
import {PropertiesScreen} from './src/screens/PropertiesScreen';
import {SignUpScreen} from './src/screens/SignUpScreen';
import {DashboardVariant} from './src/types/appFlow';
import {clearAuthSession} from './src/services/authSession';

const App: React.FC = () => {
  const [screen, setScreen] = useState<'login' | 'signup' | 'home'>('login');
  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');
  const [dashboardVariant, setDashboardVariant] =
    useState<DashboardVariant>('standard');
  const [ownerPropertiesView, setOwnerPropertiesView] = useState<
    'list' | 'create' | 'detail' | 'edit'
  >('list');
  const [selectedOwnerPropertyTitle, setSelectedOwnerPropertyTitle] =
    useState('Colombo Lux House');

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
              onSubmitPress={() => setOwnerPropertiesView('list')}
              onTabPress={handleTabPress}
            />
          );
        }

        if (ownerPropertiesView === 'edit') {
          return (
            <OwnerAddPropertyScreen
              activeTab={activeTab}
              headerTitle="Edit Property"
              onBackPress={() => setOwnerPropertiesView('detail')}
              onSubmitPress={() => setOwnerPropertiesView('detail')}
              onTabPress={handleTabPress}
              submitLabel="SAVE PROPERTY"
            />
          );
        }

        if (ownerPropertiesView === 'detail') {
          return (
            <OwnerPropertyDetailsScreen
              activeTab={activeTab}
              onBackPress={() => setOwnerPropertiesView('list')}
              onEditPropertyPress={() => setOwnerPropertiesView('edit')}
              onTabPress={handleTabPress}
              propertyTitle={selectedOwnerPropertyTitle}
            />
          );
        }

        return (
          <OwnerPropertiesScreen
            activeTab={activeTab}
            onAddNewPropertyPress={() => setOwnerPropertiesView('create')}
            onViewPropertyPress={title => {
              setSelectedOwnerPropertyTitle(title);
              setOwnerPropertiesView('detail');
            }}
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
            clearAuthSession();
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
