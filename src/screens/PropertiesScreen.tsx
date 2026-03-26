import React, {useEffect, useMemo, useRef, useState} from 'react';
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
  TextInput,
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
import {useTenantProperties} from '../hooks/useTenantProperties';
import {useResponsive} from '../hooks/useResponsive';
import {PropertyRecord} from '../services/properties';
import {PropertyBookingDraft} from '../types/propertyBooking';
import {colors, fonts, radii, spacing} from '../theme';
import {formatShortDateInput} from '../utils/dateInput';
import {
  formatPropertyAvailabilityChip,
  formatPropertyRentCompact,
} from '../utils/propertyPresentation';
import {PropertyBookingScreen} from './PropertyBookingScreen';
import {PropertyDetailsScreen} from './PropertyDetailsScreen';
import {PropertyPaymentScreen} from './PropertyPaymentScreen';

type PropertiesScreenProps = {
  activeTab: AppTab;
  onTabPress: (tab: AppTab) => void;
};

type SortOption = 'Newest' | 'A-Z' | 'Bedrooms' | 'Bathrooms';

const sortByOptions: SortOption[] = ['Newest', 'A-Z', 'Bedrooms', 'Bathrooms'];
const propertyTypeDefaults = ['Apartment', 'House', 'Room / Boarding'];
const listingTypeDefaults = ['For Rent', 'Short-term'];
const SLIDER_THUMB_SIZE = 18;
const SLIDER_TOUCH_SIZE = 32;

const createBookingDraft = (): PropertyBookingDraft => ({
  checkIn: '',
  checkOut: '',
  guestCount: 1,
});

const uniqueValues = (values: string[]) =>
  Array.from(new Set(values.filter(value => value.trim().length > 0)));

const toggleValue = (values: string[], value: string) =>
  values.includes(value)
    ? values.filter(item => item !== value)
    : [...values, value];

const buildSearchText = (property: PropertyRecord) =>
  [
    property.title,
    property.locationText,
    property.propertyCode,
    property.propertyType,
    property.listingType,
    property.monthlyRent === null ? '' : String(property.monthlyRent),
    property.availableFrom ?? '',
    property.availableTo ?? '',
    property.description,
    property.amenities.join(' '),
  ]
    .join(' ')
    .toLowerCase();

const sortProperties = (properties: PropertyRecord[], sortBy: SortOption) => {
  const sortedProperties = [...properties];

  if (sortBy === 'A-Z') {
    return sortedProperties.sort((first, second) =>
      first.title.localeCompare(second.title),
    );
  }

  if (sortBy === 'Bedrooms') {
    return sortedProperties.sort((first, second) => {
      if (second.bedrooms !== first.bedrooms) {
        return second.bedrooms - first.bedrooms;
      }

      return second.id - first.id;
    });
  }

  if (sortBy === 'Bathrooms') {
    return sortedProperties.sort((first, second) => {
      if (second.bathrooms !== first.bathrooms) {
        return second.bathrooms - first.bathrooms;
      }

      return second.id - first.id;
    });
  }

  return sortedProperties.sort((first, second) => {
    const firstTimestamp = first.createdAt ? Date.parse(first.createdAt) : 0;
    const secondTimestamp = second.createdAt ? Date.parse(second.createdAt) : 0;

    return secondTimestamp - firstTimestamp || second.id - first.id;
  });
};

const getMetaText = (property: PropertyRecord) =>
  [property.locationText, property.propertyType]
    .filter(Boolean)
    .join(' | ');

const getAmenityLabel = (property: PropertyRecord) =>
  property.amenities.find(amenity => /wi[\s-]?fi|internet/i.test(amenity)) ??
  property.amenities[0] ??
  'Details';

const shouldUseWifiIcon = (label: string) => /wi[\s-]?fi|internet/i.test(label);

const getFooterDetails = (property: PropertyRecord) =>
  property.monthlyRent === null
    ? {label: 'code', value: property.propertyCode}
    : {label: 'rent', value: formatPropertyRentCompact(property.monthlyRent)};

const getAvailabilityTagLabel = (property: PropertyRecord) =>
  formatPropertyAvailabilityChip(
    property.availableFrom,
    property.availableTo,
    property.listingType,
  );

