export const useHomeScreen = () => {
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
    userName: 'Mirah',
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
