import { useWindowDimensions } from 'react-native';

export const useResponsive = () => {
  const { width, height } = useWindowDimensions();

  const isTablet = width >= 768;
  const isSmallPhone = width < 360 || height < 700;
  const isVerySmallPhone = width < 340;

  return {
    width,
    height,
    isTablet,
    isSmallPhone,
    isVerySmallPhone,
    maxContentWidth: isTablet ? 520 : 440,
    heroHeight: isTablet ? 420 : isSmallPhone ? 300 : 360,
    horizontalPadding: isTablet ? 36 : isSmallPhone ? 20 : 24,
    formTopPadding: isTablet ? 30 : 24,
    formBottomPadding: isTablet ? 40 : 28,
    heroGreetingSize: isTablet ? 42 : isSmallPhone ? 32 : 35,
    heroTitleSize: isTablet ? 34 : isSmallPhone ? 26 : 30,
    heroTaglineSize: isTablet ? 20 : isSmallPhone ? 15 : 17,
    sectionTitleSize: isTablet ? 24 : 20,
    bodySize: isTablet ? 15 : 14,
    buttonHeight: 56,
    inputHeight: isTablet ? 60 : 56,
  };
};
