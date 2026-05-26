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
import SearchIcon from '../assets/images/search 1.svg';
import DateIcon from '../assets/images/clarity_date-line.svg';
import RefreshIcon from '../assets/images/refreshing 1.svg';
import BedIcon from '../assets/images/fluent_bed-24-filled.svg';
import BathIcon from '../assets/images/fa-solid_bath.svg';
import WifiIcon from '../assets/images/eva_wifi-fill.svg';
import ParkingIcon from '../assets/images/parking-svgrepo-com.svg';
import PoolIcon from '../assets/images/swimming-pool-svgrepo-com.svg';
import CardImage from '../assets/images/image.svg';
import {AppBottomNav, AppTab} from '../components/AppBottomNav';
import {HeaderProfileSwitcher} from '../components/HeaderProfileSwitcher';
import {useHomeScreen} from '../hooks/useHomeScreen';
import {InlineMessage} from '../hooks/useLoginScreen';
import {useTenantProperties} from '../hooks/useTenantProperties';
import {useResponsive} from '../hooks/useResponsive';
import {
  BookingRecord,
  createBooking,
} from '../services/bookings';
import {getAuthSession} from '../services/authSession';
import {PropertyRecord} from '../services/properties';
import {BookingPaymentDraft, PropertyBookingDraft} from '../types/propertyBooking';
import {colors, fonts, radii, spacing} from '../theme';
import {formatShortDateInput, normalizeDateString} from '../utils/dateInput';
import {
  AmenityOptionKey,
  getAmenityOptionKeys,
  getAmenityOptionLabel,
} from '../utils/propertyAmenities';
import {
  formatPropertyAvailabilityChip,
  hasPropertyBookableStayDates,
  formatPropertyRentCompact,
} from '../utils/propertyPresentation';
import {BookingDetailsScreen} from './BookingDetailsScreen';
import {PropertyBookingScreen} from './PropertyBookingScreen';
import {PropertyDetailsScreen} from './PropertyDetailsScreen';
import {PropertyPaymentScreen} from './PropertyPaymentScreen';

type PropertiesScreenProps = {
  activeTab: AppTab;
  onTabPress: (tab: AppTab) => void;
};

type SortOption = 'Newest' | 'A-Z' | 'Bedrooms' | 'Bathrooms';

type BookingDateField = 'checkIn' | 'checkOut';

type DateInputProps = {
  label: string;
  onPress: () => void;
  value: string;
};

type CalendarPickerModalProps = {
  minimumValue?: string | null;
  onClear: () => void;
  onClose: () => void;
  onConfirm: (value: string) => void;
  selectionMode: BookingDateField;
  title: string;
  value: string;
  visible: boolean;
};

const sortByOptions: SortOption[] = ['Newest', 'A-Z', 'Bedrooms', 'Bathrooms'];
const propertyTypeDefaults = ['Apartment', 'House', 'Room / Boarding'];
const listingTypeDefaults = ['For Rent', 'Short-term'];
const SLIDER_THUMB_SIZE = 18;
const SLIDER_TOUCH_SIZE = 32;
const monthLabels = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];
const weekdayLabels = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const createBookingDraft = (): PropertyBookingDraft => ({
  checkIn: '',
  checkOut: '',
  guestCount: 1,
  serviceCategoryIds: [],
  serviceCategoryNames: [],
  serviceNotes: '',
});

const uniqueValues = (values: string[]) =>
  Array.from(new Set(values.filter(value => value.trim().length > 0)));

const formatCalendarDate = (
  year: number,
  monthIndex: number,
  day: number,
) =>
  `${String(year).padStart(4, '0')}-${String(monthIndex + 1).padStart(
    2,
    '0',
  )}-${String(day).padStart(2, '0')}`;

const parseStoredDate = (value: string) => {
  const normalizedValue = normalizeDateString(value);

  if (!normalizedValue) {
    return null;
  }

  const [yearString, monthString, dayString] = normalizedValue.split('-');

  return {
    day: Number(dayString),
    monthIndex: Number(monthString) - 1,
    year: Number(yearString),
  };
};

const getDaysInMonth = (year: number, monthIndex: number) =>
  new Date(year, monthIndex + 1, 0).getDate();

