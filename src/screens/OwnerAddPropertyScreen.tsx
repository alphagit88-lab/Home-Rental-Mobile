import React, {useState} from 'react';
import {
  KeyboardAvoidingView,
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
import BackIcon from '../assets/images/left-arrow 2.svg';
import DropdownIcon from '../assets/images/Vector 13.svg';
import {AppBottomNav, AppTab} from '../components/AppBottomNav';
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
  label: string;
  onPress?: () => void;
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

const propertyTypeOptions = ['Apartment', 'House', 'Room / Boarding'];
const listingTypeOptions = ['For Rent', 'Short-term'];

const parseCommaSeparatedValues = (value: string) =>
  value
    .split(/,|\n/)
    .map(item => item.trim())
    .filter(item => item.length > 0);

const formatCoordinateValue = (value?: number) =>
  typeof value === 'number' && Number.isFinite(value) ? value.toFixed(6) : '';

const formatMoneyValue = (value?: number | null) =>
  typeof value === 'number' && Number.isFinite(value) ? String(value) : '';

const formatDateValue = (value?: string | null) => formatIsoDateInput(value);

const parseCoordinateValue = (value: string) => {
  const normalizedValue = value.trim();

  if (normalizedValue.length === 0) {
    return null;
  }

  const parsed = Number(normalizedValue);
  return Number.isFinite(parsed) ? parsed : NaN;
};

const parseMoneyValue = (value: string) => {
  const normalizedValue = value.trim();

  if (normalizedValue.length === 0) {
    return null;
  }

  const parsed = Number(normalizedValue);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : NaN;
};

const isValidDateValue = (value: string) => {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && normalizeDateString(value) === value;
};

const normalizeDateValue = (value: string) => {
  const normalizedValue = value.trim();

  if (normalizedValue.length === 0) {
    return null;
  }

  return isValidDateValue(normalizedValue) ? normalizedValue : 'INVALID_DATE';
};

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
    const index = propertyTypeOptions.indexOf(property?.propertyType ?? 'Apartment');
    return index >= 0 ? index : 0;
  });
  const [listingTypeIndex, setListingTypeIndex] = useState(() => {
    const index = listingTypeOptions.indexOf(property?.listingType ?? 'For Rent');
    return index >= 0 ? index : 0;
  });
  const [bedrooms, setBedrooms] = useState(
    property ? String(property.bedrooms) : '01',
  );
  const [bathrooms, setBathrooms] = useState(
    property ? String(property.bathrooms) : '01',
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
  const [amenities, setAmenities] = useState(property?.amenities.join(', ') ?? '');
  const [location, setLocation] = useState(property?.locationText ?? '');
  const [latitude, setLatitude] = useState(formatCoordinateValue(property?.latitude));
  const [longitude, setLongitude] = useState(
    formatCoordinateValue(property?.longitude),
  );
  const [gallery, setGallery] = useState(property?.galleryUrls.join(', ') ?? '');
  const [description, setDescription] = useState(property?.description ?? '');
  const [submitState, setSubmitState] = useState<'idle' | 'loading' | 'error'>(
    'idle',
  );
  const [inlineMessage, setInlineMessage] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!propertyName.trim() || !location.trim()) {
      setSubmitState('error');
      setInlineMessage('Please complete at least the property name and location.');
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
      setInlineMessage('Monthly rent must be a valid number greater than or equal to 0.');
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

    const parsedLatitude = parseCoordinateValue(latitude);
    const parsedLongitude = parseCoordinateValue(longitude);
    const hasLatitude = latitude.trim().length > 0;
    const hasLongitude = longitude.trim().length > 0;

    if (hasLatitude !== hasLongitude) {
      setSubmitState('error');
      setInlineMessage('Add both latitude and longitude, or leave both empty.');
      return;
    }

    if (
      hasLatitude &&
      (parsedLatitude === null ||
        !Number.isFinite(parsedLatitude) ||
        parsedLatitude < -90 ||
        parsedLatitude > 90)
    ) {
      setSubmitState('error');
      setInlineMessage('Latitude must be a valid number between -90 and 90.');
      return;
    }

    if (
      hasLongitude &&
      (parsedLongitude === null ||
        !Number.isFinite(parsedLongitude) ||
        parsedLongitude < -180 ||
        parsedLongitude > 180)
    ) {
      setSubmitState('error');
      setInlineMessage('Longitude must be a valid number between -180 and 180.');
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
      amenities: parseCommaSeparatedValues(amenities),
      locationText: location.trim(),
      latitude: hasLatitude ? parsedLatitude ?? undefined : undefined,
      longitude: hasLongitude ? parsedLongitude ?? undefined : undefined,
      galleryUrls: parseCommaSeparatedValues(gallery),
      description: description.trim(),
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
                label="Property Type"
                onPress={() =>
                  setPropertyTypeIndex(current => (current + 1) % propertyTypeOptions.length)
                }
                value={propertyTypeOptions[propertyTypeIndex]}
              />

              <SelectField
                label="Listing Type"
                onPress={() =>
                  setListingTypeIndex(current => (current + 1) % listingTypeOptions.length)
                }
                value={listingTypeOptions[listingTypeIndex]}
              />

              <TextField
                keyboardType="number-pad"
                label="Number of Bedrooms"
                onChangeText={setBedrooms}
                placeholder="01"
                value={bedrooms}
              />

              <TextField
                keyboardType="number-pad"
                label="Number of Bathrooms"
                onChangeText={setBathrooms}
                placeholder="01"
                value={bathrooms}
              />

              <TextField
                keyboardType="decimal-pad"
                label="Monthly Rent (LKR)"
                onChangeText={setMonthlyRent}
                placeholder="45000"
                value={monthlyRent}
              />

              <TextField
                keyboardType="number-pad"
                label="Available From"
                maxLength={10}
                onChangeText={value => setAvailableFrom(formatIsoDateInput(value))}
                placeholder="YYYY-MM-DD"
                value={availableFrom}
              />

              <TextField
                keyboardType="number-pad"
                label="Available To"
                maxLength={10}
                onChangeText={value => setAvailableTo(formatIsoDateInput(value))}
                placeholder="YYYY-MM-DD"
                value={availableTo}
              />

              <Text style={styles.helperText}>
                Use YYYY-MM-DD for the available time period. Leave the dates empty
                if the property is available anytime.
              </Text>

              <TextField
                label="Amenities & Facilities"
                onChangeText={setAmenities}
                placeholder="Parking, WiFi, Pool"
                value={amenities}
              />

              <TextField
                label="Location"
                onChangeText={setLocation}
                placeholder="Add Location"
                value={location}
              />

              <TextField
                keyboardType="decimal-pad"
                label="Latitude"
                onChangeText={setLatitude}
                placeholder="6.927100"
                value={latitude}
              />

              <TextField
                keyboardType="decimal-pad"
                label="Longitude"
                onChangeText={setLongitude}
                placeholder="79.861200"
                value={longitude}
              />

              <Text style={styles.helperText}>
                Add exact latitude and longitude to place the property at its real
                map position.
              </Text>

              <LargeField
                label="Gallery URLs"
                minHeight={96}
                onChangeText={setGallery}
                placeholder="Paste image URLs separated by commas or new lines"
                value={gallery}
              />

              <LargeField
                label="Description"
                minHeight={88}
                onChangeText={setDescription}
                placeholder="Property Description"
                value={description}
              />

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

const SelectField: React.FC<SelectFieldProps> = ({label, onPress, value}) => {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Pressable accessibilityRole="button" onPress={onPress} style={styles.selectField}>
        <Text numberOfLines={1} style={styles.selectValue}>
          {value}
        </Text>
        <DropdownIcon height={6} width={10} />
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
  inlineMessage: {
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 18,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
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
