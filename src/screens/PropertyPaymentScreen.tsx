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
import LeftArrowIcon from '../assets/images/left-arrow 2.svg';
import {AppBottomNav, AppTab} from '../components/AppBottomNav';
import {AuthInput} from '../components/AuthInput';
import {InlineStateMessage} from '../components/InlineStateMessage';
import {InlineMessage} from '../hooks/useLoginScreen';
import {useResponsive} from '../hooks/useResponsive';
import {getAuthSession} from '../services/authSession';
import {PropertyRecord} from '../services/properties';
import {BookingPaymentDraft, PropertyBookingDraft} from '../types/propertyBooking';
import {colors, fonts, spacing} from '../theme';
import {formatBookingMoney} from '../utils/bookingPresentation';
import {
  formatPropertyAvailability,
  formatPropertyRent,
} from '../utils/propertyPresentation';

type PropertyPaymentScreenProps = {
  activeTab: AppTab;
  bookingDraft: PropertyBookingDraft;
  onBack: () => void;
  onBookNow: (paymentDraft: BookingPaymentDraft) => Promise<void>;
  onTabPress: (tab: AppTab) => void;
  property: PropertyRecord;
};

type SummaryRowProps = {
  label: string;
  value: string;
};

export const PropertyPaymentScreen: React.FC<PropertyPaymentScreenProps> = ({
  activeTab,
  bookingDraft,
  onBack,
  onBookNow,
  onTabPress,
  property,
}) => {
  const responsive = useResponsive();
  const session = getAuthSession();
  const [fullName, setFullName] = useState(session?.user.name ?? '');
  const [email, setEmail] = useState(session?.user.email ?? '');
  const [submitState, setSubmitState] = useState<'idle' | 'loading' | 'error'>(
    'idle',
  );
  const [inlineMessage, setInlineMessage] = useState<InlineMessage | null>(null);
  const hasRentConfigured = property.monthlyRent !== null;
  const depositAmount =
    property.monthlyRent === null
      ? null
      : Number((property.monthlyRent * 0.2).toFixed(2));
  const remainingAmount =
    property.monthlyRent === null || depositAmount === null
      ? null
      : Number((property.monthlyRent - depositAmount).toFixed(2));

  const handleBookNowPress = async () => {
    if (!hasRentConfigured) {
      setSubmitState('error');
      setInlineMessage({
        text: 'This property cannot be booked until the owner adds the monthly rent.',
        tone: 'error',
      });
      return;
    }

    if (!fullName.trim()) {
      setSubmitState('error');
      setInlineMessage({
        text: 'Please enter the booking contact name.',
        tone: 'error',
      });
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setSubmitState('error');
      setInlineMessage({
        text: 'Please enter a valid booking email address.',
        tone: 'error',
      });
      return;
    }

    setSubmitState('loading');
    setInlineMessage(null);

    try {
      await onBookNow({
        email: email.trim().toLowerCase(),
        fullName: fullName.trim(),
      });
    } catch (error) {
      setSubmitState('error');
      setInlineMessage({
        text:
          error instanceof Error
            ? error.message
            : 'Unable to submit your booking right now.',
        tone: 'error',
      });
    }
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
              <Text style={styles.headerTitle}>Booking Request</Text>
              <View style={styles.headerSpacer} />
            </View>

            <View style={styles.paymentSummaryCard}>
              <Text style={styles.sectionTitle}>Request Summary</Text>
              <SummaryRow label="Property" value={property.title} />
              <SummaryRow label="Property code" value={property.propertyCode} />
              <SummaryRow label="Listing type" value={property.listingType} />
              <SummaryRow
                label="Monthly Rent"
                value={formatPropertyRent(property.monthlyRent)}
              />
              <SummaryRow
                label="20% deposit after approval"
                value={formatBookingMoney(depositAmount)}
              />
              <SummaryRow
                label="Remaining after deposit"
                value={formatBookingMoney(remainingAmount)}
              />
              <SummaryRow
                label="Available"
                value={formatPropertyAvailability(
                  property.availableFrom,
                  property.availableTo,
                )}
              />
              <SummaryRow
                label="Stay dates"
                value={
                  bookingDraft.checkIn && bookingDraft.checkOut
                    ? `${bookingDraft.checkIn} - ${bookingDraft.checkOut}`
                    : 'Not added yet'
                }
              />
              <SummaryRow
                label="Guests"
                value={String(bookingDraft.guestCount)}
              />
              <SummaryRow
                label="Services"
                value={
                  bookingDraft.serviceCategoryNames.length > 0
                    ? bookingDraft.serviceCategoryNames.join(', ')
                    : 'No extra services'
                }
              />
              <SummaryRow
                label="Service note"
                value={bookingDraft.serviceNotes.trim() || 'No note added'}
              />
            </View>

            {inlineMessage ? (
              <View style={styles.inlineMessageWrap}>
                <InlineStateMessage message={inlineMessage} />
              </View>
            ) : null}

            {!hasRentConfigured ? (
              <View style={styles.inlineMessageWrap}>
                <InlineStateMessage
                  message={{
                    text: 'The owner must add the monthly rent before the booking deposit can be charged.',
                    tone: 'error',
                  }}
                />
              </View>
            ) : null}

            <View style={styles.contactCard}>
              <Text style={styles.sectionTitle}>Contact Details</Text>
              <View style={styles.formFieldWrap}>
                <Text style={styles.fieldLabel}>Full name</Text>
                <AuthInput
                  autoCapitalize="words"
                  onChangeText={setFullName}
                  placeholder="Full name"
                  value={fullName}
                />
              </View>
              <View style={styles.formFieldWrap}>
                <Text style={styles.fieldLabel}>Email</Text>
                <AuthInput
                  keyboardType="email-address"
                  onChangeText={setEmail}
                  placeholder="abc@email.com"
                  value={email}
                />
              </View>
            </View>

            <View style={styles.noticeCard}>
              <Text style={styles.noticeTitle}>Owner confirmation required</Text>
              <Text style={styles.noticeText}>
                This step sends your booking request to the property owner.
                After the owner confirms it, you can pay the 20% deposit from
                the booking details screen. Service provider requests will still
                open only after full payment.
              </Text>
            </View>

            <Pressable
              accessibilityRole="button"
              disabled={submitState === 'loading' || !hasRentConfigured}
              onPress={() => {
                void handleBookNowPress();
              }}
              style={[
                styles.bookNowButton,
                submitState === 'loading' || !hasRentConfigured
                  ? styles.bookNowButtonDisabled
                  : null,
              ]}>
              <Text style={styles.bookNowButtonText}>
                {submitState === 'loading'
                  ? 'Sending Request...'
                  : 'Send Booking Request'}
              </Text>
            </Pressable>
          </View>
        </ScrollView>

        <AppBottomNav activeTab={activeTab} onTabPress={onTabPress} />
      </View>
    </SafeAreaView>
  );
};

