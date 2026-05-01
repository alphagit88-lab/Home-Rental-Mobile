import React, {useEffect, useState} from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Modal,
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
import {WebView, WebViewMessageEvent} from 'react-native-webview';
import BackIcon from '../assets/images/left-arrow 2.svg';
import PlusIcon from '../assets/images/Button_ plus.svg';
import MinusIcon from '../assets/images/Button_ minus.svg';
import DateIcon from '../assets/images/clarity_date-line.svg';
import MapMarkerIcon from '../assets/images/mdi_map-marker.svg';
import DropdownIcon from '../assets/images/Vector 13.svg';
import {AppBottomNav, AppTab} from '../components/AppBottomNav';
import {
  PropertyLocationCoordinate,
  PropertyLocationPickerModal,
} from '../components/PropertyLocationPickerModal';
import {useResponsive} from '../hooks/useResponsive';
import {getAuthSession} from '../services/authSession';
import {
  createProperty,
  PropertyRecord,
  SavePropertyParams,
  updateProperty,
} from '../services/properties';
import {colors, fonts, spacing} from '../theme';
import {formatIsoDateInput, normalizeDateString} from '../utils/dateInput';
import {
  AmenityOptionKey,
  AMENITY_OPTIONS,
  getAmenityOptionKeys,
  getAmenityOptionLabels,
} from '../utils/propertyAmenities';

type OwnerAddPropertyScreenProps = {
  activeTab: AppTab;
  headerTitle?: string;
  mode?: 'create' | 'edit';
  onBackPress: () => void;
  onPropertySaved?: (property: PropertyRecord) => void;
  onTabPress: (tab: AppTab) => void;
  property?: PropertyRecord | null;
  submitLabel?: string;
};

type SelectFieldProps = {
  isOpen: boolean;
  label: string;
  onOptionSelect: (value: string) => void;
  onToggleOpen: () => void;
  options: string[];
  value: string;
};

type MapPickerFieldProps = {
  hasValue: boolean;
  label: string;
  onPress: () => void;
  value: string;
};

type TextFieldProps = {
  keyboardType?: 'default' | 'decimal-pad' | 'number-pad';
  label: string;
  maxLength?: number;
  onChangeText: (value: string) => void;
  placeholder: string;
  value: string;
};

type LargeFieldProps = {
  label: string;
  minHeight: number;
  onChangeText: (value: string) => void;
  placeholder: string;
  value: string;
};

type NumberStepperFieldProps = {
  label: string;
  onChangeText: (value: string) => void;
  onDecrement: () => void;
  onIncrement: () => void;
  value: string;
};

type DateFieldProps = {
  label: string;
  onPress: () => void;
  value: string;
};

type AmenitiesDropdownFieldProps = {
  isOpen: boolean;
  label: string;
  onOptionToggle: (key: AmenityOptionKey) => void;
  onToggleOpen: () => void;
  selectedKeys: AmenityOptionKey[];
};

type CalendarPickerModalProps = {
  onClear: () => void;
  onClose: () => void;
  onConfirm: (value: string) => void;
  minimumValue?: string | null;
  title: string;
  value: string;
  visible: boolean;
};

type GalleryPickerFieldProps = {
  imageUris: string[];
  label: string;
  onAddImages: () => void;
  onRemoveImage: (uri: string) => void;
};

type GalleryPickerModalProps = {
  onClose: () => void;
  onImagesSelected: (images: string[]) => void;
  visible: boolean;
};

type PropertyStatusFieldProps = {
  isActive: boolean;
  onStatusChange: (value: boolean) => void;
};

const propertyTypeOptions = ['Apartment', 'House', 'Room / Boarding'];
const listingTypeOptions = ['For Rent', 'Short-term'];
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
const galleryPickerHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1, maximum-scale=1"
    />
    <style>
      body {
        margin: 0;
        padding: 24px;
        font-family: sans-serif;
        background: #fff9f0;
        color: #191513;
      }

      .wrap {
        display: flex;
        min-height: 100vh;
        flex-direction: column;
        justify-content: center;
        gap: 16px;
      }

      h1 {
        margin: 0;
        font-size: 22px;
      }

      p {
        margin: 0;
        font-size: 14px;
        line-height: 1.5;
        color: #6f675f;
      }

      button {
        height: 48px;
        border: none;
        border-radius: 12px;
        background: #3f6d5f;
        color: white;
        font-size: 15px;
        font-weight: 600;
      }

      input {
        display: none;
      }
    </style>
  </head>
  <body>
    <div class="wrap">
      <h1>Select Images</h1>
      <p>Choose images from your phone gallery and they will be added to the property gallery.</p>
      <button id="pickButton" type="button">Choose Images</button>
      <input id="fileInput" type="file" accept="image/*" multiple />
    </div>
    <script>
      const fileInput = document.getElementById('fileInput');
      const pickButton = document.getElementById('pickButton');

      const postMessage = payload => {
        window.ReactNativeWebView.postMessage(JSON.stringify(payload));
      };

      pickButton.addEventListener('click', () => fileInput.click());

      fileInput.addEventListener('change', async event => {
        const files = Array.from(event.target.files || []);

        if (!files.length) {
          postMessage({ type: 'cancel' });
          return;
        }

        try {
          const images = await Promise.all(
            files.map(
              file =>
                new Promise((resolve, reject) => {
                  const reader = new FileReader();
                  reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
                  reader.onerror = () => reject(new Error('read_failed'));
                  reader.readAsDataURL(file);
                }),
            ),
          );

          postMessage({
            type: 'selected',
            images: images.filter(image => typeof image === 'string' && image.length > 0),
          });
        } catch (error) {
          postMessage({ type: 'error' });
        }
      });
    </script>
  </body>
