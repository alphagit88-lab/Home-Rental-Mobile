import React, {useState} from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import VoucherArrowIcon from '../assets/images/Arrow.svg';
import DateIcon from '../assets/images/clarity_date-line.svg';
import DiscountIcon from '../assets/images/discount.svg';
import DecreaseGuestIcon from '../assets/images/Frame 262.svg';
import IncreaseGuestIcon from '../assets/images/Frame 263.svg';
import LeftArrowIcon from '../assets/images/left-arrow 2.svg';
import CardImage from '../assets/images/image.svg';
import {AppBottomNav, AppTab} from '../components/AppBottomNav';
import {useResponsive} from '../hooks/useResponsive';
import {colors, fonts, radii, spacing} from '../theme';

type PropertyBookingScreenProps = {
  activeTab: AppTab;
  onBack: () => void;
  onNext: () => void;
  onTabPress: (tab: AppTab) => void;
};

export const PropertyBookingScreen: React.FC<PropertyBookingScreenProps> = ({
  activeTab,
  onBack,
  onNext,
  onTabPress,
}) => {
  const responsive = useResponsive();
  const [guestCount, setGuestCount] = useState(4);

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
                <Text style={styles.summaryTitle}>Colombo Lux House</Text>
                <Text style={styles.summaryAddress}>
                  Jl. Lorem Ipsum Dolor Sit Amet Bandung
                </Text>
                <Text style={styles.summaryAddress}>No. 123</Text>
              </View>
            </View>

            <View style={styles.noticeCard}>
              <Text style={styles.noticeTitle}>Non-refundable</Text>
              <Text style={styles.noticeText}>
                You can not refund your payment when you cancel.
              </Text>
            </View>

            <View style={styles.dateRow}>
              <DateInput label="Check-in" value="DD/MM/YY" />
              <DateInput label="Check-out" value="DD/MM/YY" />
            </View>

            <View style={styles.guestsRow}>
              <Text style={styles.guestsLabel}>Total Guest</Text>

              <View style={styles.stepperRow}>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setGuestCount(count => Math.max(1, count - 1))}
                  style={styles.stepperButton}>
                  <DecreaseGuestIcon height={24} width={24} />
                </Pressable>

                <Text style={styles.guestCountText}>{guestCount}</Text>

                <Pressable
                  accessibilityRole="button"
                  onPress={() => setGuestCount(count => count + 1)}
                  style={styles.stepperButton}>
                  <IncreaseGuestIcon height={24} width={24} />
                </Pressable>
              </View>
            </View>

            <Pressable accessibilityRole="button" style={styles.voucherCard}>
              <View style={styles.voucherContent}>
                <DiscountIcon height={18} width={18} />
                <Text style={styles.voucherText}>3 vouchers are applied</Text>
              </View>

              <VoucherArrowIcon height={14} width={14} />
            </Pressable>

            <View style={styles.paymentCard}>
              <Text style={styles.paymentTitle}>Payment Summary</Text>

              <SummaryRow label="Subtotal" value="LKR 501500" />
              <SummaryRow label="Discount Total" value="- LKR 1500" />
              <SummaryRow
                highlight
                label="Total Payment"
                value="LKR 500000"
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

type DateInputProps = {
  label: string;
  value: string;
};

const DateInput: React.FC<DateInputProps> = ({label, value}) => {
  return (
    <View style={styles.dateInputWrap}>
      <Text style={styles.dateInputLabel}>{label}</Text>
      <Pressable accessibilityRole="button" style={styles.dateInput}>
        <Text style={styles.dateInputText}>{value}</Text>
        <DateIcon height={18} width={18} />
      </Pressable>
    </View>
  );
};

type SummaryRowProps = {
  highlight?: boolean;
  label: string;
  value: string;
};

const SummaryRow: React.FC<SummaryRowProps> = ({highlight, label, value}) => {
  return (
    <View style={styles.summaryRow}>
      <Text style={[styles.summaryRowLabel, highlight ? styles.summaryRowLabelStrong : null]}>
        {label}
      </Text>
      <Text style={[styles.summaryRowValue, highlight ? styles.summaryRowValueHighlight : null]}>
        {value}
      </Text>
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
    minHeight: 38,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#9F9F9F',
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm + 4,
  },
  dateInputText: {
    color: '#B2B2B2',
    fontFamily: fonts.regular,
    fontSize: 16,
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
  voucherCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.accent,
    backgroundColor: '#FFFDF8',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.lg + 4,
  },
  voucherContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  voucherText: {
    color: colors.accent,
    fontFamily: fonts.medium,
    fontSize: 14,
  },
  paymentCard: {
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
  paymentTitle: {
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
  },
  summaryRowLabel: {
    color: colors.textPrimary,
    fontFamily: fonts.regular,
    fontSize: 15,
  },
  summaryRowLabelStrong: {
    fontFamily: fonts.bold,
  },
  summaryRowValue: {
    color: '#969696',
    fontFamily: fonts.regular,
    fontSize: 15,
  },
  summaryRowValueHighlight: {
    color: colors.accent,
    fontFamily: fonts.medium,
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