export const PropertiesScreen: React.FC<PropertiesScreenProps> = ({
  activeTab,
  onTabPress,
}) => {
  const responsive = useResponsive();
  const home = useHomeScreen();
  const topInset = Platform.OS === 'android' ? spacing.xs : spacing.md;
  const {errorMessage, loading, properties, reload} = useTenantProperties();
  const [detailVisible, setDetailVisible] = useState(false);
  const [bookingVisible, setBookingVisible] = useState(false);
  const [paymentVisible, setPaymentVisible] = useState(false);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<PropertyRecord | null>(
    null,
  );
  const [bookingDraft, setBookingDraft] = useState<PropertyBookingDraft>(
    createBookingDraft(),
  );
  const [searchText, setSearchText] = useState('');
  const [selectedSortBy, setSelectedSortBy] = useState<SortOption>('Newest');
  const [selectedPropertyTypes, setSelectedPropertyTypes] = useState<string[]>(
    [],
  );
  const [selectedListingType, setSelectedListingType] = useState<string | null>(
    null,
  );
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const maximumBedrooms = useMemo(
    () => Math.max(1, ...properties.map(property => property.bedrooms)),
    [properties],
  );
  const maximumBathrooms = useMemo(
    () => Math.max(1, ...properties.map(property => property.bathrooms)),
    [properties],
  );
  const [bedroomRange, setBedroomRange] = useState<[number, number]>([1, 1]);
  const [bathroomRange, setBathroomRange] = useState<[number, number]>([1, 1]);

  useEffect(() => {
    setBedroomRange([1, maximumBedrooms]);
  }, [maximumBedrooms]);

  useEffect(() => {
    setBathroomRange([1, maximumBathrooms]);
  }, [maximumBathrooms]);

  const propertyTypeOptions = useMemo(
    () =>
      uniqueValues([
        ...propertyTypeDefaults,
        ...properties.map(property => property.propertyType),
      ]),
    [properties],
  );
  const listingTypeOptions = useMemo(
    () =>
      uniqueValues([
        ...listingTypeDefaults,
        ...properties.map(property => property.listingType),
      ]),
    [properties],
  );
  const amenityOptions = useMemo(
    () =>
      uniqueValues(properties.flatMap(property => property.amenities)).sort(
        (first, second) => first.localeCompare(second),
      ),
    [properties],
  );

  const visibleProperties = useMemo(() => {
    const normalizedSearchText = searchText.trim().toLowerCase();

    return sortProperties(
      properties.filter(property => {
        if (
          normalizedSearchText.length > 0 &&
          !buildSearchText(property).includes(normalizedSearchText)
        ) {
          return false;
        }

        if (
          selectedPropertyTypes.length > 0 &&
          !selectedPropertyTypes.includes(property.propertyType)
        ) {
          return false;
        }

        if (
          selectedListingType &&
          property.listingType !== selectedListingType
        ) {
          return false;
        }

        if (
          property.bedrooms < bedroomRange[0] ||
          property.bedrooms > bedroomRange[1]
        ) {
          return false;
        }

        if (
          property.bathrooms < bathroomRange[0] ||
          property.bathrooms > bathroomRange[1]
        ) {
          return false;
        }

        if (
          selectedAmenities.length > 0 &&
          !selectedAmenities.every(amenity => property.amenities.includes(amenity))
        ) {
          return false;
        }

        return true;
      }),
      selectedSortBy,
    );
  }, [
    bathroomRange,
    bedroomRange,
    properties,
    searchText,
    selectedAmenities,
    selectedListingType,
    selectedPropertyTypes,
    selectedSortBy,
  ]);

  const resetFilters = () => {
    setSelectedSortBy('Newest');
    setSelectedPropertyTypes([]);
    setSelectedListingType(null);
    setSelectedAmenities([]);
    setBedroomRange([1, maximumBedrooms]);
    setBathroomRange([1, maximumBathrooms]);
  };

  const openPropertyDetails = (property: PropertyRecord) => {
    setSelectedProperty(property);
    setDetailVisible(true);
  };

  if (paymentVisible && selectedProperty) {
    return (
      <PropertyPaymentScreen
        activeTab={activeTab}
        bookingDraft={bookingDraft}
        onBack={() => setPaymentVisible(false)}
        onBookNow={() => {
          setPaymentVisible(false);
          setBookingVisible(false);
          setDetailVisible(false);
          onTabPress('bookings');
        }}
        onTabPress={tab => {
          setPaymentVisible(false);
          setBookingVisible(false);
          setDetailVisible(false);
          onTabPress(tab);
        }}
        property={selectedProperty}
      />
    );
  }

  if (bookingVisible && selectedProperty) {
    return (
      <PropertyBookingScreen
        activeTab={activeTab}
        bookingDraft={bookingDraft}
        onBack={() => setBookingVisible(false)}
        onNext={() => setPaymentVisible(true)}
        onTabPress={tab => {
          setPaymentVisible(false);
          setBookingVisible(false);
          setDetailVisible(false);
          onTabPress(tab);
        }}
        onUpdateBookingDraft={updates =>
          setBookingDraft(current => ({...current, ...updates}))
        }
        property={selectedProperty}
      />
    );
  }

  if (detailVisible && selectedProperty) {
    return (
      <PropertyDetailsScreen
        activeTab={activeTab}
        onBack={() => setDetailVisible(false)}
        onBookNow={() => setBookingVisible(true)}
        onTabPress={tab => {
          setDetailVisible(false);
          onTabPress(tab);
        }}
        property={selectedProperty}
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
            <LocationSearchField
              onChangeText={setSearchText}
              value={searchText}
            />

            <View style={styles.dateRow}>
              <DateInput
                label="Move-in"
                onChangeText={value =>
                  setBookingDraft(current => ({
                    ...current,
                    checkIn: formatShortDateInput(value),
                  }))
                }
                value={bookingDraft.checkIn}
              />
              <DateInput
                label="Move-out"
                onChangeText={value =>
                  setBookingDraft(current => ({
                    ...current,
                    checkOut: formatShortDateInput(value),
                  }))
                }
                value={bookingDraft.checkOut}
              />
            </View>

            <View style={styles.filterRow}>
              <FilterChipButton
                label="Filters"
                muted
                onPress={() => setFiltersVisible(true)}
              />
              {propertyTypeDefaults.map(option => (
                <FilterChipButton
                  key={option}
                  label={option}
                  onPress={() =>
                    setSelectedPropertyTypes(current => toggleValue(current, option))
                  }
                  selected={selectedPropertyTypes.includes(option)}
                />
              ))}
            </View>

            {loading ? (
              <Text style={styles.infoText}>Loading properties...</Text>
            ) : errorMessage ? (
              <Text style={styles.infoText}>{errorMessage}</Text>
            ) : visibleProperties.length === 0 ? (
              <Text style={styles.infoText}>
                No properties match your search or selected filters.
              </Text>
            ) : (
              <View style={styles.cardList}>
                {visibleProperties.map(property => {
                  const footerDetails = getFooterDetails(property);

                  return (
                    <PropertyCard
                      baths={`${property.bathrooms} bath`}
                      bedrooms={`${property.bedrooms} bedroom`}
                      footerLabel={footerDetails.label}
                      footerValue={footerDetails.value}
                      key={property.id}
                      meta={getMetaText(property)}
                      onAvailabilityPress={() => openPropertyDetails(property)}
                      tag={getAvailabilityTagLabel(property)}
                      title={property.title}
                      highlightLabel={getAmenityLabel(property)}
                    />
                  );
                })}
              </View>
            )}
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
                  <LocationSearchField
                    onChangeText={setSearchText}
                    value={searchText}
                  />
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
                            onPress={() => setSelectedSortBy(option)}
                            selected={selectedSortBy === option}
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
                            onPress={() =>
                              setSelectedPropertyTypes(current =>
                                toggleValue(current, option),
                              )
                            }
                            selected={selectedPropertyTypes.includes(option)}
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
                            onPress={() =>
                              setSelectedListingType(current =>
                                current === option ? null : option,
                              )
                            }
                            selected={selectedListingType === option}
                          />
                        ))}
                      </View>
                    </FilterSection>

                    <FilterSection title="Bedrooms">
                      <View style={styles.rangeLabelsRow}>
                        <Text style={styles.rangeValueText}>
                          {String(bedroomRange[0])}
                        </Text>
                        <Text style={styles.rangeValueText}>
                          {String(bedroomRange[1])}
                        </Text>
                      </View>
                      <DualThumbRangeSlider
                        max={maximumBedrooms}
                        min={1}
                        onChange={setBedroomRange}
                        step={1}
                        values={bedroomRange}
                      />
                    </FilterSection>

                    <FilterSection title="Bathrooms">
                      <View style={styles.rangeLabelsRow}>
                        <Text style={styles.rangeValueText}>
                          {String(bathroomRange[0])}
                        </Text>
                        <Text style={styles.rangeValueText}>
                          {String(bathroomRange[1])}
                        </Text>
                      </View>
                      <DualThumbRangeSlider
                        max={maximumBathrooms}
                        min={1}
                        onChange={setBathroomRange}
                        step={1}
                        values={bathroomRange}
                      />
                    </FilterSection>

                    <FilterSection title="Include">
                      {amenityOptions.length > 0 ? (
                        <View style={styles.optionRow}>
                          {amenityOptions.map(option => (
                            <FilterChipButton
                              key={option}
                              label={option}
                              onPress={() =>
                                setSelectedAmenities(current =>
                                  toggleValue(current, option),
                                )
                              }
                              selected={selectedAmenities.includes(option)}
                            />
                          ))}
                        </View>
                      ) : (
                        <Text style={styles.infoText}>
                          No amenities are available to filter yet.
                        </Text>
                      )}
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

