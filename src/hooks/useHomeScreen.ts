import { getAuthSession } from '../services/authSession';

export const useHomeScreen = () => {
  const session = getAuthSession();

  const onMenuPress = () => {
    // TODO: Connect menu drawer.
  };

  const onProfilePress = () => {
    // TODO: Open profile screen.
  };

  const onBookNowPress = () => {
    // TODO: Open booking flow.
  };

  return {
    userName: session?.user.name.split(' ')[0] ?? 'Guest',
    featuredProperty: {
      title: 'Colombo House',
      description:
        "The beauty of Dreamland beach is almost similar to Bali's Balangan beach and Jimbaran's Tegal Wangi beach. Check it out",
    },
    onMenuPress,
    onProfilePress,
    onBookNowPress,
  };
};
