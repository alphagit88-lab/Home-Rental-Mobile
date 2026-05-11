import React, {useState} from 'react';
import {
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import MenuIcon from '../assets/images/menu 1.svg';
import ProfilePic from '../assets/images/profile_pic.svg';
import {AppBottomNav, AppTab} from '../components/AppBottomNav';
import {InlineStateMessage} from '../components/InlineStateMessage';
import {InlineMessage} from '../hooks/useLoginScreen';
import {useHomeScreen} from '../hooks/useHomeScreen';
import {useProviderServiceRequests} from '../hooks/useProviderServiceRequests';
import {useResponsive} from '../hooks/useResponsive';
import {RentalServiceRequestRecord} from '../types/rentalService';
import {colors, fonts, radii, spacing} from '../theme';
import {
  formatBookingRange,
  formatBookingStatusLabel,
} from '../utils/bookingPresentation';

type ServiceProviderRequestsScreenProps = {
  activeTab: AppTab;
  onTabPress: (tab: AppTab) => void;
};

const providerTabLabels: Partial<Record<AppTab, string>> = {
  bookings: 'Requests',
  dashboard: 'Home',
  properties: 'Map',
};

export const ServiceProviderRequestsScreen: React.FC<
  ServiceProviderRequestsScreenProps
> = ({activeTab, onTabPress}) => {
  const responsive = useResponsive();
  const home = useHomeScreen();
  const topInset =
    Platform.OS === 'android'
      ? (StatusBar.currentHeight ?? 0) + spacing.sm
      : spacing.md;
  const {
    assignedRequests,
    errorMessage,
    loading,
    nearbyRequests,
    reload,
    respondToRequest,
    respondingRequestId,
  } = useProviderServiceRequests({limit: 100});
  const [inlineMessage, setInlineMessage] = useState<InlineMessage | null>(null);

  const handleRespond = async (
    requestId: number,
    action: 'accept' | 'reject',
  ) => {
    try {
      await respondToRequest(requestId, action);
      setInlineMessage({
        text:
          action === 'accept'
            ? 'Service request accepted successfully.'
            : 'Service request rejected successfully.',
        tone: 'success',
      });
    } catch (error) {
      setInlineMessage({
        text:
          error instanceof Error
            ? error.message
            : 'Unable to update this service request.',
        tone: 'error',
      });
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
                onPress={home.onMenuPress}
                style={styles.iconButton}>
                <MenuIcon height={22} width={32} />
              </Pressable>

              <Pressable
                accessibilityRole="button"
                onPress={home.onProfilePress}
                style={styles.profileButton}>
                <Text style={styles.profileLabel}>{`Hello ${home.userName}.`}</Text>
                <View style={styles.profileImageWrap}>
                  <ProfilePic height="100%" width="100%" />
                </View>
              </Pressable>
            </View>

            <View style={styles.heroCard}>
              <Text style={styles.heroTitle}>Tenant service requests</Text>
              <Text style={styles.heroText}>
                Accept matching nearby requests or review the ones already
                assigned to you.
              </Text>
              <Text style={styles.heroSubnote}>
                Only requests inside your configured service radius are shown
                here, and the backend checks that rule again before approval.
              </Text>

              <View style={styles.heroStatsRow}>
                <HeroBadge label="Nearby" value={String(nearbyRequests.length)} />
                <HeroBadge
                  label="Accepted"
                  value={String(assignedRequests.length)}
                />
              </View>

              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  void reload();
                }}
                style={({pressed}) => [
                  styles.heroButton,
                  pressed ? styles.pressed : null,
                ]}>
                <Text style={styles.heroButtonText}>Refresh Requests</Text>
              </Pressable>
            </View>

            {inlineMessage ? (
              <View style={styles.inlineMessageWrap}>
                <InlineStateMessage message={inlineMessage} />
              </View>
            ) : null}

            <RequestSection
              emptyMessage="No nearby requests matched your service area and categories."
              loading={loading}
              requests={nearbyRequests}
              renderActions={request => (
                <View style={styles.actionRow}>
                  <Pressable
                    accessibilityRole="button"
                    disabled={respondingRequestId === request.id}
                    onPress={() => {
                      void handleRespond(request.id, 'reject');
                    }}
                    style={({pressed}) => [
                      styles.rejectButton,
                      respondingRequestId === request.id
                        ? styles.actionButtonDisabled
                        : null,
                      pressed ? styles.pressed : null,
                    ]}>
                    <Text style={styles.rejectButtonText}>
                      {respondingRequestId === request.id ? 'Saving...' : 'Reject'}
                    </Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    disabled={respondingRequestId === request.id}
                    onPress={() => {
                      void handleRespond(request.id, 'accept');
                    }}
                    style={({pressed}) => [
                      styles.acceptButton,
                      respondingRequestId === request.id
                        ? styles.actionButtonDisabled
                        : null,
                      pressed ? styles.pressed : null,
                    ]}>
                    <Text style={styles.acceptButtonText}>
                      {respondingRequestId === request.id ? 'Saving...' : 'Accept'}
                    </Text>
                  </Pressable>
                </View>
              )}
              stateMessage={errorMessage}
              title="Nearby requests"
            />

            <RequestSection
              emptyMessage="Accepted requests will appear here after you confirm a tenant request."
              loading={loading}
              requests={assignedRequests}
              renderActions={() => (
                <View style={styles.acceptedBadge}>
                  <Text style={styles.acceptedBadgeText}>Accepted</Text>
                </View>
              )}
              stateMessage={errorMessage}
              title="My accepted requests"
            />
          </View>
        </ScrollView>

        <AppBottomNav
          activeTab={activeTab}
          labels={providerTabLabels}
          onTabPress={onTabPress}
        />
      </View>
    </SafeAreaView>
  );
};

