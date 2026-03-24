import React from 'react';
import {
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import MenuIcon from '../assets/images/menu 1.svg';
import ProfilePic from '../assets/images/profile_pic.svg';
import HeroBackground from '../assets/images/Untitled design (3) 1.svg';
import HeroBackdrop from '../assets/images/Rectangle 7.svg';
import CardImage from '../assets/images/Rectangle 3.4.svg';
import StarIcon from '../assets/images/Star.svg';
import {AppBottomNav, AppTab} from '../components/AppBottomNav';
import {useHomeScreen} from '../hooks/useHomeScreen';
import {useResponsive} from '../hooks/useResponsive';
import {colors, fonts, radii, spacing} from '../theme';

type BookingsScreenProps = {
  activeTab: AppTab;
  onSearchPress?: () => void;
  onTabPress: (tab: AppTab) => void;
};

const bookingCards = [
  {
    id: 'cozy-house',
    title: 'Cozy House',
    rating: '3.9',
    reviews: 'Reviews (200)',
    bookedOn: '23 July 2026',
  },
  {
    id: 'colombo-lux',
    title: 'Colombo Lux',
    rating: '4.3',
    reviews: 'Reviews (150)',
    bookedOn: '18 March 2026',
  },
  {
    id: 'resort',
    title: 'Resort',
    rating: '3.9',
    reviews: 'Reviews (200)',
    bookedOn: '8 March 2026',
  },
];

export const BookingsScreen: React.FC<BookingsScreenProps> = ({
  activeTab,
  onSearchPress,
  onTabPress,
}) => {
  const responsive = useResponsive();
  const home = useHomeScreen();
  const topInset = Platform.OS === 'android' ? spacing.xs : spacing.md;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <View style={styles.root}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingHorizontal: responsive.horizontalPadding,
              paddingTop: topInset,
            },
          ]}
          showsVerticalScrollIndicator={false}>
          <View
            style={[
              styles.contentWidth,
              {maxWidth: responsive.maxContentWidth},
            ]}>
            <View style={styles.headerRow}>
              <Pressable
                accessibilityRole="button"
                onPress={home.onMenuPress}
                style={styles.iconButton}>
                <MenuIcon height={22} width={32} />
              </Pressable>

              <Pressable
                accessibilityRole="button"
                onPress={home.onProfilePress}
                style={styles.profileButton}>
                <Text
                  style={styles.profileLabel}>{`Hello ${home.userName}.`}</Text>
                <View style={styles.profileImageWrap}>
                  <ProfilePic height="100%" width="100%" />
                </View>
              </Pressable>
            </View>

            <View style={styles.heroCard}>
              <HeroBackground
                height="100%"
                preserveAspectRatio="xMidYMid slice"
                style={styles.heroImage}
                width="100%"
              />
              <View style={styles.heroOverlay} />
              <HeroBackdrop
                height={118}
                style={styles.heroTextBackdrop}
                width="88%"
              />

              <View style={styles.heroContent}>
                <Text
                  style={
                    styles.heroGreeting
                  }>{`Hello, ${home.userName}.`}</Text>
                <Text style={styles.heroTitle}>Welcome to Home Rent</Text>
              </View>

              <Pressable
                accessibilityRole="button"
                onPress={onSearchPress}
                style={styles.searchButton}>
                <Text style={styles.searchButtonText}>Search Properties</Text>
              </Pressable>
            </View>

            <View style={styles.bookingList}>
              {bookingCards.map(card => (
                <BookingCard
                  key={card.id}
                  bookedOn={card.bookedOn}
                  rating={card.rating}
                  reviews={card.reviews}
                  title={card.title}
                />
              ))}
            </View>
          </View>
        </ScrollView>

        <AppBottomNav activeTab={activeTab} onTabPress={onTabPress} />
      </View>
    </SafeAreaView>
  );
};

