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
import SearchIcon from '../assets/images/search 1.svg';
import DateIcon from '../assets/images/clarity_date-line.svg';
import BedIcon from '../assets/images/fluent_bed-24-filled.svg';
import BathIcon from '../assets/images/fa-solid_bath.svg';
import WifiIcon from '../assets/images/eva_wifi-fill.svg';
import CardImage from '../assets/images/image.svg';
import {AppBottomNav, AppTab} from '../components/AppBottomNav';
import {useHomeScreen} from '../hooks/useHomeScreen';
import {useResponsive} from '../hooks/useResponsive';
import {colors, fonts, radii, spacing} from '../theme';

type PropertiesScreenProps = {
  activeTab: AppTab;
  onTabPress: (tab: AppTab) => void;
};

const propertyCards = [
  {
    id: 'lux-house-1',
    title: 'Colombo Lux House',
    bedrooms: '1 bedroom',
    baths: '1 bath',
  },
  {
    id: 'lux-house-2',
    title: 'Colombo Lux House',
    bedrooms: '2 bedroom',
    baths: '2 bath',
  },
  {
    id: 'lux-house-3',
    title: 'Colombo Lux House',
    bedrooms: '1 bedroom',
    baths: '1 bath',
  },
];

const filterChips = [
  {label: 'Filters', tone: 'muted' as const},
  {label: 'Apartment', tone: 'accent' as const},
  {label: 'House', tone: 'neutral' as const},
  {label: 'Room / Boarding', tone: 'accent' as const},
];

export const PropertiesScreen: React.FC<PropertiesScreenProps> = ({
  activeTab,
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

            <View style={styles.searchField}>
              <Text style={styles.searchText}>Colombo</Text>
              <SearchIcon height={20} width={20} />
            </View>

            <View style={styles.dateRow}>
              <DateInput label="Move-in" value="DD/MM/YY" />
              <DateInput label="Move-out" value="DD/MM/YY" />
            </View>

            <View style={styles.filterRow}>
              {filterChips.map(chip => (
                <View
                  key={chip.label}
                  style={[
                    styles.filterChip,
                    chip.tone === 'accent' ? styles.filterChipAccent : null,
                    chip.tone === 'muted' ? styles.filterChipMuted : null,
                  ]}>
                  <Text
                    style={[
                      styles.filterChipText,
                      chip.tone === 'accent'
                        ? styles.filterChipTextAccent
                        : null,
                      chip.tone === 'muted' ? styles.filterChipTextMuted : null,
                    ]}>
                    {chip.label}
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.cardList}>
              {propertyCards.map(card => (
                <PropertyCard
                  key={card.id}
                  baths={card.baths}
                  bedrooms={card.bedrooms}
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

type DateInputProps = {
  label: string;
  value: string;
};

const DateInput: React.FC<DateInputProps> = ({label, value}) => {
  return (
    <View style={styles.dateInputWrap}>
      <Text style={styles.dateInputLabel}>{label}</Text>
      <View style={styles.dateInput}>
        <Text style={styles.dateInputText}>{value}</Text>
        <DateIcon height={18} width={18} />
      </View>
    </View>
  );
};

type PropertyCardProps = {
  baths: string;
  bedrooms: string;
  title: string;
};

const PropertyCard: React.FC<PropertyCardProps> = ({
  baths,
  bedrooms,
  title,
}) => {
  return (
    <View style={styles.propertyCard}>
      <View style={styles.propertyImageWrap}>
        <CardImage
          height="100%"
          preserveAspectRatio="xMidYMid slice"
          style={styles.propertyImage}
          width="100%"
        />
      </View>

      <View style={styles.propertyBody}>
        <Text style={styles.propertyTitle}>{title}</Text>

        <View style={styles.amenitiesRow}>
          <Amenity icon={<BedIcon height={15} width={15} />} label={bedrooms} />
          <Amenity icon={<BathIcon height={15} width={15} />} label={baths} />
          <Amenity icon={<WifiIcon height={15} width={15} />} label="WiFi" />
        </View>

        <Text style={styles.propertyMeta}>
          City view | 3rd floor | Elevator | Parking
        </Text>

        <View style={styles.availabilityChip}>
          <Text style={styles.availabilityText}>Available 28 Nov 2021</Text>
        </View>

        <Text style={styles.propertyPrice}>
          from <Text style={styles.propertyPriceStrong}>LKR13490</Text> /month
        </Text>
      </View>
    </View>
  );
};

type AmenityProps = {
  icon: React.ReactNode;
  label: string;
};

const Amenity: React.FC<AmenityProps> = ({icon, label}) => {
  return (
    <View style={styles.amenityItem}>
      {icon}
      <Text style={styles.amenityText}>{label}</Text>
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
    paddingBottom: 136,
  },
  contentWidth: {
    width: '100%',
    alignSelf: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
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
  searchField: {
    height: 54,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D8D8D8',
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  searchText: {
    color: colors.textPrimary,
    fontFamily: fonts.medium,
    fontSize: 17,
  },
  dateRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  dateInputWrap: {
    flex: 1,
  },
  dateInputLabel: {
    color: '#4B4B4B',
    fontFamily: fonts.medium,
    fontSize: 14,
    marginBottom: 6,
    marginLeft: spacing.sm,
  },
  dateInput: {
    minHeight: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BDBDBD',
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm + 4,
  },
  dateInputText: {
    color: '#B1B1B1',
    fontFamily: fonts.regular,
    fontSize: 16,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  filterChip: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D8D8D8',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 6,
    backgroundColor: colors.white,
  },
  filterChipAccent: {
    borderColor: colors.accent,
    backgroundColor: '#FFF8EE',
  },
  filterChipMuted: {
    borderColor: '#E3E3E3',
    backgroundColor: '#F7F7F7',
  },
  filterChipText: {
    color: '#AEAEAE',
    fontFamily: fonts.regular,
    fontSize: 13,
  },
  filterChipTextAccent: {
    color: colors.accent,
    fontFamily: fonts.medium,
  },
  filterChipTextMuted: {
    color: '#BEBEBE',
  },
  cardList: {
    gap: spacing.md,
  },
  propertyCard: {
    flexDirection: 'row',
    borderRadius: radii.lg,
    overflow: 'hidden',
    backgroundColor: '#F3EEF0',
    minHeight: 140,
    shadowColor: colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 14,
    shadowOffset: {width: 0, height: 8},
    elevation: 6,
  },
  propertyImageWrap: {
    width: 86,
    backgroundColor: '#E3DDD8',
    overflow: 'hidden',
  },
  propertyImage: {
    ...StyleSheet.absoluteFillObject,
  },
  propertyBody: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
  },
  propertyTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.semibold,
    fontSize: 16,
    marginBottom: 8,
  },
  amenitiesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: 6,
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  amenityText: {
    color: colors.textPrimary,
    fontFamily: fonts.regular,
    fontSize: 12,
  },
  propertyMeta: {
    color: colors.textPrimary,
    fontFamily: fonts.regular,
    fontSize: 12,
    marginBottom: spacing.sm,
  },
  availabilityChip: {
    alignSelf: 'flex-start',
    borderRadius: radii.pill,
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    marginBottom: spacing.sm,
  },
  availabilityText: {
    color: colors.white,
    fontFamily: fonts.medium,
    fontSize: 13,
  },
  propertyPrice: {
    color: colors.textPrimary,
    fontFamily: fonts.regular,
    fontSize: 14,
  },
  propertyPriceStrong: {
    fontFamily: fonts.bold,
  },
});
