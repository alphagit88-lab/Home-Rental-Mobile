import React, {useEffect, useState} from 'react';
import {ActivityIndicator, SafeAreaView, StyleSheet} from 'react-native';
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
import {ServiceProviderHomeScreen} from './src/screens/ServiceProviderHomeScreen';
import {ServiceProviderMapScreen} from './src/screens/ServiceProviderMapScreen';
import {ServiceProviderRequestsScreen} from './src/screens/ServiceProviderRequestsScreen';
import {clearAuthSession, restoreAuthSession} from './src/services/authSession';
import {PropertyRecord} from './src/services/properties';
import {SignUpScreen} from './src/screens/SignUpScreen';
import {colors} from './src/theme';
import {DashboardVariant, getDashboardVariantForRole} from './src/types/appFlow';

const App: React.FC = () => {
  const [screen, setScreen] = useState<'loading' | 'login' | 'signup' | 'home'>(
    'loading',
  );
  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');
  const [dashboardVariant, setDashboardVariant] =
    useState<DashboardVariant>('standard');
  const [accountView, setAccountView] = useState<'list' | 'editProfile'>('list');
  const [ownerPropertiesView, setOwnerPropertiesView] = useState<
    'list' | 'create' | 'detail' | 'edit'
  >('list');
  const [selectedOwnerProperty, setSelectedOwnerProperty] =
    useState<PropertyRecord | null>(null);

  const navigateToHome = (variant: DashboardVariant) => {
    setDashboardVariant(variant);
    setAccountView('list');
    setOwnerPropertiesView('list');
    setSelectedOwnerProperty(null);
    setActiveTab('dashboard');
    setScreen('home');
  };

  useEffect(() => {
    let isMounted = true;

    const initializeApp = async () => {
      try {
        const session = await restoreAuthSession();

        if (!isMounted) {
          return;
        }

        if (session) {
          setDashboardVariant(getDashboardVariantForRole(session.user.role));
          setAccountView('list');
          setOwnerPropertiesView('list');
          setSelectedOwnerProperty(null);
          setActiveTab('dashboard');
          setScreen('home');
          return;
        }

        setScreen('login');
      } catch {
        if (isMounted) {
          setScreen('login');
        }
      }
    };

    void initializeApp();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleTabPress = (tab: AppTab) => {
    if (tab !== 'properties') {
      setOwnerPropertiesView('list');
    }

    if (tab !== 'account') {
      setAccountView('list');
    }

    setActiveTab(tab);
  };

  if (screen === 'loading') {
    return (
      <SafeAreaView style={styles.loadingScreen}>
        <ActivityIndicator color={colors.primary} size="large" />
      </SafeAreaView>
    );
  }

  if (screen === 'home') {
    if (activeTab === 'properties') {
      if (dashboardVariant === 'serviceProvider') {
        return (
          <ServiceProviderMapScreen
            activeTab={activeTab}
            onTabPress={handleTabPress}
          />
        );
      }

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
      if (dashboardVariant === 'serviceProvider') {
        return (
          <ServiceProviderRequestsScreen
            activeTab={activeTab}
            onTabPress={handleTabPress}
          />
        );
      }

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
            void clearAuthSession();
            setAccountView('list');
            setDashboardVariant('standard');
            setOwnerPropertiesView('list');
            setSelectedOwnerProperty(null);
            setActiveTab('dashboard');
            setScreen('login');
          }}
          onTabPress={handleTabPress}
        />
      );
    }

    if (dashboardVariant === 'serviceProvider') {
      return (
        <ServiceProviderHomeScreen
          activeTab={activeTab}
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
        onNavigateToHome={navigateToHome}
        onNavigateToSignIn={() => setScreen('login')}
      />
    );
  }

  return (
    <LoginScreen
      onNavigateToHome={navigateToHome}
      onNavigateToSignUp={() => setScreen('signup')}
    />
  );
};

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});

export default App;