const buildCalendarGrid = (year: number, monthIndex: number) => {
  const firstWeekday = new Date(year, monthIndex, 1).getDay();
  const totalDays = getDaysInMonth(year, monthIndex);
  const leadingSlots = Array.from({length: firstWeekday}, () => null);
  const daySlots = Array.from({length: totalDays}, (_, index) => index + 1);
  const trailingCount =
    (7 - ((leadingSlots.length + daySlots.length) % 7)) % 7;
  const trailingSlots = Array.from({length: trailingCount}, () => null);

  return [...leadingSlots, ...daySlots, ...trailingSlots];
};

const getTodayIsoDate = () => {
  const currentDate = new Date();

  return formatCalendarDate(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    currentDate.getDate(),
  );
};

const addDaysToIsoDate = (value: string, days: number) => {
  const normalizedValue = normalizeDateString(value);

  if (!normalizedValue) {
    return null;
  }

  const parsedDate = new Date(`${normalizedValue}T00:00:00Z`);

  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  parsedDate.setUTCDate(parsedDate.getUTCDate() + days);

  return formatCalendarDate(
    parsedDate.getUTCFullYear(),
    parsedDate.getUTCMonth(),
    parsedDate.getUTCDate(),
  );
};

const getInitialCalendarState = (
  value: string,
  minimumValue?: string | null,
) => {
  const normalizedMinimumValue =
    minimumValue && normalizeDateString(minimumValue)
      ? normalizeDateString(minimumValue)
      : null;
  const normalizedValue = normalizeDateString(value);
  const parsedDate =
    normalizedValue &&
    (!normalizedMinimumValue || normalizedValue >= normalizedMinimumValue)
      ? parseStoredDate(normalizedValue)
      : null;
  const fallbackDate = normalizedMinimumValue
    ? parseStoredDate(normalizedMinimumValue)
    : null;
  const currentDate = new Date();

  return {
    monthIndex:
      parsedDate?.monthIndex ??
      fallbackDate?.monthIndex ??
      currentDate.getMonth(),
    selectedValue: parsedDate ? normalizedValue ?? '' : '',
    year: parsedDate?.year ?? fallbackDate?.year ?? currentDate.getFullYear(),
  };
};

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

const getFooterDetails = (property: PropertyRecord) =>
  property.monthlyRent === null
    ? {label: 'code', value: property.propertyCode}
    : {label: 'rent', value: formatPropertyRentCompact(property.monthlyRent)};

const getAvailabilityTagLabel = (
  property: PropertyRecord,
  referenceDate: string,
) =>
  hasPropertyBookableStayDates(
    property.availableFrom,
    property.availableTo,
    referenceDate,
  )
    ? formatPropertyAvailabilityChip(
        property.availableFrom,
        property.availableTo,
        property.listingType,
      )
    : 'Not available';

const getAmenityIcon = (key: AmenityOptionKey) => {
  if (key === 'parking') {
    return <ParkingIcon height={15} width={15} />;
  }

  if (key === 'pool') {
    return <PoolIcon height={15} width={15} />;
  }

  return <WifiIcon height={15} width={15} />;
};