type HeroBadgeProps = {
  label: string;
  value: string;
};

const HeroBadge: React.FC<HeroBadgeProps> = ({label, value}) => {
  return (
    <View style={styles.heroBadge}>
      <Text style={styles.heroBadgeValue}>{value}</Text>
      <Text style={styles.heroBadgeLabel}>{label}</Text>
    </View>
  );
};

type RequestSectionProps = {
  emptyMessage: string;
  loading: boolean;
  renderActions: (request: RentalServiceRequestRecord) => React.ReactNode;
  requests: RentalServiceRequestRecord[];
  stateMessage: string | null;
  title: string;
};

const RequestSection: React.FC<RequestSectionProps> = ({
  emptyMessage,
  loading,
  renderActions,
  requests,
  stateMessage,
  title,
}) => {
  return (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>{title}</Text>

      {loading ? (
        <Text style={styles.stateText}>Loading service requests...</Text>
      ) : stateMessage ? (
        <Text style={styles.stateText}>{stateMessage}</Text>
      ) : requests.length === 0 ? (
        <Text style={styles.stateText}>{emptyMessage}</Text>
      ) : (
        <View style={styles.requestList}>
          {requests.map(request => (
            <RequestCard
              actions={renderActions(request)}
              key={request.id}
              request={request}
            />
          ))}
        </View>
      )}
    </View>
  );
};

type RequestCardProps = {
  actions: React.ReactNode;
  request: RentalServiceRequestRecord;
};