</html>`;

const formatCoordinateValue = (value?: number) =>
  typeof value === 'number' && Number.isFinite(value) ? value.toFixed(6) : '';

const formatMoneyValue = (value?: number | null) =>
  typeof value === 'number' && Number.isFinite(value) ? String(value) : '';

const formatDateValue = (value?: string | null) => formatIsoDateInput(value);

const parseMoneyValue = (value: string) => {
  const normalizedValue = value.trim();

  if (normalizedValue.length === 0) {
    return null;
  }

  const parsed = Number(normalizedValue);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : NaN;
};

const isValidDateValue = (value: string) => {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(value) && normalizeDateString(value) === value
  );
};

const normalizeDateValue = (value: string) => {
  const normalizedValue = value.trim();

  if (normalizedValue.length === 0) {
    return null;
  }

  return isValidDateValue(normalizedValue) ? normalizedValue : 'INVALID_DATE';
};

const hasValidCoordinate = (value: number, min: number, max: number) =>
  Number.isFinite(value) && value >= min && value <= max;

const formatCounterValue = (value: number) => String(value).padStart(2, '0');

const sanitizeCounterInput = (value: string) => value.replace(/[^0-9]/g, '');

const adjustCounterValue = (value: string, delta: number) => {
  const parsed = Number(sanitizeCounterInput(value));
  const nextValue =
    Number.isFinite(parsed) && parsed > 0 ? parsed + delta : 1 + delta;

  return formatCounterValue(Math.max(1, nextValue));
};

const parseStoredDate = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const [yearString, monthString, dayString] = value.split('-');
  const year = Number(yearString);
  const month = Number(monthString);
  const day = Number(dayString);

  if (
    !Number.isFinite(year) ||
    !Number.isFinite(month) ||
    !Number.isFinite(day) ||
    month < 1 ||
    month > 12
  ) {
    return null;
  }

  return {
    day,
    monthIndex: month - 1,
    year,
  };
};

const getDaysInMonth = (year: number, monthIndex: number) =>
  new Date(year, monthIndex + 1, 0).getDate();

const getTodayIsoDate = () => {
  const currentDate = new Date();

  return formatCalendarDate(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    currentDate.getDate(),
  );
};

const getLaterIsoDate = (firstValue: string, secondValue: string) =>
  firstValue >= secondValue ? firstValue : secondValue;

const formatCalendarDate = (year: number, monthIndex: number, day: number) =>
  `${String(year).padStart(4, '0')}-${String(monthIndex + 1).padStart(
    2,
    '0',
  )}-${String(day).padStart(2, '0')}`;

const buildCalendarGrid = (year: number, monthIndex: number) => {
  const firstWeekday = new Date(year, monthIndex, 1).getDay();
  const totalDays = getDaysInMonth(year, monthIndex);
  const leadingSlots = Array.from({length: firstWeekday}, () => null);
  const daySlots = Array.from({length: totalDays}, (_, index) => index + 1);
  const trailingCount = (7 - ((leadingSlots.length + daySlots.length) % 7)) % 7;
  const trailingSlots = Array.from({length: trailingCount}, () => null);

  return [...leadingSlots, ...daySlots, ...trailingSlots];
};

const getInitialCalendarState = (
  value: string,
  minimumValue?: string | null,
) => {
  const normalizedMinimumValue =
    minimumValue && normalizeDateString(minimumValue) ? minimumValue : null;
  const parsedDate =
    value.trim().length > 0 &&
    (!normalizedMinimumValue || value >= normalizedMinimumValue)
      ? parseStoredDate(value)
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
    selectedValue: parsedDate ? value : '',
    year: parsedDate?.year ?? fallbackDate?.year ?? currentDate.getFullYear(),
  };
};

const getInitialCoordinate = (
  currentProperty?: PropertyRecord | null,
): PropertyLocationCoordinate | null => {
  if (
    !currentProperty ||
    !hasValidCoordinate(currentProperty.latitude, -90, 90) ||
    !hasValidCoordinate(currentProperty.longitude, -180, 180)
  ) {
    return null;
  }

  return {
    latitude: currentProperty.latitude,
    longitude: currentProperty.longitude,
  };
};

const formatCoordinateSummary = (
  coordinate: PropertyLocationCoordinate | null,
) =>
  coordinate
    ? `Lat ${formatCoordinateValue(coordinate.latitude)}, Lng ${formatCoordinateValue(
        coordinate.longitude,
      )}`
    : 'Select';

export const OwnerAddPropertyScreen: React.FC<OwnerAddPropertyScreenProps> = ({
  activeTab,
  headerTitle = 'Add new Property',
  mode = 'create',
  onBackPress,
  onPropertySaved,
  onTabPress,
  property,
  submitLabel = 'ADD NEW PROPERTY',
}) => {
  const responsive = useResponsive();
  const [propertyName, setPropertyName] = useState(property?.title ?? '');
  const [propertyTypeIndex, setPropertyTypeIndex] = useState(() => {
    const index = propertyTypeOptions.indexOf(
      property?.propertyType ?? 'Apartment',
    );
    return index >= 0 ? index : 0;
  });
  const [isPropertyTypeOpen, setIsPropertyTypeOpen] = useState(false);
  const [listingTypeIndex, setListingTypeIndex] = useState(() => {
    const index = listingTypeOptions.indexOf(
      property?.listingType ?? 'For Rent',
    );
    return index >= 0 ? index : 0;
  });
  const [isListingTypeOpen, setIsListingTypeOpen] = useState(false);
  const [bedrooms, setBedrooms] = useState(
    formatCounterValue(property?.bedrooms ?? 1),
  );
  const [bathrooms, setBathrooms] = useState(
    formatCounterValue(property?.bathrooms ?? 1),
  );
  const [monthlyRent, setMonthlyRent] = useState(
    formatMoneyValue(property?.monthlyRent),
  );
  const [availableFrom, setAvailableFrom] = useState(
    formatDateValue(property?.availableFrom),
  );
  const [availableTo, setAvailableTo] = useState(
    formatDateValue(property?.availableTo),
  );
  const [selectedAmenityKeys, setSelectedAmenityKeys] = useState<
    AmenityOptionKey[]
  >(() => getAmenityOptionKeys(property?.amenities ?? []));
  const [isAmenitiesDropdownOpen, setIsAmenitiesDropdownOpen] = useState(false);
  const [location, setLocation] = useState(property?.locationText ?? '');
  const [selectedCoordinate, setSelectedCoordinate] =
    useState<PropertyLocationCoordinate | null>(() =>
      getInitialCoordinate(property),
    );
  const [isMapPickerVisible, setIsMapPickerVisible] = useState(false);
  const [isGalleryPickerVisible, setIsGalleryPickerVisible] = useState(false);
  const [gallery, setGallery] = useState<string[]>(property?.galleryUrls ?? []);
  const [activeDateField, setActiveDateField] = useState<'from' | 'to' | null>(
    null,
  );
  const [description, setDescription] = useState(property?.description ?? '');
  const [isPropertyActive, setIsPropertyActive] = useState(
    property?.isActive ?? true,
  );
  const [submitState, setSubmitState] = useState<'idle' | 'loading' | 'error'>(
    'idle',
  );
  const [inlineMessage, setInlineMessage] = useState<string | null>(null);
  const todayIsoDate = getTodayIsoDate();
  const normalizedAvailableFrom = normalizeDateString(availableFrom) ?? '';
  const minimumAvailableToDate = normalizedAvailableFrom
    ? getLaterIsoDate(todayIsoDate, normalizedAvailableFrom)
    : todayIsoDate;

  const togglePropertyTypeOpen = () => {
    setIsListingTypeOpen(false);
    setIsAmenitiesDropdownOpen(false);
    setIsPropertyTypeOpen(current => !current);
  };

  const toggleListingTypeOpen = () => {
    setIsPropertyTypeOpen(false);
    setIsAmenitiesDropdownOpen(false);
    setIsListingTypeOpen(current => !current);
  };

  const toggleAmenitiesOpen = () => {
    setIsPropertyTypeOpen(false);
    setIsListingTypeOpen(false);
    setIsAmenitiesDropdownOpen(current => !current);
  };

  const updateBedrooms = (value: string) => {
    const nextValue = sanitizeCounterInput(value);
    setBedrooms(nextValue.length > 0 ? nextValue : '');
  };

  const updateBathrooms = (value: string) => {
    const nextValue = sanitizeCounterInput(value);
    setBathrooms(nextValue.length > 0 ? nextValue : '');
  };

  const openDatePicker = (field: 'from' | 'to') => {
    setIsPropertyTypeOpen(false);
    setIsListingTypeOpen(false);
    setIsAmenitiesDropdownOpen(false);
    setActiveDateField(field);
  };

  const openGalleryPicker = () => {
    setIsPropertyTypeOpen(false);
    setIsListingTypeOpen(false);
    setIsAmenitiesDropdownOpen(false);
    setIsGalleryPickerVisible(true);
  };

  const closeDatePicker = () => setActiveDateField(null);
  const closeGalleryPicker = () => setIsGalleryPickerVisible(false);

  const handleDateConfirm = (value: string) => {
    if (activeDateField === 'from') {
      setAvailableFrom(value);

      if (availableTo && value && availableTo < value) {
        setAvailableTo(value);
      }
    }

    if (activeDateField === 'to') {
      setAvailableTo(value);
    }

    closeDatePicker();
  };

  const handleDateClear = () => {
    if (activeDateField === 'from') {
      setAvailableFrom('');
    }

    if (activeDateField === 'to') {
      setAvailableTo('');
    }

    closeDatePicker();
  };

  const handleGalleryImagesSelected = (images: string[]) => {
    if (images.length === 0) {
      closeGalleryPicker();
      return;
    }

    setInlineMessage(null);
    setSubmitState('idle');
    setGallery(current => Array.from(new Set([...current, ...images])));
    closeGalleryPicker();
  };

  const handleSubmit = async () => {
    if (!propertyName.trim() || !location.trim()) {
      setSubmitState('error');
      setInlineMessage(
        'Please complete at least the property name and location.',
      );
      return;
    }

    const bedroomsValue = Number(bedrooms);
    const bathroomsValue = Number(bathrooms);

    if (!Number.isFinite(bedroomsValue) || bedroomsValue <= 0) {
      setSubmitState('error');
      setInlineMessage('Please enter a valid number of bedrooms.');
      return;
    }

    if (!Number.isFinite(bathroomsValue) || bathroomsValue <= 0) {
      setSubmitState('error');
      setInlineMessage('Please enter a valid number of bathrooms.');
      return;
    }

    const parsedMonthlyRent = parseMoneyValue(monthlyRent);

    if (Number.isNaN(parsedMonthlyRent)) {
      setSubmitState('error');
      setInlineMessage(
        'Monthly rent must be a valid number greater than or equal to 0.',
      );
      return;
    }

    const normalizedAvailableFrom = normalizeDateValue(availableFrom);
    const normalizedAvailableTo = normalizeDateValue(availableTo);

    if (normalizedAvailableFrom === 'INVALID_DATE') {
      setSubmitState('error');
      setInlineMessage('Available from must use the YYYY-MM-DD date format.');
      return;
    }

    if (normalizedAvailableTo === 'INVALID_DATE') {
      setSubmitState('error');
      setInlineMessage('Available to must use the YYYY-MM-DD date format.');
      return;
    }

    if (
      normalizedAvailableFrom &&
      normalizedAvailableTo &&
      normalizedAvailableTo < normalizedAvailableFrom
    ) {
      setSubmitState('error');
      setInlineMessage('Available to must be on or after available from.');
      return;
    }

    const session = getAuthSession();
    if (!session?.token) {
      setSubmitState('error');
      setInlineMessage('Please sign in again before saving this property.');
      return;
    }

    const payload: SavePropertyParams = {
      title: propertyName.trim(),
      propertyType: propertyTypeOptions[propertyTypeIndex],
      listingType: listingTypeOptions[listingTypeIndex],
      bedrooms: bedroomsValue,
      bathrooms: bathroomsValue,
      monthlyRent: parsedMonthlyRent,
      availableFrom: normalizedAvailableFrom,
      availableTo: normalizedAvailableTo,
      amenities: getAmenityOptionLabels(selectedAmenityKeys),
      locationText: location.trim(),
      latitude: selectedCoordinate?.latitude,
      longitude: selectedCoordinate?.longitude,
      galleryUrls: gallery,
      description: description.trim(),
      ...(mode === 'edit' ? {isActive: isPropertyActive} : {}),
    };

    setSubmitState('loading');
    setInlineMessage(null);

    try {
      const savedProperty =
        mode === 'edit' && property
          ? await updateProperty(session.token, property.id, payload)
          : await createProperty(session.token, payload);

      setSubmitState('idle');
      setInlineMessage(
        mode === 'edit'
          ? 'Property updated successfully.'
          : 'Property created successfully.',
      );
      onPropertySaved?.(savedProperty);
    } catch (error) {
      setSubmitState('error');
      setInlineMessage(
        error instanceof Error
          ? error.message
          : 'Unable to save this property right now.',
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}>
        <View style={styles.root}>
          <View style={styles.header}>
            <View
              style={[
                styles.headerContent,
                {paddingHorizontal: responsive.horizontalPadding},
              ]}>
              <Pressable
                accessibilityRole="button"
                hitSlop={10}
                onPress={onBackPress}
                style={styles.backButton}>
                <BackIcon height={18} width={18} />
              </Pressable>

              <Text style={styles.headerTitle}>{headerTitle}</Text>

              <View style={styles.headerSpacer} />
            </View>
          </View>

          <ScrollView
            contentContainerStyle={[
              styles.scrollContent,
              {
                paddingHorizontal: responsive.horizontalPadding,
                paddingTop: spacing.md,
              },
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <View
              style={[
                styles.contentWidth,
                {maxWidth: responsive.maxContentWidth},
              ]}>
              <TextField
                label="Property Name"
                onChangeText={setPropertyName}
                placeholder="Property Name"
                value={propertyName}
              />

              <SelectField
                isOpen={isPropertyTypeOpen}
                label="Property Type"
                onOptionSelect={value => {
                  const index = propertyTypeOptions.indexOf(value);
                  setPropertyTypeIndex(index >= 0 ? index : 0);
                  setIsPropertyTypeOpen(false);
                }}
                onToggleOpen={togglePropertyTypeOpen}
                options={propertyTypeOptions}
                value={propertyTypeOptions[propertyTypeIndex]}
              />

              <SelectField
                isOpen={isListingTypeOpen}
                label="Listing Type"
                onOptionSelect={value => {
                  const index = listingTypeOptions.indexOf(value);
                  setListingTypeIndex(index >= 0 ? index : 0);
                  setIsListingTypeOpen(false);
                }}
                onToggleOpen={toggleListingTypeOpen}
                options={listingTypeOptions}
                value={listingTypeOptions[listingTypeIndex]}
              />

              <NumberStepperField
                label="Number of Bedrooms"
                onChangeText={updateBedrooms}
                onDecrement={() =>
                  setBedrooms(current => adjustCounterValue(current, -1))
                }
                onIncrement={() =>
                  setBedrooms(current => adjustCounterValue(current, 1))
                }
                value={bedrooms}
              />

              <NumberStepperField
                label="Number of Bathrooms"
                onChangeText={updateBathrooms}
                onDecrement={() =>
                  setBathrooms(current => adjustCounterValue(current, -1))
                }
                onIncrement={() =>
                  setBathrooms(current => adjustCounterValue(current, 1))
                }
                value={bathrooms}
              />

              <TextField
                keyboardType="decimal-pad"
                label=" Rent Fee (LKR)"
                onChangeText={setMonthlyRent}
                placeholder="45000"
                value={monthlyRent}
              />

              <DateField
                label="Available From"
                onPress={() => openDatePicker('from')}
                value={availableFrom}
              />

              <DateField
                label="Available To"
                onPress={() => openDatePicker('to')}
                value={availableTo}
              />

              <Text style={styles.helperText}>
                Tap the calendar icon to choose the available date range. Leave
                the dates empty if the property is available anytime.
              </Text>

              <AmenitiesDropdownField
                label="Amenities & Facilities"
                isOpen={isAmenitiesDropdownOpen}
                onOptionToggle={key =>
                  setSelectedAmenityKeys(current =>
                    current.includes(key)
                      ? current.filter(item => item !== key)
                      : [...current, key],
                  )
                }
                onToggleOpen={() => toggleAmenitiesOpen()}
                selectedKeys={selectedAmenityKeys}
              />

              <Text style={styles.helperText}>
                Select the facilities that should appear on the tenant property
                cards.
              </Text>

              <TextField
                label="Location"
                onChangeText={setLocation}
                placeholder="Add Location"
                value={location}
              />

              <MapPickerField
                hasValue={Boolean(selectedCoordinate)}
                label="Select on Map"
                onPress={() => setIsMapPickerVisible(true)}
                value={formatCoordinateSummary(selectedCoordinate)}
              />

              <Text style={styles.helperText}>
                {selectedCoordinate
                  ? `Saved coordinates: ${formatCoordinateValue(
                      selectedCoordinate.latitude,
                    )}, ${formatCoordinateValue(selectedCoordinate.longitude)}.`
                  : 'Open the map, tap the exact property spot, and the app will save latitude and longitude automatically.'}
              </Text>

              <GalleryPickerField
                imageUris={gallery}
                label="Gallery"
                onAddImages={openGalleryPicker}
                onRemoveImage={uri =>
                  setGallery(current => current.filter(item => item !== uri))
                }
              />

              <LargeField
                label="Description"
                minHeight={88}
                onChangeText={setDescription}
                placeholder="Property Description"
                value={description}
              />

              {mode === 'edit' ? (
                <PropertyStatusField
                  isActive={isPropertyActive}
                  onStatusChange={setIsPropertyActive}
                />
              ) : null}

              {inlineMessage ? (
                <Text
                  style={[
                    styles.inlineMessage,
                    submitState === 'error'
                      ? styles.inlineMessageError
                      : styles.inlineMessageSuccess,
                  ]}>
                  {inlineMessage}
                </Text>
              ) : null}

              <Pressable
                accessibilityRole="button"
                onPress={handleSubmit}
                style={({pressed}) => [
                  styles.submitButton,
                  submitState === 'loading' ? styles.submitButtonLoading : null,
                  pressed ? styles.pressed : null,
                ]}>
                <Text style={styles.submitButtonText}>
                  {submitState === 'loading' ? 'SAVING...' : submitLabel}
                </Text>
              </Pressable>
            </View>
          </ScrollView>

          <PropertyLocationPickerModal
            initialCoordinate={selectedCoordinate}
            onClose={() => setIsMapPickerVisible(false)}
            onConfirm={coordinate => {
              setSelectedCoordinate(coordinate);
              setIsMapPickerVisible(false);
            }}
            visible={isMapPickerVisible}
          />

          <CalendarPickerModal
            onClear={handleDateClear}
            onClose={closeDatePicker}
            onConfirm={handleDateConfirm}
            minimumValue={
              activeDateField === 'to' ? minimumAvailableToDate : todayIsoDate
            }
            title={
              activeDateField === 'to'
                ? 'Select available to'
                : 'Select available from'
            }
            value={activeDateField === 'to' ? availableTo : availableFrom}
            visible={Boolean(activeDateField)}
          />

          <GalleryPickerModal
            onClose={closeGalleryPicker}
            onImagesSelected={handleGalleryImagesSelected}
            visible={isGalleryPickerVisible}
          />

          <AppBottomNav activeTab={activeTab} onTabPress={onTabPress} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const TextField: React.FC<TextFieldProps> = ({
  keyboardType = 'default',
  label,
  maxLength,
  onChangeText,
  placeholder,
  value,
}) => {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        keyboardType={keyboardType}
        maxLength={maxLength}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#B6B1AB"
        selectionColor={colors.primary}
        style={styles.input}
        value={value}
      />
    </View>
  );
};

const SelectField: React.FC<SelectFieldProps> = ({
  isOpen,
  label,
  onOptionSelect,
  onToggleOpen,
  options,
  value,
}) => {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Pressable
        accessibilityRole="button"
        onPress={onToggleOpen}
        style={({pressed}) => [
          styles.selectField,
          isOpen ? styles.selectFieldOpen : null,
          pressed ? styles.pressed : null,
        ]}>
        <Text numberOfLines={1} style={styles.selectValue}>
          {value}
        </Text>
        <DropdownIcon height={6} width={10} />
      </Pressable>

      {isOpen ? (
        <View style={styles.dropdownPanel}>
          {options.map(option => {
            const isSelected = option === value;

            return (
              <Pressable
                accessibilityRole="button"
                key={option}
                onPress={() => onOptionSelect(option)}
                style={({pressed}) => [
                  styles.dropdownOption,
                  pressed ? styles.pressed : null,
                ]}>
                <View
                  style={[
                    styles.checkbox,
                    isSelected ? styles.checkboxSelected : null,
                  ]}>
                  {isSelected ? <View style={styles.checkboxInner} /> : null}
                </View>
                <Text style={styles.dropdownOptionText}>{option}</Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </View>
  );
};

const NumberStepperField: React.FC<NumberStepperFieldProps> = ({
  label,
  onChangeText,
  onDecrement,
  onIncrement,
  value,
}) => {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.stepperField}>
        <TextInput
          keyboardType="number-pad"
          onChangeText={onChangeText}
          placeholder="01"
          placeholderTextColor="#B6B1AB"
          selectionColor={colors.primary}
          style={styles.stepperInput}
          value={value}
        />
        <View style={styles.stepperButtons}>
          <Pressable
            accessibilityRole="button"
            onPress={onIncrement}
            style={({pressed}) => [
              styles.stepperButton,
              styles.stepperButtonTop,
              pressed ? styles.pressed : null,
            ]}>
            <PlusIcon height={14} width={14} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={onDecrement}
            style={({pressed}) => [
              styles.stepperButton,
              pressed ? styles.pressed : null,
            ]}>
            <MinusIcon height={14} width={14} />
          </Pressable>
        </View>
      </View>
    </View>
  );
};

const DateField: React.FC<DateFieldProps> = ({label, onPress, value}) => {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={({pressed}) => [
          styles.dateField,
          pressed ? styles.pressed : null,
        ]}>
        <Text
          style={[
            styles.dateFieldValue,
            value.trim().length === 0 ? styles.placeholderValue : null,
          ]}>
          {value.trim().length > 0 ? value : 'Select date'}
        </Text>
        <DateIcon height={18} width={18} />
      </Pressable>
    </View>
  );
};

const AmenitiesDropdownField: React.FC<AmenitiesDropdownFieldProps> = ({
  isOpen,
  label,
  onOptionToggle,
  onToggleOpen,
  selectedKeys,
}) => {
  const selectedLabels = getAmenityOptionLabels(selectedKeys);

  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Pressable
        accessibilityRole="button"
        onPress={onToggleOpen}
        style={({pressed}) => [
          styles.selectField,
          isOpen ? styles.selectFieldOpen : null,
          pressed ? styles.pressed : null,
        ]}>
        <Text
          numberOfLines={1}
          style={[
            styles.selectValue,
            selectedLabels.length === 0 ? styles.placeholderValue : null,
          ]}>
          {selectedLabels.length > 0
            ? selectedLabels.join(', ')
            : 'Select amenities'}
        </Text>
        <DropdownIcon height={6} width={10} />
      </Pressable>

      {isOpen ? (
        <View style={styles.dropdownPanel}>
          {AMENITY_OPTIONS.map(option => {
            const isSelected = selectedKeys.includes(option.key);

            return (
              <Pressable
                accessibilityRole="button"
                key={option.key}
                onPress={() => onOptionToggle(option.key)}
                style={({pressed}) => [
                  styles.dropdownOption,
                  pressed ? styles.pressed : null,
                ]}>
                <View
                  style={[
                    styles.checkbox,
                    isSelected ? styles.checkboxSelected : null,
                  ]}>
                  {isSelected ? <View style={styles.checkboxInner} /> : null}
                </View>
                <Text style={styles.dropdownOptionText}>{option.label}</Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </View>
  );
};

const GalleryPickerField: React.FC<GalleryPickerFieldProps> = ({
  imageUris,
  label,
  onAddImages,
  onRemoveImage,
}) => {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Pressable
        accessibilityRole="button"
        onPress={onAddImages}
        style={({pressed}) => [
          styles.galleryPickerButton,
          pressed ? styles.pressed : null,
        ]}>
        <Text style={styles.galleryPickerText}>
          {imageUris.length > 0
            ? `${imageUris.length} image${imageUris.length === 1 ? '' : 's'} selected`
            : 'Choose images from phone'}
        </Text>
        <Text style={styles.galleryPickerAction}>ADD</Text>
      </Pressable>

      {imageUris.length > 0 ? (
        <View style={styles.galleryPreviewGrid}>
          {imageUris.map(uri => (
            <View key={uri} style={styles.galleryPreviewCard}>
              <Image source={{uri}} style={styles.galleryPreviewImage} />
              <Pressable
                accessibilityRole="button"
                onPress={() => onRemoveImage(uri)}
                style={({pressed}) => [
                  styles.galleryRemoveButton,
                  pressed ? styles.pressed : null,
                ]}>
                <Text style={styles.galleryRemoveButtonText}>Remove</Text>
              </Pressable>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
};

const GalleryPickerModal: React.FC<GalleryPickerModalProps> = ({
  onClose,
  onImagesSelected,
  visible,
}) => {
  const handleMessage = (event: WebViewMessageEvent) => {
    try {
      const payload = JSON.parse(event.nativeEvent.data) as {
        images?: string[];
        type?: string;
      };

      if (payload.type === 'selected') {
        onImagesSelected(
          Array.isArray(payload.images)
            ? payload.images.filter(image => image.trim().length > 0)
            : [],
        );
        return;
      }

      if (payload.type === 'cancel') {
        onClose();
        return;
      }

      if (payload.type === 'error') {
        onClose();
      }
    } catch (error) {
      onClose();
    }
  };

  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      transparent
      visible={visible}>
      <View style={styles.galleryModalOverlay}>
        <View style={styles.galleryModalCard}>
          <View style={styles.galleryModalHeader}>
            <Text style={styles.galleryModalTitle}>Gallery</Text>
            <Pressable
              accessibilityRole="button"
              onPress={onClose}
              style={({pressed}) => [
                styles.galleryModalCloseButton,
                pressed ? styles.pressed : null,
              ]}>
              <Text style={styles.galleryModalCloseText}>Close</Text>
            </Pressable>
          </View>

          <WebView
            onMessage={handleMessage}
            originWhitelist={['*']}
            source={{html: galleryPickerHtml}}
            style={styles.galleryWebView}
          />
        </View>
      </View>
    </Modal>
  );
};

const CalendarPickerModal: React.FC<CalendarPickerModalProps> = ({
  onClear,
  onClose,
  onConfirm,
  minimumValue,
  title,
  value,
  visible,
}) => {
  const initialCalendarState = getInitialCalendarState(value, minimumValue);
  const [displayYear, setDisplayYear] = useState(initialCalendarState.year);
  const [displayMonth, setDisplayMonth] = useState(
    initialCalendarState.monthIndex,
  );
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
                pressed ? styles.pressed : null,
              ]}>
              <Text style={styles.calendarYearButtonText}>-</Text>
            </Pressable>
            <Text style={styles.calendarYearText}>{String(displayYear)}</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => setDisplayYear(current => current + 1)}
              style={({pressed}) => [
                styles.calendarYearButton,
                pressed ? styles.pressed : null,
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
                  displayMonth === index
                    ? styles.calendarMonthChipActive
                    : null,
                  pressed ? styles.pressed : null,
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
                return (
                  <View key={`empty-${index}`} style={styles.calendarDayCell} />
                );
              }

              const dayValue = formatCalendarDate(
                displayYear,
                displayMonth,
                day,
              );
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
                  onPress={() => setSelectedValue(dayValue)}
                  style={({pressed}) => [
                    styles.calendarDayCell,
                    styles.calendarDayButton,
                    isSelected ? styles.calendarDayButtonActive : null,
                    isDisabled ? styles.calendarDayButtonDisabled : null,
                    pressed ? styles.pressed : null,
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

          <Text style={styles.calendarSelectedText}>
            {selectedValue || 'No date selected'}
          </Text>

          <View style={styles.calendarFooter}>
            <Pressable
              accessibilityRole="button"
              onPress={onClear}
              style={({pressed}) => [
                styles.calendarFooterButton,
                styles.calendarFooterButtonSecondary,
                pressed ? styles.pressed : null,
              ]}>
              <Text style={styles.calendarFooterButtonSecondaryText}>
                Clear
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={onClose}
              style={({pressed}) => [
                styles.calendarFooterButton,
                styles.calendarFooterButtonSecondary,
                pressed ? styles.pressed : null,
              ]}>
              <Text style={styles.calendarFooterButtonSecondaryText}>
                Cancel
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => onConfirm(selectedValue)}
              style={({pressed}) => [
                styles.calendarFooterButton,
                styles.calendarFooterButtonPrimary,
                pressed ? styles.pressed : null,
              ]}>
              <Text style={styles.calendarFooterButtonPrimaryText}>Apply</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const MapPickerField: React.FC<MapPickerFieldProps> = ({
  hasValue,
  label,
  onPress,
  value,
}) => {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={({pressed}) => [
          styles.mapPickerField,
          pressed ? styles.pressed : null,
        ]}>
        <View style={styles.mapPickerValueRow}>
          <MapMarkerIcon height={18} width={18} />
          <Text
            numberOfLines={1}
            style={[
              styles.mapPickerValue,
              !hasValue ? styles.mapPickerPlaceholder : null,
            ]}>
            {value}
          </Text>
        </View>
        <Text style={styles.mapPickerAction}>SELECT</Text>
      </Pressable>
    </View>
  );
};

const LargeField: React.FC<LargeFieldProps> = ({
  label,
  minHeight,
  onChangeText,
  placeholder,
  value,
}) => {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        multiline
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#B6B1AB"
        selectionColor={colors.primary}
        style={[styles.input, styles.largeInput, {minHeight}]}
        textAlignVertical="top"
        value={value}
      />
    </View>
  );
};

const PropertyStatusField: React.FC<PropertyStatusFieldProps> = ({
  isActive,
  onStatusChange,
}) => {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>Property Status</Text>
      <View style={styles.statusButtonRow}>
        <Pressable
          accessibilityRole="button"
          onPress={() => onStatusChange(true)}
          style={({pressed}) => [
            styles.statusButton,
            isActive ? styles.statusButtonActive : null,
            pressed ? styles.pressed : null,
          ]}>
          <Text
            style={[
              styles.statusButtonText,
              isActive ? styles.statusButtonTextActive : null,
            ]}>
            Activate
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={() => onStatusChange(false)}
          style={({pressed}) => [
            styles.statusButton,
            !isActive ? styles.statusButtonInactive : null,
            pressed ? styles.pressed : null,
          ]}>
          <Text
            style={[
              styles.statusButtonText,
              !isActive ? styles.statusButtonTextInactive : null,
            ]}>
            Deactivate
          </Text>
        </Pressable>
      </View>

      <Text style={styles.statusSummaryText}>
        {isActive
          ? 'This property will stay visible to tenants after you save.'
          : 'This property will be hidden from tenants after you save, but it will remain in your owner list.'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  flex: {
    flex: 1,
  },
  root: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: '#D7D7D7',
    backgroundColor: colors.white,
  },
  headerContent: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 28,
    height: 28,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 16,
  },
  headerSpacer: {
    width: 28,
    height: 28,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingBottom: 146,
  },
  contentWidth: {
    width: '100%',
    alignSelf: 'center',
  },
  fieldGroup: {
    marginBottom: spacing.sm + 2,
  },
  fieldLabel: {
    color: '#333333',
    fontFamily: fonts.medium,
    fontSize: 14,
    marginBottom: 6,
    marginLeft: spacing.xs,
  },
  input: {
    minHeight: 42,
    borderWidth: 1,
    borderColor: '#E1E1E1',
    borderRadius: 8,
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: colors.textPrimary,
    fontFamily: fonts.regular,
    fontSize: 14,
    shadowColor: '#000000',
    shadowOpacity: 0.06,
    shadowRadius: 5,
    shadowOffset: {width: 0, height: 2},
    elevation: 2,
  },
  largeInput: {
    paddingTop: 12,
  },
  stepperField: {
    minHeight: 42,
    borderWidth: 1,
    borderColor: '#E1E1E1',
    borderRadius: 8,
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'stretch',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOpacity: 0.06,
    shadowRadius: 5,
    shadowOffset: {width: 0, height: 2},
    elevation: 2,
  },
  stepperInput: {
    flex: 1,
    color: colors.textPrimary,
    fontFamily: fonts.regular,
    fontSize: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  stepperButtons: {
    width: 48,
    borderLeftWidth: 1,
    borderLeftColor: '#ECE7E1',
  },
  stepperButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FCFAF7',
  },
  stepperButtonTop: {
    borderBottomWidth: 1,
    borderBottomColor: '#ECE7E1',
  },
  selectField: {
    minHeight: 42,
    borderWidth: 1,
    borderColor: '#E1E1E1',
    borderRadius: 8,
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#000000',
    shadowOpacity: 0.06,
    shadowRadius: 5,
    shadowOffset: {width: 0, height: 2},
    elevation: 2,
  },
  selectValue: {
    flex: 1,
    color: colors.textPrimary,
    fontFamily: fonts.regular,
    fontSize: 14,
    marginRight: spacing.sm,
  },
  placeholderValue: {
    color: '#8D847A',
  },
  selectFieldOpen: {
    borderColor: colors.primary,
  },
  dateField: {
    minHeight: 42,
    borderWidth: 1,
    borderColor: '#E1E1E1',
    borderRadius: 8,
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#000000',
    shadowOpacity: 0.06,
    shadowRadius: 5,
    shadowOffset: {width: 0, height: 2},
    elevation: 2,
    gap: spacing.sm,
  },
  dateFieldValue: {
    flex: 1,
    color: colors.textPrimary,
    fontFamily: fonts.regular,
    fontSize: 14,
    marginRight: spacing.sm,
  },
  dropdownPanel: {
    marginTop: spacing.xs,
    borderWidth: 1,
    borderColor: '#E1E1E1',
    borderRadius: 10,
    backgroundColor: colors.white,
    paddingVertical: 4,
    shadowColor: '#000000',
    shadowOpacity: 0.06,
    shadowRadius: 5,
    shadowOffset: {width: 0, height: 2},
    elevation: 2,
  },
  dropdownOption: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: spacing.sm,
  },
  dropdownOptionText: {
    color: colors.textPrimary,
    fontFamily: fonts.regular,
    fontSize: 14,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1,
    borderColor: '#C9C3BC',
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  checkboxSelected: {
    borderColor: colors.primary,
    backgroundColor: '#FFF4E0',
  },
  checkboxInner: {
    width: 8,
    height: 8,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
  galleryPickerButton: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: '#E1E1E1',
    borderRadius: 10,
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    shadowColor: '#000000',
    shadowOpacity: 0.06,
    shadowRadius: 5,
    shadowOffset: {width: 0, height: 2},
    elevation: 2,
    gap: spacing.sm,
  },
  galleryPickerText: {
    flex: 1,
    color: colors.textPrimary,
    fontFamily: fonts.regular,
    fontSize: 14,
  },
  galleryPickerAction: {
    color: colors.primary,
    fontFamily: fonts.semibold,
    fontSize: 12,
    letterSpacing: 0.4,
  },
  galleryPreviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  galleryPreviewCard: {
    width: 96,
  },
  galleryPreviewImage: {
    width: '100%',
    height: 84,
    borderRadius: 10,
    backgroundColor: '#EAE4DD',
  },
  galleryRemoveButton: {
    marginTop: spacing.xs,
    minHeight: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5EFE7',
  },
  galleryRemoveButtonText: {
    color: colors.textPrimary,
    fontFamily: fonts.medium,
    fontSize: 12,
  },
  galleryModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(25, 21, 19, 0.34)',
    justifyContent: 'flex-end',
  },
  galleryModalCard: {
    minHeight: '72%',
    maxHeight: '88%',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    backgroundColor: colors.white,
    overflow: 'hidden',
  },
  galleryModalHeader: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#ECE7E1',
  },
  galleryModalTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 18,
  },
  galleryModalCloseButton: {
    minHeight: 34,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: '#F5EFE7',
  },
  galleryModalCloseText: {
    color: colors.textPrimary,
    fontFamily: fonts.medium,
    fontSize: 13,
  },
  galleryWebView: {
    flex: 1,
    backgroundColor: colors.white,
  },
  mapPickerField: {
    minHeight: 42,
    borderWidth: 1,
    borderColor: '#E1E1E1',
    borderRadius: 8,
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#000000',
    shadowOpacity: 0.06,
    shadowRadius: 5,
    shadowOffset: {width: 0, height: 2},
    elevation: 2,
    gap: spacing.sm,
  },
  mapPickerValueRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  mapPickerValue: {
    flex: 1,
    color: colors.textPrimary,
    fontFamily: fonts.regular,
    fontSize: 14,
  },
  mapPickerPlaceholder: {
    color: '#8D847A',
  },
  mapPickerAction: {
    color: colors.primary,
    fontFamily: fonts.semibold,
    fontSize: 12,
    letterSpacing: 0.4,
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
    marginBottom: spacing.md,
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
  inlineMessage: {
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 18,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  statusButtonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statusButton: {
    flex: 1,
    minHeight: 46,
    borderWidth: 1,
    borderColor: '#DDD6CF',
    borderRadius: 10,
    backgroundColor: '#FAF7F3',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  statusButtonActive: {
    borderColor: colors.primary,
    backgroundColor: '#EEF6F2',
  },
  statusButtonInactive: {
    borderColor: colors.error,
    backgroundColor: colors.error,
  },
  statusButtonText: {
    color: colors.textPrimary,
    fontFamily: fonts.semibold,
    fontSize: 14,
  },
  statusButtonTextActive: {
    color: colors.primary,
  },
  statusButtonTextInactive: {
    color: colors.white,
  },
  statusSummaryText: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 18,
    marginTop: spacing.xs + 2,
    marginLeft: spacing.xs,
  },
  helperText: {
    color: '#7B756E',
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 18,
    marginTop: -2,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  inlineMessageError: {
    color: colors.error,
  },
  inlineMessageSuccess: {
    color: colors.success,
  },
  submitButton: {
    minHeight: 58,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm + 2,
  },
  submitButtonLoading: {
    opacity: 0.8,
  },
  submitButtonText: {
    color: colors.white,
    fontFamily: fonts.semibold,
    fontSize: 14,
    letterSpacing: 0.4,
  },
  pressed: {
    opacity: 0.88,
  },
});
