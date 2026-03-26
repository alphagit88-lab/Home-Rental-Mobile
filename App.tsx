import React from 'react';
import {useState} from 'react';
import {AppTab} from './src/components/AppBottomNav';
import {AccountScreen} from './src/screens/AccountScreen';
import {BookingsScreen} from './src/screens/BookingsScreen';
import {EditProfileScreen} from './src/screens/EditProfileScreen';
import {HomeScreen} from './src/screens/HomeScreen';
import {LoginScreen} from './src/screens/LoginScreen';
import {OwnerAddPropertyScreen} from './src/screens/OwnerAddPropertyScreen';
import {OwnerBookingsScreen} from './src/screens/OwnerBookingsScreen';
import {OwnerHomeScreen} from './src/screens/OwnerHomeScreen';
import {OwnerPropertyDetailsScreen} from './src/screens/OwnerPropertyDetailsScreen';
import {OwnerPropertiesScreen} from './src/screens/OwnerPropertiesScreen';
import {PropertiesScreen} from './src/screens/PropertiesScreen';
import {PropertyRecord} from './src/services/properties';
import {SignUpScreen} from './src/screens/SignUpScreen';
import {DashboardVariant} from './src/types/appFlow';
import {clearAuthSession} from './src/services/authSession';

const App: React.FC = () => {
  const [screen, setScreen] = useState<'login' | 'signup' | 'home'>('login');
  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');
  const [dashboardVariant, setDashboardVariant] =
    useState<DashboardVariant>('standard');
  const [accountView, setAccountView] = useState<'list' | 'editProfile'>('list');
  const [ownerPropertiesView, setOwnerPropertiesView] = useState<
    'list' | 'create' | 'detail' | 'edit'
  >('list');
  const [selectedOwnerProperty, setSelectedOwnerProperty] =
    useState<PropertyRecord | null>(null);

  const handleTabPress = (tab: AppTab) => {
    if (tab !== 'properties') {
      setOwnerPropertiesView('list');
    }

    if (tab !== 'account') {
      setAccountView('list');
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
              onPropertySaved={() => setOwnerPropertiesView('list')}
              onTabPress={handleTabPress}
            />
          );
        }

        if (ownerPropertiesView === 'edit' && selectedOwnerProperty) {
          return (
            <OwnerAddPropertyScreen
              activeTab={activeTab}
              headerTitle="Edit Property"
              mode="edit"
              onBackPress={() => setOwnerPropertiesView('detail')}
              onPropertySaved={property => {
                setSelectedOwnerProperty(property);
                setOwnerPropertiesView('detail');
              }}
              onTabPress={handleTabPress}
              property={selectedOwnerProperty}
              submitLabel="SAVE PROPERTY"
            />
          );
        }

        if (ownerPropertiesView === 'detail' && selectedOwnerProperty) {
          return (
            <OwnerPropertyDetailsScreen
              activeTab={activeTab}
              onBackPress={() => setOwnerPropertiesView('list')}
              onEditPropertyPress={() => setOwnerPropertiesView('edit')}
              property={selectedOwnerProperty}
              onTabPress={handleTabPress}
            />
          );
        }

        return (
          <OwnerPropertiesScreen
            activeTab={activeTab}
            onAddNewPropertyPress={() => setOwnerPropertiesView('create')}
            onViewPropertyPress={property => {
              setSelectedOwnerProperty(property);
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
      if (accountView === 'editProfile') {
        return (
          <EditProfileScreen
            activeTab={activeTab}
            onBackPress={() => setAccountView('list')}
            onProfileSaved={() => setAccountView('list')}
            onTabPress={handleTabPress}
          />
        );
      }

      return (
        <AccountScreen
          activeTab={activeTab}
          onEditProfile={() => setAccountView('editProfile')}
          onLogout={() => {
            clearAuthSession();
            setAccountView('list');
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
          setAccountView('list');
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
        setAccountView('list');
        setOwnerPropertiesView('list');
        setActiveTab('dashboard');
        setScreen('home');
      }}
      onNavigateToSignUp={() => setScreen('signup')}
    />
  );
};

export default App;
