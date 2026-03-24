import React, {useMemo, useRef, useState} from 'react';
import {
  GestureResponderEvent,
  LayoutChangeEvent,
  Modal,
  PanResponder,
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
import RefreshIcon from '../assets/images/refreshing 1.svg';
import BedIcon from '../assets/images/fluent_bed-24-filled.svg';
import BathIcon from '../assets/images/fa-solid_bath.svg';
import WifiIcon from '../assets/images/eva_wifi-fill.svg';
import CardImage from '../assets/images/image.svg';
import {AppBottomNav, AppTab} from '../components/AppBottomNav';
import {useHomeScreen} from '../hooks/useHomeScreen';
import {PropertyDetailsScreen} from './PropertyDetailsScreen';
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

const sortByOptions = ['Best Match', 'Nearest', 'Low Budget'];
const propertyTypeOptions = ['Apartment', 'House', 'Room / Boarding'];
const listingTypeOptions = ['For Rent', 'Short-term'];
const ratingsOptions = ['Below 4', '4 to 6', '6 to 10'];
const includeOptions = [
  'Garden',
  'Furnished',
  'Parking',
  'Pool',
  'Pets Allowed',
  'Hot Water',
  'CCTV',
];
const defaultPropertyTypes = ['House', 'Room / Boarding'];
const defaultRatings = ['4 to 6', '6 to 10'];
const defaultIncludes = ['Garden', 'Parking', 'Pool', 'Pets Allowed', 'CCTV'];
const defaultDistanceRange: [number, number] = [8, 20];
const defaultBudgetRange: [number, number] = [50, 100];

const SLIDER_THUMB_SIZE = 18;
const SLIDER_TOUCH_SIZE = 32;

export const PropertiesScreen: React.FC<PropertiesScreenProps> = ({
  activeTab,
  onTabPress,
}) => {
  const responsive = useResponsive();
  const home = useHomeScreen();
  const topInset = Platform.OS === 'android' ? spacing.xs : spacing.md;
  const [detailVisible, setDetailVisible] = useState(false);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [selectedSortBy, setSelectedSortBy] = useState('Nearest');
  const [selectedPropertyTypes, setSelectedPropertyTypes] =
    useState(defaultPropertyTypes);
  const [selectedListingType, setSelectedListingType] = useState('For Rent');
  const [selectedRatings, setSelectedRatings] = useState(defaultRatings);
  const [selectedIncludes, setSelectedIncludes] = useState(defaultIncludes);
  const [distanceRange, setDistanceRange] =
    useState<[number, number]>(defaultDistanceRange);
  const [budgetRange, setBudgetRange] =
    useState<[number, number]>(defaultBudgetRange);

  const toggleValue = (
    value: string,
    setSelectedValues: React.Dispatch<React.SetStateAction<string[]>>,
  ) => {
    setSelectedValues(current =>
      current.includes(value)
        ? current.filter(item => item !== value)
        : [...current, value],
    );
  };

  const resetFilters = () => {
    setSelectedSortBy('Nearest');
    setSelectedPropertyTypes(defaultPropertyTypes);
    setSelectedListingType('For Rent');
    setSelectedRatings(defaultRatings);
    setSelectedIncludes(defaultIncludes);
    setDistanceRange(defaultDistanceRange);
    setBudgetRange(defaultBudgetRange);
  };

  if (detailVisible) {
    return (
      <PropertyDetailsScreen
        activeTab={activeTab}
        onBack={() => setDetailVisible(false)}
        onTabPress={tab => {
          setDetailVisible(false);
          onTabPress(tab);
        }}
      />
    );
  }

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
            <ScreenTopBar
              onMenuPress={home.onMenuPress}
              onProfilePress={home.onProfilePress}
              userName={home.userName}
            />
            <LocationSearchField />

            <View style={styles.dateRow}>
              <DateInput label="Move-in" value="DD/MM/YY" />
              <DateInput label="Move-out" value="DD/MM/YY" />
            </View>

            <View style={styles.filterRow}>
              <FilterChipButton
                label={filterChips[0].label}
                muted
                onPress={() => setFiltersVisible(true)}
              />
              <FilterChipButton
                label={filterChips[1].label}
                selected={selectedPropertyTypes.includes('Apartment')}
              />
              <FilterChipButton
                label={filterChips[2].label}
                selected={selectedPropertyTypes.includes('House')}
              />
              <FilterChipButton
                label={filterChips[3].label}
                selected={selectedPropertyTypes.includes('Room / Boarding')}
              />
            </View>

            <View style={styles.cardList}>
              {propertyCards.map(card => (
                <PropertyCard
                  onAvailabilityPress={() => setDetailVisible(true)}
                  key={card.id}
                  baths={card.baths}
                  bedrooms={card.bedrooms}
                  title={card.title}
                />
              ))}
            </View>
          </View>
        </ScrollView>

        <Modal
          animationType="slide"
          onRequestClose={() => setFiltersVisible(false)}
          transparent={false}
          visible={filtersVisible}>
          <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
            <View style={styles.root}>
              <View
                style={[
                  styles.modalTopArea,
                  {
                    paddingHorizontal: responsive.horizontalPadding,
                    paddingTop: topInset,
                  },
                ]}>
                <View
                  style={[
                    styles.contentWidth,
                    {maxWidth: responsive.maxContentWidth},
                  ]}>
                  <ScreenTopBar
                    onMenuPress={home.onMenuPress}
                    onProfilePress={home.onProfilePress}
                    userName={home.userName}
                  />
                  <LocationSearchField />
                </View>
              </View>

              <View style={styles.modalPanelWrap}>
                <View
                  style={[
                    styles.filterModalPanel,
                    {maxWidth: responsive.maxContentWidth},
                  ]}>
                  <ScrollView
                    contentContainerStyle={styles.filterModalScroll}
                    showsVerticalScrollIndicator={false}>
                    <View style={styles.modalHeaderRow}>
                      <Text style={styles.modalTitle}>Filter place</Text>
                      <Pressable
                        accessibilityRole="button"
                        onPress={resetFilters}
                        style={styles.resetButton}>
                        <RefreshIcon height={12} width={12} />
                        <Text style={styles.resetButtonText}>Reset</Text>
                      </Pressable>
                    </View>

                    <FilterSection title="Sort by">
                      <View style={styles.optionRow}>
                        {sortByOptions.map(option => (
                          <FilterChipButton
                            key={option}
                            label={option}
                            selected={selectedSortBy === option}
                            onPress={() => setSelectedSortBy(option)}
                          />
                        ))}
                      </View>
                    </FilterSection>

                    <FilterSection title="Property Type">
                      <View style={styles.optionRow}>
                        {propertyTypeOptions.map(option => (
                          <FilterChipButton
                            key={option}
                            label={option}
                            selected={selectedPropertyTypes.includes(option)}
                            onPress={() =>
                              toggleValue(option, setSelectedPropertyTypes)
                            }
                          />
                        ))}
                      </View>
                    </FilterSection>

                    <FilterSection title="Listing Type">
                      <View style={styles.optionRow}>
                        {listingTypeOptions.map(option => (
                          <FilterChipButton
                            key={option}
                            label={option}
                            selected={selectedListingType === option}
                            onPress={() => setSelectedListingType(option)}
                          />
                        ))}
                      </View>
                    </FilterSection>

                    <FilterSection title="Distance">
                      <View style={styles.rangeLabelsRow}>
                        <Text style={styles.rangeValueText}>
                          {`${distanceRange[0]} km`}
                        </Text>
                        <Text style={styles.rangeValueText}>
                          {`${distanceRange[1]} km`}
                        </Text>
                      </View>
                      <DualThumbRangeSlider
                        max={30}
                        min={0}
                        onChange={setDistanceRange}
                        step={1}
                        values={distanceRange}
                      />
                    </FilterSection>

                    <FilterSection title="Budget">
                      <View style={styles.rangeLabelsRow}>
                        <Text style={styles.rangeValueText}>
                          {`LKR ${budgetRange[0]}K`}
                        </Text>
                        <Text style={styles.rangeValueText}>
                          {`LKR ${budgetRange[1]}K`}
                        </Text>
                      </View>
                      <DualThumbRangeSlider
                        max={150}
                        min={0}
                        onChange={setBudgetRange}
                        step={5}
                        values={budgetRange}
                      />
                    </FilterSection>

                    <FilterSection title="Ratings">
                      <View style={styles.optionRow}>
                        {ratingsOptions.map(option => (
                          <FilterChipButton
                            key={option}
                            label={option}
                            selected={selectedRatings.includes(option)}
                            onPress={() =>
                              toggleValue(option, setSelectedRatings)
                            }
                          />
                        ))}
                      </View>
                    </FilterSection>

                    <FilterSection title="Include">
                      <View style={styles.optionRow}>
                        {includeOptions.map(option => (
                          <FilterChipButton
                            key={option}
                            label={option}
                            selected={selectedIncludes.includes(option)}
                            onPress={() =>
                              toggleValue(option, setSelectedIncludes)
                            }
                          />
                        ))}
                      </View>
                    </FilterSection>
                  </ScrollView>

                  <View style={styles.filterFooter}>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => setFiltersVisible(false)}
                      style={styles.applyButton}>
                      <Text style={styles.applyButtonText}>Apply</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            </View>
          </SafeAreaView>
        </Modal>

        <AppBottomNav activeTab={activeTab} onTabPress={onTabPress} />
      </View>
    </SafeAreaView>
  );
};

