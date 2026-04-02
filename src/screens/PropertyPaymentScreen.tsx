import React, {useState} from 'react';
import {
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
import BottomLineGraphic from '../assets/images/Line (1).svg';
import MiddleLineGraphic from '../assets/images/Line (2).svg';
import LineGraphic from '../assets/images/Line.svg';
import MessageIcon from '../assets/images/Message.svg';
import CardBackground from '../assets/images/Rectangle 2.3.svg';
import CardChip from '../assets/images/Rectangle 3.svg';
import CardOverlay from '../assets/images/Subtract.svg';
import CardSignalBack from '../assets/images/Vector 2.1.svg';
import CardSignalFront from '../assets/images/Vector 2.svg';
import VisaLogo from '../assets/images/visa-pay-logo.svg';
import ProfileIcon from '../assets/images/iconamoon_profile-light.svg';
import LeftArrowIcon from '../assets/images/left-arrow 2.svg';
import {AppBottomNav, AppTab} from '../components/AppBottomNav';
import {InlineStateMessage} from '../components/InlineStateMessage';
import {InlineMessage} from '../hooks/useLoginScreen';
import {useResponsive} from '../hooks/useResponsive';
import {getAuthSession} from '../services/authSession';
import {PropertyRecord} from '../services/properties';
import {BookingPaymentDraft, PropertyBookingDraft} from '../types/propertyBooking';
import {colors, fonts, spacing} from '../theme';
import {
  formatPropertyAvailability,
  formatPropertyRent,
} from '../utils/propertyPresentation';

const cardFontFamily = Platform.OS === 'android' ? 'Roboto' : fonts.regular;

type PropertyPaymentScreenProps = {
  activeTab: AppTab;
  bookingDraft: PropertyBookingDraft;
  onBack: () => void;
  onBookNow: (paymentDraft: BookingPaymentDraft) => Promise<void>;
  onTabPress: (tab: AppTab) => void;
  property: PropertyRecord;
};

type InputFieldProps = {
  icon: React.ReactNode;
  keyboardType?: 'default' | 'email-address';
  onChangeText: (value: string) => void;
  placeholder: string;
  value: string;
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
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolderName, setCardHolderName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [submitState, setSubmitState] = useState<'idle' | 'loading' | 'error'>(
    'idle',
  );
  const [inlineMessage, setInlineMessage] = useState<InlineMessage | null>(null);

  const handleCardNumberChange = (value: string) => {
    const digitsOnly = value.replace(/\D/g, '').slice(0, 16);
    const formattedValue = digitsOnly.replace(/(.{4})/g, '$1 ').trim();
    setCardNumber(formattedValue);
  };

  const handleExpiryChange = (value: string) => {
    const digitsOnly = value.replace(/\D/g, '').slice(0, 4);

    if (digitsOnly.length <= 2) {
      setExpiryDate(digitsOnly);
      return;
    }

    setExpiryDate(`${digitsOnly.slice(0, 2)}/${digitsOnly.slice(2)}`);
  };

  const handleCvvChange = (value: string) => {
    setCvv(value.replace(/\D/g, '').slice(0, 3));
  };

  const handleBookNowPress = async () => {
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

    if (cardNumber.replace(/\D/g, '').length !== 16) {
      setSubmitState('error');
      setInlineMessage({
        text: 'Please enter a valid 16-digit card number.',
        tone: 'error',
      });
      return;
    }

    if (!cardHolderName.trim()) {
      setSubmitState('error');
      setInlineMessage({
        text: 'Please enter the card holder name.',
        tone: 'error',
      });
      return;
    }

    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiryDate)) {
      setSubmitState('error');
      setInlineMessage({
        text: 'Please enter the card expiry date in MM/YY format.',
        tone: 'error',
      });
      return;
    }

    if (cvv.length !== 3) {
      setSubmitState('error');
      setInlineMessage({
        text: 'Please enter the 3-digit CVV.',
        tone: 'error',
      });
      return;
    }

    setSubmitState('loading');
    setInlineMessage(null);

    try {
      await onBookNow({
        cardHolderName: cardHolderName.trim(),
        cardNumber,
        cvv,
        email: email.trim().toLowerCase(),
        expiryDate,
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
              <Text style={styles.headerTitle}>Payment</Text>
              <View style={styles.headerSpacer} />
            </View>

            <View style={styles.paymentSummaryCard}>
              <Text style={styles.sectionTitle}>Booking Summary</Text>
              <SummaryRow label="Property" value={property.title} />
              <SummaryRow label="Property code" value={property.propertyCode} />
              <SummaryRow label="Listing type" value={property.listingType} />
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
            </View>

            {inlineMessage ? (
              <View style={styles.inlineMessageWrap}>
                <InlineStateMessage message={inlineMessage} />
              </View>
            ) : null}

            <InputField
              icon={<ProfileIcon height={22} width={22} />}
              onChangeText={setFullName}
              placeholder="Full name"
              value={fullName}
            />

            <InputField
              icon={<MessageIcon height={20} width={20} />}
              keyboardType="email-address"
              onChangeText={setEmail}
              placeholder="abc@email.com"
              value={email}
            />

            <View style={styles.noticeCard}>
              <Text style={styles.noticeTitle}>Payment details</Text>
              <Text style={styles.noticeText}>
                Enter your payment details to finish this booking request.
              </Text>
            </View>

            <View style={styles.cardShell}>
              <CardBackground
                height="100%"
                preserveAspectRatio="none"
                style={styles.cardBackground}
                width="100%"
              />
              <View pointerEvents="none" style={styles.cardOverlayWrap}>
                <CardOverlay
                  height="100%"
                  preserveAspectRatio="none"
                  width="100%"
                />
              </View>

              <View style={styles.cardContent}>
                <CardChip height={21} style={styles.cardChipBg} width={29} />
                <CardSignalFront height={21} style={styles.cardSignalFront} width={4} />
                <CardSignalBack height={21} style={styles.cardSignalBack} width={4} />
                <VisaLogo height={44} style={styles.cardVisaLogo} width={44} />

                <Text style={[styles.cardMetaLabel, styles.cardNumberLabel]}>
                  Card Number
                </Text>
                <TextInput
                  keyboardType="number-pad"
                  onChangeText={handleCardNumberChange}
                  placeholder="0000 0000 0000 0000"
                  placeholderTextColor="rgba(255, 255, 255, 0.96)"
                  selectionColor={colors.white}
                  style={[styles.cardValueInput, styles.cardNumberInput]}
                  value={cardNumber}
                />
                <View style={styles.cardNumberLine}>
                  <LineGraphic height="100%" width="100%" />
                </View>

                <Text style={[styles.cardMetaLabel, styles.cardHolderLabel]}>
                  Card Holder Name
                </Text>
                <TextInput
                  autoCapitalize="words"
                  onChangeText={setCardHolderName}
                  placeholder="Name on card"
                  placeholderTextColor="rgba(255, 255, 255, 0.96)"
                  selectionColor={colors.white}
                  style={[styles.cardValueInput, styles.cardHolderInput]}
                  value={cardHolderName}
                />
                <View style={styles.cardHolderLine}>
                  <MiddleLineGraphic height="100%" width="100%" />
                </View>

                <Text style={[styles.cardMetaLabel, styles.expiryLabel]}>
                  Expiry date
                </Text>
                <TextInput
                  keyboardType="number-pad"
                  onChangeText={handleExpiryChange}
                  placeholder="MM/YY"
                  placeholderTextColor="rgba(255, 255, 255, 0.96)"
                  selectionColor={colors.white}
                  style={[styles.cardValueInput, styles.expiryInput]}
                  value={expiryDate}
                />
                <View style={styles.expiryLine}>
                  <BottomLineGraphic height="100%" width="100%" />
                </View>

                <Text style={[styles.cardMetaLabel, styles.cvvLabel]}>CVV</Text>
                <TextInput
                  keyboardType="number-pad"
                  onChangeText={handleCvvChange}
                  placeholder="000"
                  placeholderTextColor="rgba(255, 255, 255, 0.96)"
                  selectionColor={colors.white}
                  style={[styles.cardValueInput, styles.cvvInput]}
                  value={cvv}
                />
                <View style={styles.cvvLine}>
                  <BottomLineGraphic height="100%" width="100%" />
                </View>
              </View>
            </View>

            <Pressable
              accessibilityRole="button"
              disabled={submitState === 'loading'}
              onPress={() => {
                void handleBookNowPress();
              }}
              style={[
                styles.bookNowButton,
                submitState === 'loading' ? styles.bookNowButtonDisabled : null,
              ]}>
              <Text style={styles.bookNowButtonText}>
                {submitState === 'loading' ? 'Submitting...' : 'Submit Booking'}
              </Text>
            </Pressable>
          </View>
        </ScrollView>

        <AppBottomNav activeTab={activeTab} onTabPress={onTabPress} />
      </View>
    </SafeAreaView>
  );
};

const InputField: React.FC<InputFieldProps> = ({
  icon,
  keyboardType = 'default',
  onChangeText,
  placeholder,
  value,
}) => {
  return (
    <View style={styles.inputWrap}>
      <View style={styles.inputIconWrap}>{icon}</View>
      <TextInput
        keyboardType={keyboardType}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#8B8A9A"
        style={styles.input}
        value={value}
      />
    </View>
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
  inputWrap: {
    minHeight: 54,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D9D4D0',
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm + 6,
    marginBottom: spacing.sm,
  },
  inputIconWrap: {
    width: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.xs,
  },
  input: {
    flex: 1,
    color: colors.textPrimary,
    fontFamily: fonts.regular,
    fontSize: 18,
    paddingVertical: spacing.sm,
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
  cardShell: {
    width: '100%',
    aspectRatio: 341 / 201,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: spacing.xl,
  },
  cardBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  cardOverlayWrap: {
    position: 'absolute',
    left: '0.59%',
    width: '99.41%',
    height: '73.63%',
    bottom: 0,
  },
  cardContent: {
    ...StyleSheet.absoluteFillObject,
  },
  cardChipBg: {
    position: 'absolute',
    left: '4.99%',
    top: '6.98%',
  },
  cardSignalFront: {
    position: 'absolute',
    left: '7.18%',
    top: '7.04%',
  },
  cardSignalBack: {
    position: 'absolute',
    left: '10.04%',
    top: '7.04%',
  },
  cardVisaLogo: {
    position: 'absolute',
    left: '80.65%',
    top: '2.87%',
  },
  cardMetaLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontFamily: cardFontFamily,
    fontSize: 12,
    lineHeight: 14,
    position: 'absolute',
    includeFontPadding: false,
  },
  cardValueInput: {
    color: colors.white,
    fontFamily: cardFontFamily,
    fontSize: 12,
    lineHeight: 14,
    paddingHorizontal: 0,
    paddingVertical: 0,
    height: 16,
    minHeight: 16,
    position: 'absolute',
    includeFontPadding: false,
  },
  cardNumberLabel: {
    left: '6.16%',
    top: '21.8%',
  },
  cardNumberInput: {
    left: '6.16%',
    top: '30.27%',
    width: '38.71%',
    letterSpacing: 0.2,
  },
  cardNumberLine: {
    position: 'absolute',
    left: '6.16%',
    right: '7.77%',
    top: '40.8%',
    height: 1,
  },
  cardHolderLabel: {
    left: '6.16%',
    top: '47.7%',
  },
  cardHolderInput: {
    left: '6.16%',
    top: '56.17%',
    width: '30%',
  },
  cardHolderLine: {
    position: 'absolute',
    left: '6.16%',
    right: '7.77%',
    top: '66.7%',
    height: 1,
  },
  expiryLabel: {
    left: '6.16%',
    top: '73.6%',
  },
  expiryInput: {
    left: '6.16%',
    top: '82.07%',
    width: '10%',
  },
  expiryLine: {
    position: 'absolute',
    left: '6.16%',
    right: '57.04%',
    top: '92.4%',
    height: 1,
  },
  cvvLabel: {
    left: '55.43%',
    top: '73.6%',
  },
  cvvInput: {
    left: '55.43%',
    top: '82.07%',
    width: '8%',
  },
  cvvLine: {
    position: 'absolute',
    left: '55.43%',
    right: '7.77%',
    top: '92.4%',
    height: 1,
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