type LocationSearchFieldProps = {
  onChangeText: (value: string) => void;
  value: string;
};

const LocationSearchField: React.FC<LocationSearchFieldProps> = ({
  onChangeText,
  value,
}) => {
  return (
    <View style={styles.searchField}>
      <TextInput
        onChangeText={onChangeText}
        placeholder="Search properties"
        placeholderTextColor="#999999"
        style={styles.searchText}
        value={value}
      />
      <SearchIcon height={20} width={20} />
    </View>
  );
};

type DateInputProps = {
  label: string;
  onChangeText: (value: string) => void;
  value: string;
};

const DateInput: React.FC<DateInputProps> = ({label, onChangeText, value}) => {
  return (
    <View style={styles.dateInputWrap}>
      <Text style={styles.dateInputLabel}>{label}</Text>
      <View style={styles.dateInput}>
        <TextInput
          keyboardType="number-pad"
          maxLength={8}
          onChangeText={onChangeText}
          placeholder="DD/MM/YY"
          placeholderTextColor="#B1B1B1"
          style={styles.dateInputText}
          value={value}
        />
        <DateIcon height={18} width={18} />
      </View>
    </View>
  );
};

type PropertyCardProps = {
  baths: string;
  bedrooms: string;
  footerLabel: string;
  footerValue: string;
  highlightLabel: string;
  meta: string;
  onAvailabilityPress: () => void;
  tag: string;
  title: string;
};