type ScreenTopBarProps = {
  onMenuPress: () => void;
  onProfilePress: () => void;
  userName: string;
};

const ScreenTopBar: React.FC<ScreenTopBarProps> = ({
  onMenuPress,
  onProfilePress,
  userName,
}) => {
  return (
    <View style={styles.headerRow}>
      <Pressable
        accessibilityRole="button"
        onPress={onMenuPress}
        style={styles.iconButton}>
        <MenuIcon height={22} width={32} />
      </Pressable>

      <Pressable
        accessibilityRole="button"
        onPress={onProfilePress}
        style={styles.profileButton}>
        <Text style={styles.profileLabel}>{`Hello ${userName}.`}</Text>
        <View style={styles.profileImageWrap}>
          <ProfilePic height="100%" width="100%" />
        </View>
      </Pressable>
    </View>
  );
};

const LocationSearchField: React.FC = () => {
  return (
    <View style={styles.searchField}>
      <Text style={styles.searchText}>Colombo</Text>
      <SearchIcon height={20} width={20} />
    </View>
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
  onAvailabilityPress: () => void;
  title: string;
};

const PropertyCard: React.FC<PropertyCardProps> = ({
  baths,
  bedrooms,
  onAvailabilityPress,
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

        <Pressable
          accessibilityRole="button"
          onPress={onAvailabilityPress}
          style={styles.availabilityChip}>
          <Text style={styles.availabilityText}>Available 28 Nov 2021</Text>
        </Pressable>

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

type FilterChipButtonProps = {
  label: string;
  muted?: boolean;
  onPress?: () => void;
  selected?: boolean;
};

const FilterChipButton: React.FC<FilterChipButtonProps> = ({
  label,
  muted,
  onPress,
  selected,
}) => {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({pressed}) => [
        styles.filterChip,
        selected ? styles.filterChipAccent : null,
        muted ? styles.filterChipMuted : null,
        pressed && onPress ? styles.filterChipPressed : null,
      ]}>
      <Text
        style={[
          styles.filterChipText,
          selected ? styles.filterChipTextAccent : null,
          muted ? styles.filterChipTextMuted : null,
        ]}>
        {label}
      </Text>
    </Pressable>
  );
};

type FilterSectionProps = {
  children: React.ReactNode;
  title: string;
};

const FilterSection: React.FC<FilterSectionProps> = ({children, title}) => {
  return (
    <View style={styles.modalSection}>
      <Text style={styles.modalSectionTitle}>{title}</Text>
      {children}
    </View>
  );
};

type StaticRangeSliderProps = {
  max: number;
  min: number;
  onChange: (values: [number, number]) => void;
  step: number;
  values: [number, number];
};

const DualThumbRangeSlider: React.FC<StaticRangeSliderProps> = ({
  max,
  min,
  onChange,
  step,
  values,
}) => {
  const [trackWidth, setTrackWidth] = useState(0);
  const minValueRef = useRef(values[0]);
  const maxValueRef = useRef(values[1]);

  const valueToPosition = (value: number) => {
    if (trackWidth <= 0 || max === min) {
      return 0;
    }

    return ((value - min) / (max - min)) * trackWidth;
  };

  const positionToValue = (position: number) => {
    if (trackWidth <= 0 || max === min) {
      return min;
    }

    const clampedPosition = Math.max(0, Math.min(position, trackWidth));
    const ratio = clampedPosition / trackWidth;
    const rawValue = min + ratio * (max - min);
    const steppedValue = Math.round((rawValue - min) / step) * step + min;

    return Math.max(min, Math.min(steppedValue, max));
  };

  const minPosition = valueToPosition(values[0]);
  const maxPosition = valueToPosition(values[1]);

  const updateFromTrackPress = (event: GestureResponderEvent) => {
    if (trackWidth <= 0) {
      return;
    }

    const pressPosition = event.nativeEvent.locationX;
    const nextValue = positionToValue(pressPosition);
    const nextValues: [number, number] =
      Math.abs(nextValue - values[0]) <= Math.abs(nextValue - values[1])
        ? [Math.min(nextValue, values[1]), values[1]]
        : [values[0], Math.max(nextValue, values[0])];

    onChange(nextValues);
  };

  const createThumbResponder = (thumb: 'min' | 'max') =>
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        minValueRef.current = values[0];
        maxValueRef.current = values[1];
      },
      onPanResponderMove: (_, gestureState) => {
        const basePosition =
          thumb === 'min'
            ? valueToPosition(minValueRef.current)
            : valueToPosition(maxValueRef.current);
        const nextPosition = basePosition + gestureState.dx;
        const nextValue = positionToValue(nextPosition);

        if (thumb === 'min') {
          onChange([
            Math.min(nextValue, maxValueRef.current),
            maxValueRef.current,
          ]);
          return;
        }

        onChange([
          minValueRef.current,
          Math.max(nextValue, minValueRef.current),
        ]);
      },
    });

  const minPanResponder = useMemo(
    () => createThumbResponder('min'),
    [trackWidth, values],
  );
  const maxPanResponder = useMemo(
    () => createThumbResponder('max'),
    [trackWidth, values],
  );

  return (
    <View
      onLayout={(event: LayoutChangeEvent) =>
        setTrackWidth(event.nativeEvent.layout.width)
      }
      style={styles.rangeSliderWrap}>
      <Pressable onPressIn={updateFromTrackPress} style={styles.rangePressArea}>
        <View style={styles.rangeTrackRow}>
          <View style={styles.rangeTrackSegment} />
          <View
            style={[
              styles.rangeTrackActiveSegment,
              {
                left: minPosition,
                width: Math.max(maxPosition - minPosition, 0),
              },
            ]}
          />
        </View>
      </Pressable>
      <View
        {...minPanResponder.panHandlers}
        style={[
          styles.rangeHandleTouchArea,
          {left: minPosition - SLIDER_TOUCH_SIZE / 2},
        ]}>
        <View style={styles.rangeHandle} />
      </View>
      <View
        {...maxPanResponder.panHandlers}
        style={[
          styles.rangeHandleTouchArea,
          {left: maxPosition - SLIDER_TOUCH_SIZE / 2},
        ]}>
        <View style={styles.rangeHandle} />
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
    paddingBottom: 136,
  },
  contentWidth: {
    width: '100%',
    alignSelf: 'center',
  },
  modalTopArea: {
    alignItems: 'center',
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
  filterChipPressed: {
    opacity: 0.82,
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
  modalPanelWrap: {
    flex: 1,
    alignItems: 'center',
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  filterModalPanel: {
    flex: 1,
    width: '100%',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#D8D8D8',
    backgroundColor: colors.white,
    overflow: 'hidden',
  },
  filterModalScroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 18,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.error,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },
  resetButtonText: {
    color: colors.error,
    fontFamily: fonts.medium,
    fontSize: 13,
  },
  modalSection: {
    marginBottom: spacing.lg,
  },
  modalSectionTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.semibold,
    fontSize: 15,
    marginBottom: spacing.sm,
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  rangeLabelsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  rangeValueText: {
    color: colors.textPrimary,
    fontFamily: fonts.regular,
    fontSize: 14,
  },
  rangeSliderWrap: {
    height: SLIDER_TOUCH_SIZE,
    justifyContent: 'center',
    position: 'relative',
  },
  rangePressArea: {
    justifyContent: 'center',
  },
  rangeTrackRow: {
    height: 5,
    justifyContent: 'center',
  },
  rangeTrackSegment: {
    height: 5,
    width: '100%',
    borderRadius: radii.pill,
    backgroundColor: '#E8E8E8',
  },
  rangeTrackActiveSegment: {
    position: 'absolute',
    height: 5,
    borderRadius: radii.pill,
    backgroundColor: '#F1B131',
  },
  rangeHandleTouchArea: {
    position: 'absolute',
    top: 0,
    width: SLIDER_TOUCH_SIZE,
    height: SLIDER_TOUCH_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rangeHandle: {
    width: SLIDER_THUMB_SIZE,
    height: SLIDER_THUMB_SIZE,
    borderRadius: SLIDER_THUMB_SIZE / 2,
    borderWidth: 2,
    borderColor: '#F1B131',
    backgroundColor: colors.white,
  },
  filterFooter: {
    borderTopWidth: 1,
    borderTopColor: '#ECECEC',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
  },
  applyButton: {
    minHeight: 54,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyButtonText: {
    color: colors.white,
    fontFamily: fonts.bold,
    fontSize: 16,
  },
  cardList: {
    gap: spacing.md,
  },
  propertyCard: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
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
    borderTopLeftRadius: radii.lg,
  },
  propertyImage: {
    ...StyleSheet.absoluteFillObject,
  },
  propertyBody: {
    flex: 1,
    backgroundColor: '#F3EEF0',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    borderTopRightRadius: radii.lg,
    borderBottomRightRadius: radii.lg,
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