export const PropertiesScreen: React.FC<PropertiesScreenProps> = ({
  activeTab,
  onTabPress,
}) => {
  const responsive = useResponsive();
  const home = useHomeScreen();
  const topInset =
    Platform.OS === 'android'
      ? (StatusBar.currentHeight ?? 0) + spacing.sm
      : spacing.md;
  const {errorMessage, loading, properties, reload} = useTenantProperties();
  const [detailVisible, setDetailVisible] = useState(false);
  const [bookingVisible, setBookingVisible] = useState(false);
  const [paymentVisible, setPaymentVisible] = useState(false);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<PropertyRecord | null>(
    null,
  );
  const [createdBooking, setCreatedBooking] = useState<BookingRecord | null>(null);
  const [createdBookingMessage, setCreatedBookingMessage] =
    useState<InlineMessage | null>(null);
  const [bookingDraft, setBookingDraft] = useState<PropertyBookingDraft>(
    createBookingDraft(),
  );
  const [activeBookingDateField, setActiveBookingDateField] =
    useState<BookingDateField | null>(null);
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
  const todayIsoDate = getTodayIsoDate();
  const normalizedCheckInDate = normalizeDateString(bookingDraft.checkIn) ?? '';
  const minimumCheckOutDate = normalizedCheckInDate
    ? addDaysToIsoDate(normalizedCheckInDate, 1) ?? todayIsoDate
    : addDaysToIsoDate(todayIsoDate, 1) ?? todayIsoDate;

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

  const openBookingDatePicker = (field: BookingDateField) => {
    setActiveBookingDateField(field);
  };

  const closeBookingDatePicker = () => {
    setActiveBookingDateField(null);
  };

  const handleBookingDateConfirm = (value: string) => {
    const formattedValue = formatShortDateInput(value);

    if (activeBookingDateField === 'checkIn') {
      setBookingDraft(current => {
        const normalizedCurrentCheckOut = normalizeDateString(current.checkOut);
        const defaultCheckOutValue = addDaysToIsoDate(value, 1);

        return {
          ...current,
          checkIn: formattedValue,
          checkOut:
            normalizedCurrentCheckOut && normalizedCurrentCheckOut > value
              ? current.checkOut
              : defaultCheckOutValue
                ? formatShortDateInput(defaultCheckOutValue)
                : '',
        };
      });
      setActiveBookingDateField('checkOut');
      return;
    }

    if (activeBookingDateField === 'checkOut') {
      setBookingDraft(current => ({
        ...current,
        checkOut: formattedValue,
      }));
    }

    closeBookingDatePicker();
  };

  const handleBookingDateClear = () => {
    if (activeBookingDateField === 'checkIn') {
      setBookingDraft(current => ({...current, checkIn: '', checkOut: ''}));
    }

    if (activeBookingDateField === 'checkOut') {
      setBookingDraft(current => ({...current, checkOut: ''}));
    }

    closeBookingDatePicker();
  };

  const openPropertyDetails = (property: PropertyRecord) => {
    setSelectedProperty(property);
    setCreatedBooking(null);
    setCreatedBookingMessage(null);
    setBookingDraft(createBookingDraft());
    setDetailVisible(true);
  };

  if (createdBooking) {
    return (
      <BookingDetailsScreen
        activeTab={activeTab}
        booking={createdBooking}
        initialMessage={createdBookingMessage}
        onBack={() => {
          setCreatedBooking(null);
          setCreatedBookingMessage(null);
        }}
        onBookingUpdated={updatedBooking => setCreatedBooking(updatedBooking)}
        onTabPress={tab => {
          setCreatedBooking(null);
          setCreatedBookingMessage(null);
          onTabPress(tab);
        }}
        viewerRole="tenant"
      />
    );
  }

  if (paymentVisible && selectedProperty) {
    return (
      <PropertyPaymentScreen
        activeTab={activeTab}
        bookingDraft={bookingDraft}
        onBack={() => setPaymentVisible(false)}
        onBookNow={async (paymentDraft: BookingPaymentDraft) => {
          const session = getAuthSession();
          const normalizedBookingCheckIn = normalizeDateString(bookingDraft.checkIn);
          const normalizedBookingCheckOut = normalizeDateString(
            bookingDraft.checkOut,
          );

          if (!session?.token) {
            throw new Error('Sign in to submit a booking.');
          }

          if (!normalizedBookingCheckIn || !normalizedBookingCheckOut) {
            throw new Error('Please add valid check-in and check-out dates.');
          }

          if (selectedProperty.monthlyRent === null) {
            throw new Error(
              'This property cannot be booked until the owner adds the monthly rent.',
            );
          }

          const nextCreatedBooking = await createBooking(session.token, {
            checkIn: normalizedBookingCheckIn,
            checkOut: normalizedBookingCheckOut,
            contactEmail: paymentDraft.email,
            contactName: paymentDraft.fullName,
            guestCount: bookingDraft.guestCount,
            propertyId: selectedProperty.id,
            serviceCategoryIds: bookingDraft.serviceCategoryIds,
            serviceNotes: bookingDraft.serviceNotes.trim() || null,
          });

          setBookingDraft(createBookingDraft());
          setPaymentVisible(false);
          setBookingVisible(false);
          setDetailVisible(false);
          setSelectedProperty(null);
          setCreatedBooking(nextCreatedBooking);
          setCreatedBookingMessage({
            text:
              'Your booking request was sent to the owner. After the owner confirms it, you can pay the 20% deposit from booking details.',
            tone: 'success',
          });
        }}
        onTabPress={tab => {
          setPaymentVisible(false);
          setBookingVisible(false);
          setDetailVisible(false);
          setCreatedBooking(null);
          setCreatedBookingMessage(null);
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
          setCreatedBooking(null);
          setCreatedBookingMessage(null);
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
          setCreatedBooking(null);
          setCreatedBookingMessage(null);
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
                onPress={() => openBookingDatePicker('checkIn')}
                value={bookingDraft.checkIn}
              />
              <DateInput
                label="Move-out"
                onPress={() => openBookingDatePicker('checkOut')}
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
                  const isBookable = hasPropertyBookableStayDates(
                    property.availableFrom,
                    property.availableTo,
                    todayIsoDate,
                  );

                  return (
                    <PropertyCard
                      availabilityInactive={!isBookable}
                      baths={`${property.bathrooms} bath`}
                      bedrooms={`${property.bedrooms} bedroom`}
                      facilityKeys={getAmenityOptionKeys(property.amenities)}
                      footerLabel={footerDetails.label}
                      footerValue={footerDetails.value}
                      key={property.id}
                      meta={getMetaText(property)}
                      onAvailabilityPress={() => openPropertyDetails(property)}
                      tag={getAvailabilityTagLabel(property, todayIsoDate)}
                      title={property.title}
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

        <CalendarPickerModal
          minimumValue={
            activeBookingDateField === 'checkOut'
              ? minimumCheckOutDate
              : todayIsoDate
          }
          onClear={handleBookingDateClear}
          onClose={closeBookingDatePicker}
          onConfirm={handleBookingDateConfirm}
          selectionMode={activeBookingDateField ?? 'checkIn'}
          title={
            activeBookingDateField === 'checkOut'
              ? 'Select move-out'
              : 'Select move-in'
          }
          value={
            activeBookingDateField === 'checkOut'
              ? bookingDraft.checkOut
              : bookingDraft.checkIn
          }
          visible={Boolean(activeBookingDateField)}
        />

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

      <HeaderProfileSwitcher />
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

const DateInput: React.FC<DateInputProps> = ({label, onPress, value}) => {
  return (
    <View style={styles.dateInputWrap}>
      <Text style={styles.dateInputLabel}>{label}</Text>
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={({pressed}) => [
          styles.dateInput,
          pressed ? styles.filterChipPressed : null,
        ]}>
        <Text
          style={[
            styles.dateInputText,
            value.trim().length === 0 ? styles.dateInputPlaceholderText : null,
          ]}>
          {value.trim().length > 0 ? value : 'DD/MM/YY'}
        </Text>
        <DateIcon height={18} width={18} />
      </Pressable>
    </View>
  );
};

const CalendarPickerModal: React.FC<CalendarPickerModalProps> = ({
  minimumValue,
  onClear,
  onClose,
  onConfirm,
  selectionMode,
  title,
  value,
  visible,
}) => {
  const initialCalendarState = getInitialCalendarState(value, minimumValue);
  const [displayYear, setDisplayYear] = useState(initialCalendarState.year);
  const [displayMonth, setDisplayMonth] = useState(initialCalendarState.monthIndex);
  const [selectedValue, setSelectedValue] = useState(
    initialCalendarState.selectedValue,
  );

  useEffect(() => {
    if (!visible) {
      return;
    }

    const nextCalendarState = getInitialCalendarState(value, minimumValue);
    setDisplayYear(nextCalendarState.year);
    setDisplayMonth(nextCalendarState.monthIndex);
    setSelectedValue(nextCalendarState.selectedValue);
  }, [minimumValue, value, visible]);

  const selectedParts = parseStoredDate(selectedValue);
  const calendarDays = buildCalendarGrid(displayYear, displayMonth);
  const autoCheckOutValue =
    selectionMode === 'checkIn' && selectedValue
      ? addDaysToIsoDate(selectedValue, 1)
      : null;
  const selectedDateSummary = selectedValue
    ? selectionMode === 'checkIn' && autoCheckOutValue
      ? `Move-in: ${formatShortDateInput(selectedValue)}\nMove-out: ${formatShortDateInput(autoCheckOutValue)}`
      : formatShortDateInput(selectedValue)
    : 'No date selected';
  const handleDayPress = (dayValue: string) => {
    setSelectedValue(dayValue);

    if (selectionMode === 'checkIn') {
      onConfirm(dayValue);
    }
  };

  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      transparent
      visible={visible}>
      <View style={styles.calendarOverlay}>
        <View style={styles.calendarCard}>
          <Text style={styles.calendarTitle}>{title}</Text>

          <View style={styles.calendarYearRow}>
            <Pressable
              accessibilityRole="button"
              onPress={() => setDisplayYear(current => current - 1)}
              style={({pressed}) => [
                styles.calendarYearButton,
                pressed ? styles.filterChipPressed : null,
              ]}>
              <Text style={styles.calendarYearButtonText}>-</Text>
            </Pressable>
            <Text style={styles.calendarYearText}>{String(displayYear)}</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => setDisplayYear(current => current + 1)}
              style={({pressed}) => [
                styles.calendarYearButton,
                pressed ? styles.filterChipPressed : null,
              ]}>
              <Text style={styles.calendarYearButtonText}>+</Text>
            </Pressable>
          </View>

          <View style={styles.calendarMonthGrid}>
            {monthLabels.map((monthLabel, index) => (
              <Pressable
                accessibilityRole="button"
                key={monthLabel}
                onPress={() => setDisplayMonth(index)}
                style={({pressed}) => [
                  styles.calendarMonthChip,
                  displayMonth === index ? styles.calendarMonthChipActive : null,
                  pressed ? styles.filterChipPressed : null,
                ]}>
                <Text
                  style={[
                    styles.calendarMonthChipText,
                    displayMonth === index
                      ? styles.calendarMonthChipTextActive
                      : null,
                  ]}>
                  {monthLabel}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.weekdayRow}>
            {weekdayLabels.map(day => (
              <Text key={day} style={styles.weekdayLabel}>
                {day}
              </Text>
            ))}
          </View>

          <View style={styles.calendarDayGrid}>
            {calendarDays.map((day, index) => {
              if (day === null) {
                return <View key={`empty-${index}`} style={styles.calendarDayCell} />;
              }

              const dayValue = formatCalendarDate(displayYear, displayMonth, day);
              const isDisabled = Boolean(
                minimumValue && dayValue < minimumValue,
              );
              const isSelected =
                selectedParts?.year === displayYear &&
                selectedParts?.monthIndex === displayMonth &&
                selectedParts?.day === day;

              return (
                <Pressable
                  accessibilityRole="button"
                  disabled={isDisabled}
                  key={`${displayYear}-${displayMonth}-${day}`}
                  onPress={() => handleDayPress(dayValue)}
                  style={({pressed}) => [
                    styles.calendarDayCell,
                    styles.calendarDayButton,
                    isSelected ? styles.calendarDayButtonActive : null,
                    isDisabled ? styles.calendarDayButtonDisabled : null,
                    pressed ? styles.filterChipPressed : null,
                  ]}>
                  <Text
                    style={[
                      styles.calendarDayText,
                      isSelected ? styles.calendarDayTextActive : null,
                      isDisabled ? styles.calendarDayTextDisabled : null,
                    ]}>
                    {String(day)}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.calendarSelectedText}>{selectedDateSummary}</Text>

          <View style={styles.calendarFooter}>
            <Pressable
              accessibilityRole="button"
              onPress={onClear}
              style={({pressed}) => [
                styles.calendarFooterButton,
                styles.calendarFooterButtonSecondary,
                pressed ? styles.filterChipPressed : null,
              ]}>
              <Text style={styles.calendarFooterButtonSecondaryText}>Clear</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={onClose}
              style={({pressed}) => [
                styles.calendarFooterButton,
                styles.calendarFooterButtonSecondary,
                pressed ? styles.filterChipPressed : null,
              ]}>
              <Text style={styles.calendarFooterButtonSecondaryText}>Cancel</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => onConfirm(selectedValue)}
              style={({pressed}) => [
                styles.calendarFooterButton,
                styles.calendarFooterButtonPrimary,
                pressed ? styles.filterChipPressed : null,
              ]}>
              <Text style={styles.calendarFooterButtonPrimaryText}>Apply</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

type PropertyCardProps = {
  availabilityInactive?: boolean;
  baths: string;
  bedrooms: string;
  facilityKeys: AmenityOptionKey[];
  footerLabel: string;
  footerValue: string;
  meta: string;
  onAvailabilityPress: () => void;
  tag: string;
  title: string;
};

const PropertyCard: React.FC<PropertyCardProps> = ({
  availabilityInactive,
  baths,
  bedrooms,
  facilityKeys,
  footerLabel,
  footerValue,
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
          {facilityKeys.map(key => (
            <Amenity
              icon={getAmenityIcon(key)}
              key={key}
              label={getAmenityOptionLabel(key)}
            />
          ))}
        </View>

        <Text numberOfLines={1} style={styles.propertyMeta}>
          {meta || 'Location unavailable'}
        </Text>

        <Pressable
          accessibilityRole="button"
          onPress={onAvailabilityPress}
          style={[
            styles.availabilityChip,
            availabilityInactive ? styles.availabilityChipInactive : null,
          ]}>
          <Text
            numberOfLines={1}
            style={[
              styles.availabilityText,
              availabilityInactive ? styles.availabilityTextInactive : null,
            ]}>
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
  dateInputPlaceholderText: {
    color: '#B1B1B1',
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
  calendarOverlay: {
    flex: 1,
    backgroundColor: 'rgba(25, 21, 19, 0.34)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  calendarCard: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 18,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  calendarTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 18,
    marginBottom: spacing.md,
  },
  calendarYearRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  calendarYearButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DDD6CF',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAF7F3',
  },
  calendarYearButtonText: {
    color: colors.textPrimary,
    fontFamily: fonts.semibold,
    fontSize: 18,
    lineHeight: 20,
  },
  calendarYearText: {
    minWidth: 72,
    textAlign: 'center',
    color: colors.textPrimary,
    fontFamily: fonts.semibold,
    fontSize: 16,
  },
  calendarMonthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  calendarMonthChip: {
    minWidth: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DDD6CF',
    paddingHorizontal: 10,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  calendarMonthChipActive: {
    borderColor: colors.primary,
    backgroundColor: '#EEF6F2',
  },
  calendarMonthChipText: {
    color: colors.textPrimary,
    fontFamily: fonts.regular,
    fontSize: 12,
  },
  calendarMonthChipTextActive: {
    color: colors.primary,
    fontFamily: fonts.medium,
  },
  weekdayRow: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  weekdayLabel: {
    width: `${100 / 7}%`,
    textAlign: 'center',
    color: '#7B756E',
    fontFamily: fonts.medium,
    fontSize: 12,
  },
  calendarDayGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.sm,
  },
  calendarDayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarDayButton: {
    borderRadius: 12,
  },
  calendarDayButtonActive: {
    backgroundColor: colors.primary,
  },
  calendarDayButtonDisabled: {
    backgroundColor: '#F5F1EB',
  },
  calendarDayText: {
    color: colors.textPrimary,
    fontFamily: fonts.regular,
    fontSize: 13,
  },
  calendarDayTextActive: {
    color: colors.white,
    fontFamily: fonts.semibold,
  },
  calendarDayTextDisabled: {
    color: '#B9B1A8',
  },
  calendarSelectedText: {
    color: '#6F675F',
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: spacing.md,
    minHeight: 36,
  },
  calendarFooter: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  calendarFooterButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarFooterButtonSecondary: {
    borderWidth: 1,
    borderColor: '#DDD6CF',
    backgroundColor: '#FAF7F3',
  },
  calendarFooterButtonPrimary: {
    backgroundColor: colors.primary,
  },
  calendarFooterButtonSecondaryText: {
    color: colors.textPrimary,
    fontFamily: fonts.medium,
    fontSize: 13,
  },
  calendarFooterButtonPrimaryText: {
    color: colors.white,
    fontFamily: fonts.semibold,
    fontSize: 13,
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
  availabilityChipInactive: {
    backgroundColor: '#E7E1DB',
  },
  availabilityText: {
    color: colors.white,
    fontFamily: fonts.medium,
    fontSize: 13,
  },
  availabilityTextInactive: {
    color: '#6A625A',
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
