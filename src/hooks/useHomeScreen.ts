import { useState } from 'react';

export type HomeTab = 'dashboard' | 'properties' | 'bookings' | 'account';

export const useHomeScreen = () => {
  const [activeTab, setActiveTab] = useState<HomeTab>('dashboard');

  const onMenuPress = () => {
    // TODO: Connect menu drawer.
  };

  const onProfilePress = () => {
    // TODO: Open profile screen.
  };

  const onSearchPress = () => {
    // TODO: Open property search.
  };

  const onBookNowPress = () => {
    // TODO: Open booking flow.
  };

  const onTabPress = (tab: HomeTab) => {
    setActiveTab(tab);
    // TODO: Open the selected tab screen.
  };

  return {
    activeTab,
    userName: 'Mirah',
    featuredProperty: {
      title: 'Colombo House',
      description:
        "The beauty of Dreamland beach is almost similar to Bali's Balangan beach and Jimbaran's Tegal Wangi beach. Check it out",
    },
    onMenuPress,
    onProfilePress,
    onSearchPress,
    onBookNowPress,
    onTabPress,
  };
};