const PropertyCard: React.FC<PropertyCardProps> = ({
  baths,
  bedrooms,
  footerLabel,
  footerValue,
  highlightLabel,
  meta,
  onAvailabilityPress,
  tag,
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
          <Amenity
            icon={
              shouldUseWifiIcon(highlightLabel) ? (
                <WifiIcon height={15} width={15} />
              ) : null
            }
            label={highlightLabel}
          />
        </View>

        <Text numberOfLines={1} style={styles.propertyMeta}>
          {meta || 'Location unavailable'}
        </Text>

        <Pressable
          accessibilityRole="button"
          onPress={onAvailabilityPress}
          style={styles.availabilityChip}>
          <Text numberOfLines={1} style={styles.availabilityText}>
            {tag}
          </Text>
        </Pressable>

        <Text style={styles.propertyPrice}>
          {footerLabel}{' '}
          <Text style={styles.propertyPriceStrong}>{footerValue}</Text>
        </Text>
      </View>
    </View>
  );
};

type AmenityProps = {
  icon?: React.ReactNode | null;
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

type DualThumbRangeSliderProps = {
  max: number;
  min: number;
  onChange: (values: [number, number]) => void;
  step: number;
  values: [number, number];
};

const DualThumbRangeSlider: React.FC<DualThumbRangeSliderProps> = ({
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
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  searchText: {
    flex: 1,
    color: colors.textPrimary,
    fontFamily: fonts.medium,
    fontSize: 17,
    paddingVertical: spacing.sm,
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
    gap: spacing.xs,
    paddingHorizontal: spacing.sm + 4,
  },
  dateInputText: {
    flex: 1,
    color: '#4B4B4B',
    fontFamily: fonts.regular,
    fontSize: 16,
    paddingVertical: 0,
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
  infoText: {
    color: colors.textSecondary,
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 20,
    marginBottom: spacing.md,
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
    borderBottomLeftRadius: radii.lg,
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