const SummaryRow: React.FC<SummaryRowProps> = ({label, value}) => {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
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
    marginBottom: spacing.lg,
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
  paymentSummaryCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    shadowColor: colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 18,
    shadowOffset: {width: 0, height: 8},
    elevation: 6,
    marginBottom: spacing.md,
  },
  inlineMessageWrap: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 17,
    marginBottom: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  summaryLabel: {
    color: colors.textPrimary,
    fontFamily: fonts.regular,
    fontSize: 15,
  },
  summaryValue: {
    color: '#969696',
    fontFamily: fonts.regular,
    fontSize: 15,
    flexShrink: 1,
    textAlign: 'right',
  },
  contactCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    shadowColor: colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 18,
    shadowOffset: {width: 0, height: 8},
    elevation: 6,
    marginBottom: spacing.md,
  },
  formFieldWrap: {
    marginBottom: spacing.sm,
  },
  fieldLabel: {
    color: colors.textPrimary,
    fontFamily: fonts.medium,
    fontSize: 13,
    marginBottom: 6,
  },
  noticeCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#BEBEBE',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  noticeTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 15,
    marginBottom: 6,
  },
  noticeText: {
    color: '#1F1F1F',
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 18,
  },
  bookNowButton: {
    minHeight: 54,
    borderRadius: 14,
    backgroundColor: '#F8A625',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  bookNowButtonDisabled: {
    opacity: 0.78,
  },
  bookNowButtonText: {
    color: colors.white,
    fontFamily: fonts.bold,
    fontSize: 18,
  },
});
