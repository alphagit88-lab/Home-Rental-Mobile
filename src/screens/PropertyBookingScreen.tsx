import React, {useEffect, useMemo, useState} from 'react';
import {
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import DateIcon from '../assets/images/clarity_date-line.svg';
import DecreaseGuestIcon from '../assets/images/Frame 262.svg';
import IncreaseGuestIcon from '../assets/images/Frame 263.svg';
import LeftArrowIcon from '../assets/images/left-arrow 2.svg';
import CardImage from '../assets/images/image.svg';
import {AppBottomNav, AppTab} from '../components/AppBottomNav';
import {InlineStateMessage} from '../components/InlineStateMessage';
import {InlineMessage} from '../hooks/useLoginScreen';
import {usePropertyBookingAvailability} from '../hooks/usePropertyBookingAvailability';
import {useResponsive} from '../hooks/useResponsive';
import {useServiceCategories} from '../hooks/useServiceCategories';
import {PropertyRecord} from '../services/properties';
import {PropertyBookingDraft} from '../types/propertyBooking';
import {colors, fonts, spacing} from '../theme';
import {normalizeDateString, formatShortDateInput} from '../utils/dateInput';
import {
  addDaysToIsoDate,
  buildCalendarGrid,
  doesDateRangeIntersectBlockedDates,
  formatCalendarDate,
  getLaterIsoDate,
  getTodayIsoDate,
  monthLabels,
  parseCalendarDate,
  weekdayLabels,
} from '../utils/bookingCalendar';
import {
  formatPropertyAvailability,
  getLatestPropertyCheckInDate,
  hasPropertyBookableStayDates,
  formatPropertyRent,
} from '../utils/propertyPresentation';

type PropertyBookingScreenProps = {
  activeTab: AppTab;
  bookingDraft: PropertyBookingDraft;
  onBack: () => void;
  onNext: () => void;
  onTabPress: (tab: AppTab) => void;
  onUpdateBookingDraft: (
    updates: Partial<PropertyBookingDraft>,
  ) => void;
  property: PropertyRecord;
};

type DateInputProps = {
  label: string;
  onPress: () => void;
  value: string;
};

type SummaryRowProps = {
  label: string;
  value: string;
};

type BookingDateField = 'checkIn' | 'checkOut';

type CalendarPickerModalProps = {
  blockedDates: Set<string>;
  maximumValue?: string | null;
  minimumValue?: string | null;
  onClear: () => void;
  onClose: () => void;
  onConfirm: (value: string) => void;
  title: string;
  value: string;
  visible: boolean;
};

const getInitialCalendarState = (
  value: string,
  minimumValue?: string | null,
  maximumValue?: string | null,
) => {
  const normalizedMinimumValue =
    minimumValue && normalizeDateString(minimumValue)
      ? normalizeDateString(minimumValue)
      : null;
  const normalizedMaximumValue =
    maximumValue && normalizeDateString(maximumValue)
      ? normalizeDateString(maximumValue)
      : null;
  const normalizedValue = normalizeDateString(value);
  const isValueInRange =
    normalizedValue &&
    (!normalizedMinimumValue || normalizedValue >= normalizedMinimumValue) &&
    (!normalizedMaximumValue || normalizedValue <= normalizedMaximumValue);
  const parsedDate = isValueInRange ? parseCalendarDate(normalizedValue) : null;
  const fallbackDate = normalizedMinimumValue
    ? parseCalendarDate(normalizedMinimumValue)
    : normalizedMaximumValue
      ? parseCalendarDate(normalizedMaximumValue)
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

export const PropertyBookingScreen: React.FC<PropertyBookingScreenProps> = ({
  activeTab,
  bookingDraft,
  onBack,
  onNext,
  onTabPress,
  onUpdateBookingDraft,
  property,
}) => {
  const responsive = useResponsive();
  const [inlineMessage, setInlineMessage] = useState<InlineMessage | null>(null);
  const [activeBookingDateField, setActiveBookingDateField] =
    useState<BookingDateField | null>(null);
  const todayIsoDate = getTodayIsoDate();
  const normalizedPropertyAvailableFrom =
    normalizeDateString(property.availableFrom) ?? null;
  const normalizedPropertyAvailableTo =
    normalizeDateString(property.availableTo) ?? null;
  const minimumCheckInDate = normalizedPropertyAvailableFrom
    ? getLaterIsoDate(todayIsoDate, normalizedPropertyAvailableFrom)
    : todayIsoDate;
  const maximumCheckInDate =
    getLatestPropertyCheckInDate(normalizedPropertyAvailableTo);
  const hasBookableStayDates = hasPropertyBookableStayDates(
    property.availableFrom,
    property.availableTo,
    todayIsoDate,
  );
  const hasRentConfigured = property.monthlyRent !== null;
  const availabilityTo =
    normalizedPropertyAvailableTo ??
    addDaysToIsoDate(todayIsoDate, 365) ??
    todayIsoDate;
  const {
    availability,
    errorMessage: availabilityErrorMessage,
    loading: availabilityLoading,
  } = usePropertyBookingAvailability(property.id, {
    from: minimumCheckInDate,
    to: availabilityTo,
  });
  const {
    categories: serviceCategories,
    errorMessage: serviceCategoryErrorMessage,
    loading: serviceCategoriesLoading,
  } = useServiceCategories();
  const blockedDates = useMemo(
    () => new Set(availability?.bookedDates ?? []),
    [availability?.bookedDates],
  );
  const normalizedCheckInDate = normalizeDateString(bookingDraft.checkIn) ?? '';
  const normalizedCheckOutDate = normalizeDateString(bookingDraft.checkOut) ?? '';
  const minimumCheckOutDate = normalizedCheckInDate
    ? addDaysToIsoDate(normalizedCheckInDate, 1) ?? minimumCheckInDate
    : addDaysToIsoDate(minimumCheckInDate, 1) ?? minimumCheckInDate;

  const toggleServiceCategory = (categoryId: number) => {
    const nextCategoryIds = bookingDraft.serviceCategoryIds.includes(categoryId)
      ? bookingDraft.serviceCategoryIds.filter(id => id !== categoryId)
      : [...bookingDraft.serviceCategoryIds, categoryId];
    const nextCategoryNames = serviceCategories
      .filter(category => nextCategoryIds.includes(category.id))
      .map(category => category.name);

    onUpdateBookingDraft({
      serviceCategoryIds: nextCategoryIds,
      serviceCategoryNames: nextCategoryNames,
    });
  };

  const openBookingDatePicker = (field: BookingDateField) => {
    if (!hasBookableStayDates) {
      setInlineMessage({
        text: 'This property no longer has selectable stay dates.',
        tone: 'error',
      });
      return;
    }

    if (field === 'checkOut' && !normalizedCheckInDate) {
      setInlineMessage({
        text: 'Please select the check-in date first.',
        tone: 'error',
      });
      return;
    }

    if (
      field === 'checkOut' &&
      normalizedPropertyAvailableTo &&
      minimumCheckOutDate > normalizedPropertyAvailableTo
    ) {
      setInlineMessage({
        text: 'Please choose an earlier check-in date before selecting check-out.',
        tone: 'error',
      });
      return;
    }

    setInlineMessage(null);
    setActiveBookingDateField(field);
  };

  const closeBookingDatePicker = () => {
    setActiveBookingDateField(null);
  };

  const handleBookingDateConfirm = (value: string) => {
    if (!value) {
      setInlineMessage({
        text: 'Please select a date from the calendar.',
        tone: 'error',
      });
      return;
    }

    const formattedValue = formatShortDateInput(value);

    if (activeBookingDateField === 'checkIn') {
      onUpdateBookingDraft({
        checkIn: formattedValue,
        checkOut:
          normalizedCheckOutDate &&
          (normalizedCheckOutDate <= value ||
            doesDateRangeIntersectBlockedDates(
              value,
              normalizedCheckOutDate,
              blockedDates,
            ))
            ? ''
            : bookingDraft.checkOut,
      });
      setInlineMessage(null);
      closeBookingDatePicker();
      return;
    }

    if (activeBookingDateField === 'checkOut') {
      if (
        !normalizedCheckInDate ||
        value <= normalizedCheckInDate ||
        doesDateRangeIntersectBlockedDates(
          normalizedCheckInDate,
          value,
          blockedDates,
        )
      ) {
        setInlineMessage({
          text: 'Please choose a valid check-out date after check-in.',
          tone: 'error',
        });
        return;
      }

      onUpdateBookingDraft({checkOut: formattedValue});
      setInlineMessage(null);
      closeBookingDatePicker();
    }
  };

  const handleBookingDateClear = () => {
    if (activeBookingDateField === 'checkIn') {
      onUpdateBookingDraft({checkIn: '', checkOut: ''});
    }

    if (activeBookingDateField === 'checkOut') {
      onUpdateBookingDraft({checkOut: ''});
    }

    setInlineMessage(null);
    closeBookingDatePicker();
  };

  const handleNextPress = () => {
    if (!hasRentConfigured) {
      setInlineMessage({
        text: 'This property cannot be booked until the owner adds the monthly rent.',
        tone: 'error',
      });
      return;
    }

    if (!normalizedCheckInDate || !normalizedCheckOutDate) {
      setInlineMessage({
        text: 'Please choose both the check-in and check-out dates.',
        tone: 'error',
      });
      return;
    }

    const minimumCheckOutDate = addDaysToIsoDate(normalizedCheckInDate, 1);

    if (!minimumCheckOutDate || normalizedCheckOutDate < minimumCheckOutDate) {
      setInlineMessage({
        text: 'Check-out must be at least one day after check-in.',
        tone: 'error',
      });
      return;
    }

    if (
      normalizedCheckInDate < minimumCheckInDate ||
      (normalizedPropertyAvailableTo &&
        normalizedCheckOutDate > normalizedPropertyAvailableTo)
    ) {
      setInlineMessage({
        text: 'The selected dates are outside the property availability range.',
        tone: 'error',
      });
      return;
    }

    if (
      blockedDates.has(normalizedCheckInDate) ||
      doesDateRangeIntersectBlockedDates(
        normalizedCheckInDate,
        normalizedCheckOutDate,
        blockedDates,
      )
    ) {
      setInlineMessage({
        text: 'Some of the selected dates are already booked.',
        tone: 'error',
      });
      return;
    }

    setInlineMessage(null);
    onNext();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <View style={styles.root}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <View
            style={[
              styles.contentWidth,
              {maxWidth: responsive.maxContentWidth},
            ]}>
            <View style={styles.headerRow}>
              <Pressable
                accessibilityRole="button"
                onPress={onBack}
                style={styles.backButton}>
                <LeftArrowIcon height={18} width={18} />
              </Pressable>
              <Text style={styles.headerTitle}>Booking</Text>
              <View style={styles.headerSpacer} />
            </View>

            <View style={styles.summaryCard}>
              <View style={styles.summaryImageWrap}>
                <CardImage
                  height="100%"
                  preserveAspectRatio="xMidYMid slice"
                  style={styles.summaryImage}
                  width="100%"
                />
              </View>

              <View style={styles.summaryBody}>
                <Text style={styles.summaryTitle}>{property.title}</Text>
                <Text style={styles.summaryAddress}>
                  {property.locationText || 'Location unavailable'}
                </Text>
                <Text style={styles.summaryAddress}>{property.propertyCode}</Text>
              </View>
            </View>

            <View style={styles.noticeCard}>
              <Text style={styles.noticeTitle}>Booking request</Text>
              <Text style={styles.noticeText}>
                Add your preferred stay dates and guest count before you continue.
              </Text>
              <Text style={styles.noticeSubtext}>
                {!hasRentConfigured
                  ? 'This property cannot be booked yet because the monthly rent has not been added.'
                  : !hasBookableStayDates
                  ? 'This listing is no longer available for a new stay.'
                  : availabilityLoading
                  ? 'Loading booked dates for this property...'
                  : availabilityErrorMessage
                    ? availabilityErrorMessage
                    : blockedDates.size > 0
                      ? 'Booked dates are disabled in the calendar.'
                      : 'No blocked dates were returned for the current availability window.'}
              </Text>
            </View>

            {inlineMessage ? (
              <View style={styles.inlineMessageWrap}>
                <InlineStateMessage message={inlineMessage} />
              </View>
            ) : null}

            <View style={styles.dateRow}>
              <DateInput
                label="Check-in"
                onPress={() => openBookingDatePicker('checkIn')}
                value={bookingDraft.checkIn}
              />
              <DateInput
                label="Check-out"
                onPress={() => openBookingDatePicker('checkOut')}
                value={bookingDraft.checkOut}
              />
            </View>

            <View style={styles.guestsRow}>
              <Text style={styles.guestsLabel}>Total Guest</Text>

              <View style={styles.stepperRow}>
                <Pressable
                  accessibilityRole="button"
                  onPress={() =>
                    onUpdateBookingDraft({
                      guestCount: Math.max(1, bookingDraft.guestCount - 1),
                    })
                  }
                  style={styles.stepperButton}>
                  <DecreaseGuestIcon height={24} width={24} />
                </Pressable>

                <Text style={styles.guestCountText}>
                  {bookingDraft.guestCount}
                </Text>

                <Pressable
                  accessibilityRole="button"
                  onPress={() =>
                    onUpdateBookingDraft({
                      guestCount: bookingDraft.guestCount + 1,
                    })
                  }
                  style={styles.stepperButton}>
                  <IncreaseGuestIcon height={24} width={24} />
                </Pressable>
              </View>
            </View>

            <View style={styles.servicesCard}>
              <Text style={styles.servicesTitle}>Extra services</Text>
              <Text style={styles.servicesText}>
                Choose optional services for this booking. Matching nearby
                service providers can accept or reject the request.
              </Text>

              {serviceCategoriesLoading ? (
                <Text style={styles.servicesStateText}>
                  Loading service options...
                </Text>
              ) : serviceCategoryErrorMessage ? (
                <Text style={styles.servicesStateText}>
                  {serviceCategoryErrorMessage}
                </Text>
              ) : serviceCategories.length === 0 ? (
                <Text style={styles.servicesStateText}>
                  No service categories are available right now.
                </Text>
              ) : (
                <View style={styles.servicesChipWrap}>
                  {serviceCategories.map(category => {
                    const selected = bookingDraft.serviceCategoryIds.includes(
                      category.id,
                    );

                    return (
                      <Pressable
                        accessibilityRole="button"
                        key={category.id}
                        onPress={() => toggleServiceCategory(category.id)}
                        style={({pressed}) => [
                          styles.serviceChip,
                          selected ? styles.serviceChipSelected : null,
                          pressed ? styles.dateInputPressed : null,
                        ]}>
                        <Text
                          style={[
                            styles.serviceChipText,
                            selected ? styles.serviceChipTextSelected : null,
                          ]}>
                          {category.name}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              )}

              <Text style={styles.serviceNoteLabel}>Service note</Text>
              <TextInput
                multiline
                onChangeText={value =>
                  onUpdateBookingDraft({serviceNotes: value})
                }
                placeholder="Add details for the provider, for example food, timing, or special instructions."
                placeholderTextColor="#A29A91"
                style={styles.serviceNotesInput}
                textAlignVertical="top"
                value={bookingDraft.serviceNotes}
              />
            </View>

            <View style={styles.summaryPanel}>
              <Text style={styles.summaryPanelTitle}>Property Summary</Text>
              <SummaryRow label="Listing Type" value={property.listingType} />
              <SummaryRow
                label="Bedrooms"
                value={String(property.bedrooms)}
              />
              <SummaryRow
                label="Bathrooms"
                value={String(property.bathrooms)}
              />
              <SummaryRow
                label="Amenities"
                value={
                  property.amenities.length > 0
                    ? property.amenities.slice(0, 3).join(', ')
                    : 'None listed'
                }
              />
              <SummaryRow
                label="Monthly Rent"
                value={formatPropertyRent(property.monthlyRent)}
              />
              <SummaryRow
                label="Available"
                value={formatPropertyAvailability(
                  property.availableFrom,
                  property.availableTo,
                )}
              />
              <SummaryRow
                label="Services"
                value={
                  bookingDraft.serviceCategoryNames.length > 0
                    ? bookingDraft.serviceCategoryNames.join(', ')
                    : 'No extra services'
                }
              />
            </View>

            <Pressable
              accessibilityRole="button"
              disabled={!hasRentConfigured}
              onPress={handleNextPress}
              style={[
                styles.nextButton,
                !hasRentConfigured ? styles.nextButtonDisabled : null,
              ]}>
              <Text style={styles.nextButtonText}>Next</Text>
            </Pressable>
          </View>
        </ScrollView>

        <CalendarPickerModal
          blockedDates={blockedDates}
          maximumValue={
            activeBookingDateField === 'checkOut'
              ? normalizedPropertyAvailableTo
              : maximumCheckInDate
          }
          minimumValue={
            activeBookingDateField === 'checkOut'
              ? minimumCheckOutDate
              : minimumCheckInDate
          }
          onClear={handleBookingDateClear}
          onClose={closeBookingDatePicker}
          onConfirm={handleBookingDateConfirm}
          title={
            activeBookingDateField === 'checkOut'
              ? 'Select check-out'
              : 'Select check-in'
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

const DateInput: React.FC<DateInputProps> = ({label, onPress, value}) => {
  return (
    <View style={styles.dateInputWrap}>
      <Text style={styles.dateInputLabel}>{label}</Text>
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={({pressed}) => [
          styles.dateInput,
          pressed ? styles.dateInputPressed : null,
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
  blockedDates,
  maximumValue,
  minimumValue,
  onClear,
  onClose,
  onConfirm,
  title,
  value,
  visible,
}) => {
  const initialCalendarState = getInitialCalendarState(
    value,
    minimumValue,
    maximumValue,
  );
  const [displayYear, setDisplayYear] = useState(initialCalendarState.year);
  const [displayMonth, setDisplayMonth] = useState(initialCalendarState.monthIndex);
  const [selectedValue, setSelectedValue] = useState(
    initialCalendarState.selectedValue,
  );

  useEffect(() => {
    if (!visible) {
      return;
    }

    const nextCalendarState = getInitialCalendarState(
      value,
      minimumValue,
      maximumValue,
    );
    setDisplayYear(nextCalendarState.year);
    setDisplayMonth(nextCalendarState.monthIndex);
    setSelectedValue(nextCalendarState.selectedValue);
  }, [maximumValue, minimumValue, value, visible]);

  const selectedParts = parseCalendarDate(selectedValue);
  const calendarDays = buildCalendarGrid(displayYear, displayMonth);
  const normalizedMinimumValue = normalizeDateString(minimumValue) ?? null;
  const normalizedMaximumValue = normalizeDateString(maximumValue) ?? null;

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
                pressed ? styles.dateInputPressed : null,
              ]}>
              <Text style={styles.calendarYearButtonText}>-</Text>
            </Pressable>
            <Text style={styles.calendarYearText}>{String(displayYear)}</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => setDisplayYear(current => current + 1)}
              style={({pressed}) => [
                styles.calendarYearButton,
                pressed ? styles.dateInputPressed : null,
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
                  pressed ? styles.dateInputPressed : null,
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
                (normalizedMinimumValue && dayValue < normalizedMinimumValue) ||
                  (normalizedMaximumValue && dayValue > normalizedMaximumValue) ||
                  blockedDates.has(dayValue),
              );
              const isSelected =
                selectedParts?.year === displayYear &&
                selectedParts?.monthIndex === displayMonth &&
                selectedParts?.day === day;

              return (
                <Pressable
                  accessibilityRole="button"
                  disabled={isDisabled}
                  key={dayValue}
                  onPress={() => setSelectedValue(dayValue)}
                  style={({pressed}) => [
                    styles.calendarDayCell,
                    styles.calendarDayButton,
                    isSelected ? styles.calendarDayButtonActive : null,
                    isDisabled ? styles.calendarDayButtonDisabled : null,
                    pressed ? styles.dateInputPressed : null,
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
            {selectedValue ? formatShortDateInput(selectedValue) : 'No date selected'}
          </Text>

          <View style={styles.calendarFooter}>
            <Pressable
              accessibilityRole="button"
              onPress={onClear}
              style={({pressed}) => [
                styles.calendarFooterButton,
                styles.calendarFooterButtonSecondary,
                pressed ? styles.dateInputPressed : null,
              ]}>
              <Text style={styles.calendarFooterButtonSecondaryText}>Clear</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={onClose}
              style={({pressed}) => [
                styles.calendarFooterButton,
                styles.calendarFooterButtonSecondary,
                pressed ? styles.dateInputPressed : null,
              ]}>
              <Text style={styles.calendarFooterButtonSecondaryText}>Cancel</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => onConfirm(selectedValue)}
              style={({pressed}) => [
                styles.calendarFooterButton,
                styles.calendarFooterButtonPrimary,
                pressed ? styles.dateInputPressed : null,
              ]}>
              <Text style={styles.calendarFooterButtonPrimaryText}>Apply</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const SummaryRow: React.FC<SummaryRowProps> = ({label, value}) => {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryRowLabel}>{label}</Text>
      <Text style={styles.summaryRowValue}>{value}</Text>
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
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: 138,
  },
  contentWidth: {
    width: '100%',
    alignSelf: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#EAE4DD',
    marginBottom: spacing.md + 6,
  },
  backButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 18,
  },
  headerSpacer: {
    width: 36,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 18,
    shadowOffset: {width: 0, height: 8},
    elevation: 6,
  },
  summaryImageWrap: {
    width: 102,
    height: 102,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#E5DDD6',
    marginRight: spacing.md,
  },
  summaryImage: {
    ...StyleSheet.absoluteFillObject,
  },
  summaryBody: {
    flex: 1,
  },
  summaryTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 18,
    marginBottom: 8,
  },
  summaryAddress: {
    color: colors.textPrimary,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 20,
  },
  noticeCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#BEBEBE',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    marginBottom: spacing.lg,
  },
  noticeTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 15,
    marginBottom: 6,
  },
  noticeText: {
    color: '#494949',
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 18,
  },
  noticeSubtext: {
    color: colors.textSecondary,
    fontFamily: fonts.medium,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 6,
  },
  inlineMessageWrap: {
    marginBottom: spacing.md,
  },
  dateRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  dateInputWrap: {
    flex: 1,
  },
  dateInputLabel: {
    color: colors.textPrimary,
    fontFamily: fonts.medium,
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 6,
  },
  dateInput: {
    minHeight: 42,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#9F9F9F',
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm + 4,
    gap: spacing.xs,
  },
  dateInputPressed: {
    opacity: 0.82,
  },
  dateInputText: {
    flex: 1,
    color: colors.textPrimary,
    fontFamily: fonts.regular,
    fontSize: 16,
    paddingVertical: 0,
  },
  dateInputPlaceholderText: {
    color: '#B2B2B2',
  },
  guestsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  guestsLabel: {
    color: colors.textPrimary,
    fontFamily: fonts.medium,
    fontSize: 12,
  },
  servicesCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E3DDD7',
    backgroundColor: '#FBF8F4',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.lg,
  },
  servicesTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 16,
    marginBottom: 6,
  },
  servicesText: {
    color: '#5B544D',
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: spacing.sm,
  },
  servicesStateText: {
    color: colors.textSecondary,
    fontFamily: fonts.medium,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: spacing.sm,
  },
  servicesChipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  serviceChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#D8CFC5',
    backgroundColor: colors.white,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 8,
  },
  serviceChipSelected: {
    borderColor: colors.primary,
    backgroundColor: '#EEF6F2',
  },
  serviceChipText: {
    color: colors.textPrimary,
    fontFamily: fonts.regular,
    fontSize: 12,
  },
  serviceChipTextSelected: {
    color: colors.primary,
    fontFamily: fonts.medium,
  },
  serviceNoteLabel: {
    color: colors.textPrimary,
    fontFamily: fonts.medium,
    fontSize: 13,
    marginBottom: 6,
  },
  serviceNotesInput: {
    minHeight: 96,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D8CFC5',
    backgroundColor: colors.white,
    color: colors.textPrimary,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: spacing.sm + 2,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  stepperButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestCountText: {
    color: colors.textPrimary,
    fontFamily: fonts.medium,
    fontSize: 18,
    minWidth: 16,
    textAlign: 'center',
  },
  summaryPanel: {
    backgroundColor: colors.white,
    borderRadius: 18,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    shadowColor: colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 18,
    shadowOffset: {width: 0, height: 8},
    elevation: 6,
    marginBottom: spacing.xl,
  },
  summaryPanelTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 18,
    marginBottom: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  summaryRowLabel: {
    color: colors.textPrimary,
    fontFamily: fonts.regular,
    fontSize: 15,
  },
  summaryRowValue: {
    color: '#969696',
    fontFamily: fonts.regular,
    fontSize: 15,
    flexShrink: 1,
    textAlign: 'right',
  },
  nextButton: {
    minHeight: 54,
    borderRadius: 14,
    backgroundColor: '#F4AF2E',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  nextButtonDisabled: {
    opacity: 0.56,
  },
  nextButtonText: {
    color: colors.white,
    fontFamily: fonts.bold,
    fontSize: 18,
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
});
