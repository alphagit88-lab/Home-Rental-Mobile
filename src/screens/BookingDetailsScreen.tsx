import React, {useEffect, useMemo, useState} from 'react';
import {
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
import LeftArrowIcon from '../assets/images/left-arrow 2.svg';
import {AppBottomNav, AppTab} from '../components/AppBottomNav';
import {AuthInput} from '../components/AuthInput';
import {InlineStateMessage} from '../components/InlineStateMessage';
import {PrimaryActionButton} from '../components/PrimaryActionButton';
import {InlineMessage} from '../hooks/useLoginScreen';
import {useResponsive} from '../hooks/useResponsive';
import {getAuthSession} from '../services/authSession';
import {
  BookingRecord,
  BookingReviewRecord,
  getBookingReviews,
  payBookingBalance,
  payBookingDeposit,
  saveBookingReview,
} from '../services/bookings';
import {colors, fonts, radii, spacing} from '../theme';
import {
  formatBookingDateLabel,
  formatBookingDateTimeLabel,
  formatBookingMoney,
  formatBookingPaymentStatusLabel,
  formatBookingRange,
  formatBookingReviewSummary,
  formatBookingServiceRequestSummary,
  formatBookingStatusLabel,
} from '../utils/bookingPresentation';

type BookingViewerRole = 'tenant' | 'owner';

type BookingDetailsScreenProps = {
  activeTab: AppTab;
  booking: BookingRecord;
  initialMessage?: InlineMessage | null;
  onBack: () => void;
  onBookingUpdated: (booking: BookingRecord) => void;
  onTabPress: (tab: AppTab) => void;
  viewerRole: BookingViewerRole;
};

type PaymentStep = 'balance' | 'deposit';

type PaymentDraft = {
  cardHolderName: string;
  cardNumber: string;
  cvv: string;
  expiryDate: string;
};

const createPaymentDraft = (): PaymentDraft => ({
  cardHolderName: '',
  cardNumber: '',
  cvv: '',
  expiryDate: '',
});

const formatRoleLabel = (value: BookingViewerRole) =>
  value === 'tenant' ? 'Tenant' : 'Owner';

const getRequestStatusDescription = (status: string) => {
  const normalizedStatus = String(status).trim().toLowerCase();

  if (normalizedStatus === 'awaiting_full_payment') {
    return 'This request stays hidden from service providers until the full booking balance is paid.';
  }

  if (normalizedStatus === 'pending') {
    return 'The request is now open to matching nearby service providers.';
  }

  if (normalizedStatus === 'accepted') {
    return 'A service provider has accepted this request.';
  }

  if (normalizedStatus === 'completed') {
    return 'This service request was completed with the booking.';
  }

  if (normalizedStatus === 'cancelled') {
    return 'This service request is no longer active.';
  }

  return 'Status update pending.';
};

const getPaymentSectionMessage = (
  booking: BookingRecord,
  viewerRole: BookingViewerRole,
) => {
  if (booking.paymentStatus === 'deposit_pending') {
    return viewerRole === 'tenant'
      ? 'Your booking is reserved, but you need to pay the 20% deposit within 24 hours to keep it active.'
      : 'The tenant still needs to pay the 20% deposit within 24 hours before this booking remains active.';
  }

  if (booking.paymentStatus === 'deposit_paid') {
    return viewerRole === 'tenant'
      ? 'The deposit is secured. Pay the remaining balance to activate the service provider flow.'
      : 'The tenant has paid the deposit. Service provider matching will begin after the remaining balance is paid.';
  }

  if (booking.paymentStatus === 'paid') {
    return booking.serviceRequests.length > 0
      ? 'Full payment is complete, so the service provider flow is active for the selected service requests.'
      : 'Full payment is complete for this booking.';
  }

  if (booking.paymentStatus === 'expired') {
    return 'The 24-hour deposit window expired, so this booking is no longer active.';
  }

  if (booking.paymentStatus === 'refunded') {
    return 'Payment for this booking has been refunded.';
  }

  if (booking.paymentStatus === 'failed') {
    return 'The latest payment attempt failed.';
  }

  return 'Payment details are pending.';
};

const ReviewRatingButton: React.FC<{
  active: boolean;
  label: number;
  onPress: () => void;
}> = ({active, label, onPress}) => (
  <Pressable
    accessibilityRole="button"
    onPress={onPress}
    style={[
      styles.ratingButton,
      active ? styles.ratingButtonActive : null,
    ]}>
    <Text
      style={[
        styles.ratingButtonText,
        active ? styles.ratingButtonTextActive : null,
      ]}>
      {label}
    </Text>
  </Pressable>
);

const ReviewCard: React.FC<{review: BookingReviewRecord}> = ({review}) => {
  const stars = `${'★'.repeat(Math.max(review.rating, 0))}${'☆'.repeat(
    Math.max(5 - review.rating, 0),
  )}`;

  return (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeaderRow}>
        <View style={styles.reviewHeaderTextWrap}>
          <Text style={styles.reviewTitle}>
            {review.reviewerName ?? formatRoleLabel(review.reviewerRole)}
          </Text>
          <Text style={styles.reviewMetaText}>
            {`${formatRoleLabel(review.reviewerRole)} reviewed ${formatRoleLabel(
              review.revieweeRole,
            ).toLowerCase()} on ${formatBookingDateLabel(review.updatedAt ?? review.createdAt)}`}
          </Text>
        </View>
        <View style={styles.reviewRatingBadge}>
          <Text style={styles.reviewRatingBadgeText}>{stars}</Text>
        </View>
      </View>

      <Text style={styles.reviewCommentText}>
        {review.comment?.trim() || 'No written comment added.'}
      </Text>
    </View>
  );
};

