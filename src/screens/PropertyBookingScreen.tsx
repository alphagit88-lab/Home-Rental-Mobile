import React from 'react';
import {
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
import {useResponsive} from '../hooks/useResponsive';
import {PropertyRecord} from '../services/properties';
import {PropertyBookingDraft} from '../types/propertyBooking';
import {colors, fonts, spacing} from '../theme';
import {formatShortDateInput} from '../utils/dateInput';
import {
  formatPropertyAvailability,
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
  onChangeText: (value: string) => void;
  placeholder: string;
  value: string;
};

type SummaryRowProps = {
  label: string;
  value: string;
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
            </View>

            <View style={styles.dateRow}>
              <DateInput
                label="Check-in"
                onChangeText={value =>
                  onUpdateBookingDraft({checkIn: formatShortDateInput(value)})
                }
                placeholder="DD/MM/YY"
                value={bookingDraft.checkIn}
              />
              <DateInput
                label="Check-out"
                onChangeText={value =>
                  onUpdateBookingDraft({checkOut: formatShortDateInput(value)})
                }
                placeholder="DD/MM/YY"
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
            </View>

            <Pressable
              accessibilityRole="button"
              onPress={onNext}
              style={styles.nextButton}>
              <Text style={styles.nextButtonText}>Next</Text>
            </Pressable>
          </View>
        </ScrollView>

        <AppBottomNav activeTab={activeTab} onTabPress={onTabPress} />
      </View>
    </SafeAreaView>
  );
};

const DateInput: React.FC<DateInputProps> = ({
  label,
  onChangeText,
  placeholder,
  value,
}) => {
  return (
    <View style={styles.dateInputWrap}>
      <Text style={styles.dateInputLabel}>{label}</Text>
      <View style={styles.dateInput}>
        <TextInput
          keyboardType="number-pad"
          maxLength={8}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#B2B2B2"
          style={styles.dateInputText}
          value={value}
        />
        <DateIcon height={18} width={18} />
      </View>
    </View>
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
  dateInputText: {
    flex: 1,
    color: colors.textPrimary,
    fontFamily: fonts.regular,
    fontSize: 16,
    paddingVertical: 0,
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
  nextButtonText: {
    color: colors.white,
    fontFamily: fonts.bold,
    fontSize: 18,
  },
});