type BookingCardProps = {
  bookedOn: string;
  rating: string;
  reviews: string;
  title: string;
};

const BookingCard: React.FC<BookingCardProps> = ({
  bookedOn,
  rating,
  reviews,
  title,
}) => {
  return (
    <View style={styles.bookingCard}>
      <View style={styles.bookingImageWrap}>
        <CardImage
          height="100%"
          preserveAspectRatio="xMidYMid slice"
          style={styles.bookingImage}
          width="100%"
        />
      </View>

      <View style={styles.bookingBody}>
        <Text style={styles.bookingTitle}>{title}</Text>

        <View style={styles.ratingRow}>
          <View style={styles.ratingWrap}>
            <StarIcon height={13} width={13} />
            <Text style={styles.ratingText}>{rating}</Text>
          </View>
          <Text style={styles.reviewsText}>{reviews}</Text>
        </View>

        <Text style={styles.bookedOnText}>
          Booked on : <Text style={styles.bookedOnStrong}>{bookedOn}</Text>
        </Text>

        <View style={styles.bookingFooter}>
          <Text style={styles.bookingPrice}>LKR 25K</Text>

          <Pressable accessibilityRole="button" style={styles.viewButton}>
            <Text style={styles.viewButtonText}>View</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  root: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingBottom: 142,
  },
  contentWidth: {
    width: '100%',
    alignSelf: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm + 6,
  },
  iconButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  profileImageWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    backgroundColor: '#ECECEC',
  },
  profileLabel: {
    color: colors.textPrimary,
    fontFamily: fonts.medium,
    fontSize: 13,
  },
  heroCard: {
    height: 220,
    borderRadius: radii.lg,
    overflow: 'hidden',
    marginBottom: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(23, 20, 18, 0.34)',
  },
  heroTextBackdrop: {
    position: 'absolute',
    top: 26,
    opacity: 0.42,
  },
  heroContent: {
    position: 'absolute',
    top: 56,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    zIndex: 2,
  },
  heroGreeting: {
    color: colors.white,
    fontFamily: fonts.heavy,
    fontSize: 26,
    lineHeight: 32,
    textAlign: 'center',
    marginBottom: 2,
  },
  heroTitle: {
    color: colors.white,
    fontFamily: fonts.regular,
    fontSize: 18,
    textAlign: 'center',
  },
  searchButton: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    bottom: spacing.lg,
    minHeight: 52,
    borderRadius: radii.md,
    backgroundColor: '#FFF3E3',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  searchButtonText: {
    color: colors.primary,
    fontFamily: fonts.heavy,
    fontSize: 16,
  },
  bookingList: {
    marginTop: 2,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E2DA',
  },
  bookingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md - 2,
    borderTopWidth: 1,
    borderTopColor: '#E8E2DA',
  },
  bookingImageWrap: {
    width: 74,
    height: 64,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#E4DED8',
    marginRight: spacing.sm + 2,
  },
  bookingImage: {
    ...StyleSheet.absoluteFillObject,
  },
  bookingBody: {
    flex: 1,
  },
  bookingTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.semibold,
    fontSize: 17,
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: 2,
  },
  ratingWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingText: {
    color: '#D6A13B',
    fontFamily: fonts.regular,
    fontSize: 12,
  },
  reviewsText: {
    color: '#A9A9A9',
    fontFamily: fonts.regular,
    fontSize: 12,
  },
  bookedOnText: {
    color: colors.textPrimary,
    fontFamily: fonts.regular,
    fontSize: 12,
    marginBottom: 6,
  },
  bookedOnStrong: {
    fontFamily: fonts.bold,
  },
  bookingFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  bookingPrice: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 16,
  },
  viewButton: {
    minWidth: 88,
    borderRadius: 8,
    backgroundColor: '#F1B131',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
  },
  viewButtonText: {
    color: colors.white,
    fontFamily: fonts.medium,
    fontSize: 15,
  },
});
