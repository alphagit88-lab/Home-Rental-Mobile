import { getAuthSession } from '../services/authSession';

export const useHomeScreen = () => {
  const session = getAuthSession();

  const onMenuPress = () => {
    // TODO: Connect menu drawer.
  };

  const onProfilePress = () => {
    // TODO: Open profile screen.
  };

  return {
    userName: session?.user.name.split(' ')[0] ?? 'Guest',
    onMenuPress,
    onProfilePress,
  };
};