const RequestCard: React.FC<RequestCardProps> = ({actions, request}) => {
  return (
    <View style={styles.requestCard}>
      <View style={styles.requestHeaderRow}>
        <View style={styles.requestHeaderTextWrap}>
          <Text numberOfLines={1} style={styles.requestTitle}>
            {request.propertyTitle}
          </Text>
          <Text style={styles.requestCategory}>{request.serviceCategoryName}</Text>
        </View>
        <View style={styles.requestStatusBadge}>
          <Text style={styles.requestStatusBadgeText}>
            {formatBookingStatusLabel(request.requestStatus)}
          </Text>
        </View>
      </View>

      <Text style={styles.requestMetaText}>
        {request.locationText || 'Location unavailable'}
      </Text>
      <Text style={styles.requestMetaText}>
        {request.distanceKm === null
          ? 'Distance pending'
          : `${request.distanceKm.toFixed(2)} km away`}
      </Text>
      <Text style={styles.requestMetaText}>
        {`${request.tenantName ?? 'Tenant'} | ${formatBookingRange(
          request.checkIn,
          request.checkOut,
        )}`}
      </Text>
      <Text style={styles.requestMetaText}>{`Booking code: ${request.bookingCode}`}</Text>

      <View style={styles.notesCard}>
        <Text style={styles.notesTitle}>Tenant note</Text>
        <Text style={styles.notesText}>
          {request.tenantNotes?.trim() || 'No extra note was added by the tenant.'}
        </Text>
      </View>

      {actions}
    </View>
  );
};

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
    paddingBottom: 146,
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
  heroCard: {
    borderRadius: 18,
    backgroundColor: '#173C35',
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  heroTitle: {
    color: colors.white,
    fontFamily: fonts.heavy,
    fontSize: 22,
    marginBottom: 6,
  },
  heroText: {
    color: '#E5F0EB',
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: spacing.xs,
  },
  heroSubnote: {
    color: '#CDE2DA',
    fontFamily: fonts.medium,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: spacing.md,
  },
  heroStatsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  heroBadge: {
    flex: 1,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  heroBadgeValue: {
    color: colors.white,
    fontFamily: fonts.heavy,
    fontSize: 20,
    marginBottom: 2,
  },
  heroBadgeLabel: {
    color: '#D7E6E0',
    fontFamily: fonts.medium,
    fontSize: 12,
  },
  heroButton: {
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: '#FFF0D9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroButtonText: {
    color: colors.primary,
    fontFamily: fonts.bold,
    fontSize: 15,
  },
  inlineMessageWrap: {
    marginBottom: spacing.md,
  },
  sectionCard: {
    borderRadius: 18,
    backgroundColor: '#FFF8EE',
    borderWidth: 1,
    borderColor: '#E7D8C6',
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 18,
    marginBottom: spacing.sm,
  },
  stateText: {
    color: colors.textSecondary,
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 20,
  },
  requestList: {
    gap: spacing.sm,
  },
  requestCard: {
    borderRadius: 14,
    backgroundColor: colors.white,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#ECE1D5',
  },
  requestHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: 6,
  },
  requestHeaderTextWrap: {
    flex: 1,
  },
  requestTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 16,
    marginBottom: 2,
  },
  requestCategory: {
    color: colors.primary,
    fontFamily: fonts.medium,
    fontSize: 13,
  },
  requestStatusBadge: {
    borderRadius: radii.pill,
    backgroundColor: '#EEF6F2',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 6,
  },
  requestStatusBadgeText: {
    color: colors.primary,
    fontFamily: fonts.medium,
    fontSize: 11,
  },
  requestMetaText: {
    color: '#625A53',
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 2,
  },
  notesCard: {
    borderRadius: 12,
    backgroundColor: '#F7F2EB',
    padding: spacing.sm + 2,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  notesTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.medium,
    fontSize: 12,
    marginBottom: 4,
  },
  notesText: {
    color: '#625A53',
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 18,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  rejectButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D8CDC1',
    backgroundColor: '#F5F1EA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectButtonText: {
    color: colors.textPrimary,
    fontFamily: fonts.medium,
    fontSize: 14,
  },
  acceptButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptButtonText: {
    color: colors.white,
    fontFamily: fonts.bold,
    fontSize: 14,
  },
  actionButtonDisabled: {
    opacity: 0.8,
  },
  acceptedBadge: {
    minHeight: 40,
    borderRadius: 12,
    backgroundColor: '#EEF6F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptedBadgeText: {
    color: colors.primary,
    fontFamily: fonts.semibold,
    fontSize: 14,
  },
  pressed: {
    opacity: 0.84,
  },
});