const PaymentModal: React.FC<{
  draft: PaymentDraft;
  onChangeDraft: React.Dispatch<React.SetStateAction<PaymentDraft>>;
  onClose: () => void;
  onSubmit: () => void;
  stage: PaymentStep;
  submitting: boolean;
  visible: boolean;
}> = ({draft, onChangeDraft, onClose, onSubmit, stage, submitting, visible}) => {
  const handleCardNumberChange = (value: string) => {
    const digitsOnly = value.replace(/\D/g, '').slice(0, 16);
    const formattedValue = digitsOnly.replace(/(.{4})/g, '$1 ').trim();
    onChangeDraft(current => ({...current, cardNumber: formattedValue}));
  };

  const handleExpiryChange = (value: string) => {
    const digitsOnly = value.replace(/\D/g, '').slice(0, 4);

    if (digitsOnly.length <= 2) {
      onChangeDraft(current => ({...current, expiryDate: digitsOnly}));
      return;
    }

    onChangeDraft(current => ({
      ...current,
      expiryDate: `${digitsOnly.slice(0, 2)}/${digitsOnly.slice(2)}`,
    }));
  };

  const handleCvvChange = (value: string) => {
    onChangeDraft(current => ({
      ...current,
      cvv: value.replace(/\D/g, '').slice(0, 3),
    }));
  };

  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="formSheet"
      visible={visible}>
      <SafeAreaView style={styles.modalSafeArea}>
        <View style={styles.modalRoot}>
          <View style={styles.modalHeaderRow}>
            <Text style={styles.modalTitle}>
              {stage === 'deposit' ? 'Pay 20% Deposit' : 'Pay Remaining Balance'}
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={onClose}
              style={styles.modalCloseButton}>
              <Text style={styles.modalCloseButtonText}>Close</Text>
            </Pressable>
          </View>

          <Text style={styles.modalIntroText}>
            {stage === 'deposit'
              ? 'This confirms the booking inside the 24-hour deposit window.'
              : 'This completes the booking payment and activates the service provider flow.'}
          </Text>

          <View style={styles.formFields}>
            <AuthInput
              autoCapitalize="words"
              onChangeText={value =>
                onChangeDraft(current => ({...current, cardHolderName: value}))
              }
              placeholder="Card holder name"
              value={draft.cardHolderName}
            />
            <AuthInput
              keyboardType="number-pad"
              onChangeText={handleCardNumberChange}
              placeholder="Card number"
              value={draft.cardNumber}
            />
            <View style={styles.paymentRow}>
              <View style={styles.paymentHalfField}>
                <AuthInput
                  keyboardType="number-pad"
                  onChangeText={handleExpiryChange}
                  placeholder="MM/YY"
                  value={draft.expiryDate}
                />
              </View>
              <View style={styles.paymentHalfField}>
                <AuthInput
                  keyboardType="number-pad"
                  onChangeText={handleCvvChange}
                  placeholder="CVV"
                  value={draft.cvv}
                />
              </View>
            </View>
          </View>

          <View style={styles.modalFooter}>
            <Pressable
              accessibilityRole="button"
              onPress={onClose}
              style={styles.modalSecondaryButton}>
              <Text style={styles.modalSecondaryButtonText}>Cancel</Text>
            </Pressable>
            <View style={styles.modalPrimaryButtonWrap}>
              <PrimaryActionButton
                loading={submitting}
                onPress={onSubmit}
                title={stage === 'deposit' ? 'Pay Deposit' : 'Pay Balance'}
              />
            </View>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export const BookingDetailsScreen: React.FC<BookingDetailsScreenProps> = ({
  activeTab,
  booking,
  initialMessage = null,
  onBack,
  onBookingUpdated,
  onTabPress,
  viewerRole,
}) => {
  const responsive = useResponsive();
  const topInset =
    Platform.OS === 'android'
      ? (StatusBar.currentHeight ?? 0) + spacing.sm
      : spacing.md;
  const session = getAuthSession();
  const [inlineMessage, setInlineMessage] = useState<InlineMessage | null>(null);
  const [paymentDraft, setPaymentDraft] = useState<PaymentDraft>(
    createPaymentDraft(),
  );
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [paymentStep, setPaymentStep] = useState<PaymentStep>('deposit');
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  useEffect(() => {
    setInlineMessage(initialMessage);
  }, [initialMessage, booking.id]);

  const viewerReview = useMemo(
    () =>
      booking.reviews.find(
        review => review.reviewerId === (session?.user.id ?? -1),
      ) ?? null,
    [booking.reviews, session?.user.id],
  );

  useEffect(() => {
    setReviewRating(viewerReview?.rating ?? 0);
    setReviewComment(viewerReview?.comment ?? '');
  }, [viewerReview]);

  const canPayDeposit =
    viewerRole === 'tenant' &&
    booking.paymentStatus === 'deposit_pending' &&
    booking.bookingStatus !== 'cancelled';
  const canPayBalance =
    viewerRole === 'tenant' &&
    booking.paymentStatus === 'deposit_paid' &&
    booking.bookingStatus !== 'cancelled';
  const canReview =
    (viewerRole === 'tenant' || viewerRole === 'owner') &&
    booking.bookingStatus === 'completed' &&
    booking.paymentStatus === 'paid';
  const reviewTargetLabel = viewerRole === 'tenant' ? 'owner' : 'tenant';

  const handleOpenPayment = (stage: PaymentStep) => {
    setPaymentStep(stage);
    setPaymentDraft(createPaymentDraft());
    setInlineMessage(null);
    setPaymentModalVisible(true);
  };

  const handleClosePayment = () => {
    setPaymentModalVisible(false);
    setPaymentDraft(createPaymentDraft());
  };

  const handleSubmitPayment = async () => {
    const token = session?.token;
    const cardDigits = paymentDraft.cardNumber.replace(/\D/g, '');

    if (!token) {
      setInlineMessage({
        text: 'Sign in again to continue with this payment.',
        tone: 'error',
      });
      return;
    }

    if (!paymentDraft.cardHolderName.trim()) {
      setInlineMessage({
        text: 'Please enter the card holder name.',
        tone: 'error',
      });
      return;
    }

    if (cardDigits.length !== 16) {
      setInlineMessage({
        text: 'Please enter a valid 16-digit card number.',
        tone: 'error',
      });
      return;
    }

    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(paymentDraft.expiryDate)) {
      setInlineMessage({
        text: 'Please enter the expiry date in MM/YY format.',
        tone: 'error',
      });
      return;
    }

    if (paymentDraft.cvv.length !== 3) {
      setInlineMessage({
        text: 'Please enter the 3-digit CVV.',
        tone: 'error',
      });
      return;
    }

    setPaymentSubmitting(true);
    setInlineMessage(null);

    try {
      const updatedBooking =
        paymentStep === 'deposit'
          ? await payBookingDeposit(token, booking.id, {
              cardLast4: cardDigits.slice(-4),
              paymentMethod: 'card',
            })
          : await payBookingBalance(token, booking.id, {
              cardLast4: cardDigits.slice(-4),
              paymentMethod: 'card',
            });

      onBookingUpdated(updatedBooking);
      handleClosePayment();
      setInlineMessage({
        text:
          paymentStep === 'deposit'
            ? 'Deposit paid successfully. You can now settle the remaining balance any time before check-out.'
            : 'Full payment received. The service provider flow is now active for this booking.',
        tone: 'success',
      });
    } catch (error) {
      setInlineMessage({
        text:
          error instanceof Error
            ? error.message
            : 'Unable to process this payment right now.',
        tone: 'error',
      });
    } finally {
      setPaymentSubmitting(false);
    }
  };

  const handleSaveReview = async () => {
    const token = session?.token;

    if (!token) {
      setInlineMessage({
        text: 'Sign in again to save your review.',
        tone: 'error',
      });
      return;
    }

    if (reviewRating < 1 || reviewRating > 5) {
      setInlineMessage({
        text: 'Please choose a rating from 1 to 5.',
        tone: 'error',
      });
      return;
    }

    if (reviewComment.length > 2000) {
      setInlineMessage({
        text: 'Review comments must be 2000 characters or fewer.',
        tone: 'error',
      });
      return;
    }

    setReviewSubmitting(true);
    setInlineMessage(null);

    try {
      await saveBookingReview(token, booking.id, {
        comment: reviewComment,
        rating: reviewRating,
      });
      const reviews = await getBookingReviews(token, booking.id);
      onBookingUpdated({
        ...booking,
        reviews,
      });
      setInlineMessage({
        text: viewerReview
          ? 'Your booking review was updated successfully.'
          : 'Your booking review was saved successfully.',
        tone: 'success',
      });
    } catch (error) {
      setInlineMessage({
        text:
          error instanceof Error
            ? error.message
            : 'Unable to save this review right now.',
        tone: 'error',
      });
    } finally {
      setReviewSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
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
            <View style={styles.headerRow}>
              <Pressable
                accessibilityRole="button"
                onPress={onBack}
                style={styles.backButton}>
                <LeftArrowIcon height={18} width={18} />
              </Pressable>
              <Text style={styles.headerTitle}>Booking Details</Text>
              <View style={styles.headerSpacer} />
            </View>

            <View style={styles.heroCard}>
              <Text style={styles.heroEyebrow}>{booking.bookingCode}</Text>
              <Text style={styles.heroTitle}>{booking.propertyTitle}</Text>
              <Text style={styles.heroSubtitle}>
                {booking.propertyLocationText || 'Location unavailable'}
              </Text>

              <View style={styles.heroBadgeRow}>
                <View style={[styles.heroBadge, styles.heroBadgePrimary]}>
                  <Text style={styles.heroBadgeLabel}>Booking</Text>
                  <Text style={styles.heroBadgeValue}>
                    {formatBookingStatusLabel(booking.bookingStatus)}
                  </Text>
                </View>
                <View style={[styles.heroBadge, styles.heroBadgeAccent]}>
                  <Text style={styles.heroBadgeLabel}>Payment</Text>
                  <Text style={styles.heroBadgeValue}>
                    {formatBookingPaymentStatusLabel(booking.paymentStatus)}
                  </Text>
                </View>
              </View>

              <Text style={styles.heroCaption}>
                {getPaymentSectionMessage(booking, viewerRole)}
              </Text>
            </View>

            {inlineMessage ? (
              <View style={styles.inlineMessageWrap}>
                <InlineStateMessage message={inlineMessage} />
              </View>
            ) : null}

            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Booking Overview</Text>
              <View style={styles.infoGrid}>
                <InfoItem
                  label="Stay"
                  value={formatBookingRange(booking.checkIn, booking.checkOut)}
                />
                <InfoItem
                  label="Booked On"
                  value={formatBookingDateLabel(booking.createdAt)}
                />
                <InfoItem label="Guests" value={String(booking.guestCount)} />
                <InfoItem
                  label={viewerRole === 'tenant' ? 'Owner' : 'Tenant'}
                  value={
                    viewerRole === 'tenant'
                      ? booking.ownerName ?? 'Owner'
                      : booking.tenantName ?? 'Tenant'
                  }
                />
                <InfoItem
                  label="Services"
                  value={formatBookingServiceRequestSummary(booking.serviceRequests)}
                />
                <InfoItem
                  label="Reviews"
                  value={formatBookingReviewSummary(booking.reviews)}
                />
              </View>
              {booking.notes?.trim() ? (
                <View style={styles.noteCard}>
                  <Text style={styles.noteCardTitle}>Booking note</Text>
                  <Text style={styles.noteCardText}>{booking.notes}</Text>
                </View>
              ) : null}
            </View>

            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Payment Plan</Text>
              <View style={styles.summaryList}>
                <SummaryRow
                  label="Total amount"
                  value={formatBookingMoney(booking.totalAmount)}
                />
                <SummaryRow
                  label="20% deposit"
                  value={formatBookingMoney(booking.depositAmount)}
                />
                <SummaryRow
                  label="Remaining balance"
                  value={formatBookingMoney(booking.remainingAmount)}
                />
                <SummaryRow
                  label="Deposit due"
                  value={formatBookingDateTimeLabel(booking.depositDueAt)}
                />
                <SummaryRow
                  label="Deposit paid"
                  value={formatBookingDateTimeLabel(booking.depositPaidAt)}
                />
                <SummaryRow
                  label="Balance paid"
                  value={formatBookingDateTimeLabel(booking.remainingPaidAt)}
                />
              </View>

              {(canPayDeposit || canPayBalance) && viewerRole === 'tenant' ? (
                <View style={styles.paymentActionWrap}>
                  <PrimaryActionButton
                    onPress={() =>
                      handleOpenPayment(canPayDeposit ? 'deposit' : 'balance')
                    }
                    title={canPayDeposit ? 'Pay 20% Deposit' : 'Pay Full Balance'}
                  />
                </View>
              ) : null}

              <Text style={styles.sectionHint}>
                {getPaymentSectionMessage(booking, viewerRole)}
              </Text>
            </View>

            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Service Requests</Text>
              {booking.serviceRequests.length === 0 ? (
                <Text style={styles.stateText}>
                  No extra services were attached to this booking.
                </Text>
              ) : (
                <View style={styles.serviceRequestList}>
                  {booking.serviceRequests.map(request => (
                    <View key={request.id} style={styles.serviceRequestCard}>
                      <View style={styles.serviceRequestHeaderRow}>
                        <View style={styles.serviceRequestTextWrap}>
                          <Text style={styles.serviceRequestTitle}>
                            {request.serviceCategoryName}
                          </Text>
                          <Text style={styles.serviceRequestMeta}>
                            {formatBookingStatusLabel(request.requestStatus)}
                          </Text>
                        </View>
                        <View style={styles.serviceRequestBadge}>
                          <Text style={styles.serviceRequestBadgeText}>
                            {formatBookingStatusLabel(request.requestStatus)}
                          </Text>
                        </View>
                      </View>

                      <Text style={styles.serviceRequestDescription}>
                        {getRequestStatusDescription(request.requestStatus)}
                      </Text>

                      {request.serviceProviderName ? (
                        <Text style={styles.serviceRequestMeta}>
                          {`Provider: ${request.serviceProviderName}`}
                        </Text>
                      ) : null}
                      {request.tenantNotes?.trim() ? (
                        <Text style={styles.serviceRequestMeta}>
                          {`Tenant note: ${request.tenantNotes}`}
                        </Text>
                      ) : null}
                    </View>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Booking Reviews</Text>

              {booking.reviews.length === 0 ? (
                <Text style={styles.stateText}>
                  No one has reviewed this booking yet.
                </Text>
              ) : (
                <View style={styles.reviewList}>
                  {booking.reviews.map(review => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </View>
              )}

              {canReview ? (
                <View style={styles.reviewFormCard}>
                  <Text style={styles.reviewFormTitle}>
                    {viewerReview ? 'Update your review' : 'Leave a review'}
                  </Text>
                  <Text style={styles.reviewFormText}>
                    {`Share your feedback about the ${reviewTargetLabel} for this completed booking.`}
                  </Text>

                  <View style={styles.ratingButtonRow}>
                    {[1, 2, 3, 4, 5].map(value => (
                      <ReviewRatingButton
                        active={reviewRating === value}
                        key={value}
                        label={value}
                        onPress={() => setReviewRating(value)}
                      />
                    ))}
                  </View>

                  <TextInput
                    multiline
                    onChangeText={setReviewComment}
                    placeholder="Write your review here"
                    placeholderTextColor={colors.textSecondary}
                    style={styles.reviewInput}
                    textAlignVertical="top"
                    value={reviewComment}
                  />

                  <PrimaryActionButton
                    loading={reviewSubmitting}
                    onPress={() => {
                      void handleSaveReview();
                    }}
                    title={viewerReview ? 'Update Review' : 'Save Review'}
                  />
                </View>
              ) : (
                <Text style={styles.sectionHint}>
                  Reviews open only after a booking is completed and fully paid.
                </Text>
              )}
            </View>
          </View>
        </ScrollView>

        <PaymentModal
          draft={paymentDraft}
          onChangeDraft={setPaymentDraft}
          onClose={handleClosePayment}
          onSubmit={() => {
            void handleSubmitPayment();
          }}
          stage={paymentStep}
          submitting={paymentSubmitting}
          visible={paymentModalVisible}
        />

        <AppBottomNav activeTab={activeTab} onTabPress={onTabPress} />
      </View>
    </SafeAreaView>
  );
};

const InfoItem: React.FC<{label: string; value: string}> = ({label, value}) => (
  <View style={styles.infoItem}>
    <Text style={styles.infoItemLabel}>{label}</Text>
    <Text style={styles.infoItemValue}>{value}</Text>
  </View>
);

const SummaryRow: React.FC<{label: string; value: string}> = ({label, value}) => (
  <View style={styles.summaryRow}>
    <Text style={styles.summaryLabel}>{label}</Text>
    <Text style={styles.summaryValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingBottom: 144,
  },
  contentWidth: {
    width: '100%',
    alignSelf: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 18,
  },
  headerSpacer: {
    width: 40,
  },
  heroCard: {
    borderRadius: 20,
    backgroundColor: '#173C35',
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  heroEyebrow: {
    color: '#BFD5CD',
    fontFamily: fonts.medium,
    fontSize: 12,
    marginBottom: 4,
  },
  heroTitle: {
    color: colors.white,
    fontFamily: fonts.heavy,
    fontSize: 24,
    marginBottom: 4,
  },
  heroSubtitle: {
    color: '#E8F1ED',
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  heroBadgeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  heroBadge: {
    flex: 1,
    borderRadius: 14,
    padding: spacing.sm,
  },
  heroBadgePrimary: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  heroBadgeAccent: {
    backgroundColor: 'rgba(230, 169, 53, 0.18)',
  },
  heroBadgeLabel: {
    color: '#D5E4DE',
    fontFamily: fonts.medium,
    fontSize: 11,
    marginBottom: 3,
  },
  heroBadgeValue: {
    color: colors.white,
    fontFamily: fonts.bold,
    fontSize: 14,
  },
  heroCaption: {
    color: '#D9E7E1',
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 20,
  },
  inlineMessageWrap: {
    marginBottom: spacing.md,
  },
  sectionCard: {
    borderRadius: 18,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#E5DCD2',
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 18,
    marginBottom: spacing.sm,
  },
  infoGrid: {
    gap: spacing.sm,
  },
  infoItem: {
    borderRadius: 12,
    backgroundColor: '#FAF7F2',
    padding: spacing.sm + 2,
  },
  infoItemLabel: {
    color: '#7D746C',
    fontFamily: fonts.medium,
    fontSize: 12,
    marginBottom: 4,
  },
  infoItemValue: {
    color: colors.textPrimary,
    fontFamily: fonts.semibold,
    fontSize: 14,
    lineHeight: 20,
  },
  noteCard: {
    borderRadius: 12,
    backgroundColor: '#FFF7E8',
    padding: spacing.sm + 2,
    marginTop: spacing.sm,
  },
  noteCardTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.semibold,
    fontSize: 13,
    marginBottom: 4,
  },
  noteCardText: {
    color: '#5F574F',
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 19,
  },
  summaryList: {
    gap: spacing.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  summaryLabel: {
    color: '#6D655D',
    fontFamily: fonts.regular,
    fontSize: 14,
  },
  summaryValue: {
    color: colors.textPrimary,
    fontFamily: fonts.semibold,
    fontSize: 14,
    flexShrink: 1,
    textAlign: 'right',
  },
  paymentActionWrap: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  sectionHint: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 20,
    marginTop: spacing.sm,
  },
  serviceRequestList: {
    gap: spacing.sm,
  },
  serviceRequestCard: {
    borderRadius: 14,
    backgroundColor: '#FCF7EF',
    borderWidth: 1,
    borderColor: '#E9DECF',
    padding: spacing.sm + 2,
  },
  serviceRequestHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: 6,
  },
  serviceRequestTextWrap: {
    flex: 1,
  },
  serviceRequestTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 15,
    marginBottom: 2,
  },
  serviceRequestMeta: {
    color: '#665D56',
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 2,
  },
  serviceRequestBadge: {
    borderRadius: radii.pill,
    backgroundColor: '#EEF6F2',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 6,
  },
  serviceRequestBadgeText: {
    color: colors.primary,
    fontFamily: fonts.medium,
    fontSize: 11,
  },
  serviceRequestDescription: {
    color: '#5D554D',
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 18,
  },
  stateText: {
    color: colors.textSecondary,
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 20,
  },
  reviewList: {
    gap: spacing.sm,
  },
  reviewCard: {
    borderRadius: 14,
    backgroundColor: '#FAF7F2',
    padding: spacing.sm + 2,
  },
  reviewHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: 6,
  },
  reviewHeaderTextWrap: {
    flex: 1,
  },
  reviewTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 14,
    marginBottom: 2,
  },
  reviewMetaText: {
    color: '#6B625A',
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 18,
  },
  reviewRatingBadge: {
    borderRadius: radii.pill,
    backgroundColor: '#FFF2D8',
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  reviewRatingBadgeText: {
    color: colors.accent,
    fontFamily: fonts.bold,
    fontSize: 11,
  },
  reviewCommentText: {
    color: '#4E4741',
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 19,
  },
  reviewFormCard: {
    borderRadius: 14,
    backgroundColor: '#F8F3EB',
    padding: spacing.md,
    marginTop: spacing.md,
  },
  reviewFormTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 16,
    marginBottom: 4,
  },
  reviewFormText: {
    color: '#5E564F',
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: spacing.sm,
  },
  ratingButtonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  ratingButton: {
    minWidth: 44,
    minHeight: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DACDBF',
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingButtonActive: {
    borderColor: colors.accent,
    backgroundColor: '#FFF4DE',
  },
  ratingButtonText: {
    color: colors.textPrimary,
    fontFamily: fonts.semibold,
    fontSize: 14,
  },
  ratingButtonTextActive: {
    color: colors.accent,
  },
  reviewInput: {
    minHeight: 120,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D9CEBF',
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    color: colors.textPrimary,
    fontFamily: fonts.regular,
    fontSize: 14,
    marginBottom: spacing.md,
  },
  modalSafeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  modalRoot: {
    flex: 1,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  modalTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 18,
    flex: 1,
  },
  modalCloseButton: {
    minHeight: 34,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: '#DED5CC',
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseButtonText: {
    color: colors.textPrimary,
    fontFamily: fonts.medium,
    fontSize: 12,
  },
  modalIntroText: {
    color: '#5F564E',
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  formFields: {
    gap: spacing.sm,
  },
  paymentRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  paymentHalfField: {
    flex: 1,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: 'auto',
    alignItems: 'center',
  },
  modalSecondaryButton: {
    flex: 1,
    minHeight: 56,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: '#D7CCBE',
    backgroundColor: '#FBF8F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSecondaryButtonText: {
    color: colors.textPrimary,
    fontFamily: fonts.medium,
    fontSize: 14,
  },
  modalPrimaryButtonWrap: {
    flex: 1.3,
  },
});
