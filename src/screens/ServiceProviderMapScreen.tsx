import React, {useMemo, useState} from 'react';
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
import {Region} from 'react-native-maps';
import MenuIcon from '../assets/images/menu 1.svg';
import ProfilePic from '../assets/images/profile_pic.svg';
import {AppBottomNav, AppTab} from '../components/AppBottomNav';
import {InlineStateMessage} from '../components/InlineStateMessage';
import {
  OpenStreetMapCircle,
  OpenStreetMapCoordinate,
  OpenStreetMapMarker,
  OpenStreetMapView,
} from '../components/OpenStreetMapView';
import {InlineMessage} from '../hooks/useLoginScreen';
import {useHomeScreen} from '../hooks/useHomeScreen';
import {useProviderServiceAreas} from '../hooks/useProviderServiceAreas';
import {useProviderServiceRequests} from '../hooks/useProviderServiceRequests';
import {useResponsive} from '../hooks/useResponsive';
import {ProviderServiceAreaRecord} from '../types/rentalService';
import {colors, fonts, radii, spacing} from '../theme';

type ServiceProviderMapScreenProps = {
  activeTab: AppTab;
  onTabPress: (tab: AppTab) => void;
};

type ServiceAreaDraft = {
  areaRadiusKm: string;
  city: string;
  coordinate: OpenStreetMapCoordinate | null;
  country: string;
};

type LegendChipProps = {
  label: string;
  tone: 'accepted' | 'nearby' | 'radius';
};

type SummaryCardProps = {
  subtitle: string;
  title: string;
};

type ActivityItemProps = {
  statusLabel: string;
  subtitle: string;
  title: string;
};

type ServiceAreaListItemProps = {
  deleting: boolean;
  onDelete: () => void;
  serviceArea: ProviderServiceAreaRecord;
};

const providerTabLabels: Partial<Record<AppTab, string>> = {
  bookings: 'Requests',
  dashboard: 'Home',
  properties: 'Map',
};

const defaultRegion: Region = {
  latitude: 6.9271,
  latitudeDelta: 1.2,
  longitude: 79.8612,
  longitudeDelta: 1.2,
};

const createServiceAreaDraft = (): ServiceAreaDraft => ({
  areaRadiusKm: '',
  city: '',
  coordinate: null,
  country: 'Sri Lanka',
});

const formatCoordinateLabel = (coordinate: OpenStreetMapCoordinate | null) =>
  coordinate
    ? `${coordinate.latitude.toFixed(5)}, ${coordinate.longitude.toFixed(5)}`
    : 'Tap the map to choose the provider location.';

const formatRadiusLabel = (value: number | null) =>
  value === null ? 'Radius pending' : `${value.toFixed(1)} km radius`;

export const ServiceProviderMapScreen: React.FC<
  ServiceProviderMapScreenProps
> = ({activeTab, onTabPress}) => {
  const responsive = useResponsive();
  const home = useHomeScreen();
  const topInset = Platform.OS === 'android' ? spacing.xs : spacing.md;
  const {
    assignedRequests,
    errorMessage: requestsErrorMessage,
    loading: requestsLoading,
    markers,
    nearbyRequests,
    reload: reloadRequests,
    serviceAreas: mapServiceAreas,
  } = useProviderServiceRequests({limit: 100});
  const {
    createArea,
    deleteArea,
    deletingAreaId,
    errorMessage: serviceAreasErrorMessage,
    loading: serviceAreasLoading,
    reload: reloadServiceAreas,
    saving,
    serviceAreas,
  } = useProviderServiceAreas();
  const [inlineMessage, setInlineMessage] = useState<InlineMessage | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [serviceAreaDraft, setServiceAreaDraft] = useState<ServiceAreaDraft>(
    createServiceAreaDraft(),
  );

  const effectiveServiceAreas =
    serviceAreas.length > 0 ? serviceAreas : mapServiceAreas;

  const requestMapMarkers = useMemo<OpenStreetMapMarker[]>(
    () =>
      markers
        .filter(
          marker =>
            Number.isFinite(marker.latitude) &&
            Number.isFinite(marker.longitude) &&
            !(marker.latitude === 0 && marker.longitude === 0),
        )
        .map(marker => ({
          description: [
            marker.serviceCategoryName,
            marker.locationText,
            marker.distanceKm === null
              ? null
              : `${marker.distanceKm.toFixed(2)} km away`,
          ]
            .filter(Boolean)
            .join(' | '),
          indexLabel: marker.bucket === 'assigned' ? 'A' : 'N',
          latitude: marker.latitude,
          longitude: marker.longitude,
          tone: marker.bucket === 'assigned' ? 'accepted' : 'default',
          title: marker.propertyTitle,
        })),
    [markers],
  );

  const serviceAreaCenterMarkers = useMemo<OpenStreetMapMarker[]>(
    () =>
      effectiveServiceAreas
        .filter(
          serviceArea =>
            typeof serviceArea.latitude === 'number' &&
            typeof serviceArea.longitude === 'number',
        )
        .map(serviceArea => ({
          description: [
            `${serviceArea.city}, ${serviceArea.country}`,
            formatRadiusLabel(serviceArea.areaRadiusKm),
          ].join(' | '),
          indexLabel: 'S',
          latitude: serviceArea.latitude as number,
          longitude: serviceArea.longitude as number,
          tone: 'serviceArea' as const,
          title: `${serviceArea.city} service area`,
        })),
    [effectiveServiceAreas],
  );

  const serviceAreaCircles = useMemo<OpenStreetMapCircle[]>(
    () =>
      effectiveServiceAreas
        .filter(
          serviceArea =>
            typeof serviceArea.latitude === 'number' &&
            typeof serviceArea.longitude === 'number' &&
            typeof serviceArea.areaRadiusKm === 'number' &&
            serviceArea.areaRadiusKm > 0,
        )
        .map(serviceArea => ({
          description: `${serviceArea.city}, ${serviceArea.country} | ${formatRadiusLabel(
            serviceArea.areaRadiusKm,
          )}`,
          fillColor: 'rgba(47, 128, 237, 0.18)',
          latitude: serviceArea.latitude as number,
          longitude: serviceArea.longitude as number,
          radiusKm: serviceArea.areaRadiusKm as number,
          strokeColor: '#2F80ED',
          title: `${serviceArea.city} coverage`,
        })),
    [effectiveServiceAreas],
  );

  const allMapMarkers = useMemo(
    () => [...serviceAreaCenterMarkers, ...requestMapMarkers],
    [requestMapMarkers, serviceAreaCenterMarkers],
  );

  const region = useMemo<Region>(() => {
    const firstMarker = allMapMarkers[0];

    if (!firstMarker) {
      return defaultRegion;
    }

    return {
      latitude: firstMarker.latitude,
      latitudeDelta: 0.45,
      longitude: firstMarker.longitude,
      longitudeDelta: 0.45,
    };
  }, [allMapMarkers]);

  const handleOpenAddArea = () => {
    setServiceAreaDraft(createServiceAreaDraft());
    setInlineMessage(null);
    setModalVisible(true);
  };

  const handleCloseAddArea = () => {
    setModalVisible(false);
    setServiceAreaDraft(createServiceAreaDraft());
  };

  const handleSaveServiceArea = async () => {
    const normalizedCountry = serviceAreaDraft.country.trim();
    const normalizedCity = serviceAreaDraft.city.trim();
    const radiusValue = Number(serviceAreaDraft.areaRadiusKm);

    if (!normalizedCountry || !normalizedCity) {
      setInlineMessage({
        text: 'Please add both the country and city for this service area.',
        tone: 'error',
      });
      return;
    }

    if (!serviceAreaDraft.coordinate) {
      setInlineMessage({
        text: 'Please tap the map to select the service provider location.',
        tone: 'error',
      });
      return;
    }

    if (!Number.isFinite(radiusValue) || radiusValue <= 0) {
      setInlineMessage({
        text: 'Please enter a valid service radius in kilometers.',
        tone: 'error',
      });
      return;
    }

    try {
      await createArea({
        areaRadiusKm: radiusValue,
        city: normalizedCity,
        country: normalizedCountry,
        latitude: serviceAreaDraft.coordinate.latitude,
        longitude: serviceAreaDraft.coordinate.longitude,
      });
      await Promise.all([reloadRequests(), reloadServiceAreas()]);
      setInlineMessage({
        text: `Service area saved for ${normalizedCity}. Requests inside this radius can now appear on the map and request list.`,
        tone: 'success',
      });
      handleCloseAddArea();
    } catch (error) {
      setInlineMessage({
        text:
          error instanceof Error
            ? error.message
            : 'Unable to save this service area.',
        tone: 'error',
      });
    }
  };

  const handleDeleteServiceArea = async (serviceAreaId: number) => {
    try {
      await deleteArea(serviceAreaId);
      await Promise.all([reloadRequests(), reloadServiceAreas()]);
      setInlineMessage({
        text: 'Service area removed successfully.',
        tone: 'success',
      });
    } catch (error) {
      setInlineMessage({
        text:
          error instanceof Error
            ? error.message
            : 'Unable to delete this service area.',
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

            {inlineMessage ? (
              <View style={styles.inlineMessageWrap}>
                <InlineStateMessage message={inlineMessage} />
              </View>
            ) : null}

            <View style={styles.mapCard}>
              <Text style={styles.mapTitle}>Service area and request map</Text>
              <Text style={styles.mapText}>
                `S` markers and blue circles show your saved service locations
                and radii. `N` markers are nearby tenant requests. `A` markers
                are requests already accepted by you.
              </Text>
              <Text style={styles.mapHint}>
                Only requests inside your configured service area and matching
                your selected categories can appear here, and the backend
                validates the same rule again when you accept.
              </Text>

              <View style={styles.legendRow}>
                <LegendChip label="Service Radius" tone="radius" />
                <LegendChip label="Nearby" tone="nearby" />
                <LegendChip label="Accepted" tone="accepted" />
              </View>

              <View style={styles.mapFrame}>
                {allMapMarkers.length > 0 || serviceAreaCircles.length > 0 ? (
                  <OpenStreetMapView
                    circles={serviceAreaCircles}
                    interactive
                    markers={allMapMarkers}
                    region={region}
                  />
                ) : (
                  <View style={styles.emptyMapState}>
                    <Text style={styles.emptyMapStateText}>
                      {requestsLoading || serviceAreasLoading
                        ? 'Loading your provider map...'
                        : requestsErrorMessage || serviceAreasErrorMessage
                          ? requestsErrorMessage ?? serviceAreasErrorMessage ?? ''
                          : 'No service areas or request markers are available yet. Add a provider location below to start matching requests by radius.'}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.summaryRow}>
              <SummaryCard
                subtitle="Saved coverage circles that decide which requests can be approved."
                title={`Service Areas (${effectiveServiceAreas.length})`}
              />
              <SummaryCard
                subtitle="Nearby tenant requests currently inside your service radius."
                title={`Nearby (${nearbyRequests.length})`}
              />
            </View>

            <View style={styles.sectionCard}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>My service areas</Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={handleOpenAddArea}
                  style={({pressed}) => [
                    styles.sectionAction,
                    pressed ? styles.pressed : null,
                  ]}>
                  <Text style={styles.sectionActionText}>Add location</Text>
                </Pressable>
              </View>

              <Text style={styles.sectionText}>
                Add one or more provider locations with a service radius. The
                request list and approval actions use these areas.
              </Text>

              {serviceAreasLoading ? (
                <Text style={styles.stateText}>Loading your service areas...</Text>
              ) : serviceAreasErrorMessage ? (
                <Text style={styles.stateText}>{serviceAreasErrorMessage}</Text>
              ) : effectiveServiceAreas.length === 0 ? (
                <Text style={styles.stateText}>
                  No service areas have been configured yet.
                </Text>
              ) : (
                <View style={styles.areaList}>
                  {effectiveServiceAreas.map(serviceArea => (
                    <ServiceAreaListItem
                      deleting={deletingAreaId === serviceArea.id}
                      key={serviceArea.id}
                      onDelete={() => {
                        void handleDeleteServiceArea(serviceArea.id);
                      }}
                      serviceArea={serviceArea}
                    />
                  ))}
                </View>
              )}
            </View>

            <View style={styles.sectionCard}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Map activity</Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => onTabPress('bookings')}
                  style={({pressed}) => [
                    styles.sectionAction,
                    pressed ? styles.pressed : null,
                  ]}>
                  <Text style={styles.sectionActionText}>Open requests</Text>
                </Pressable>
              </View>

              {requestsLoading ? (
                <Text style={styles.stateText}>Loading request details...</Text>
              ) : requestsErrorMessage ? (
                <Text style={styles.stateText}>{requestsErrorMessage}</Text>
              ) : nearbyRequests.length === 0 && assignedRequests.length === 0 ? (
                <Text style={styles.stateText}>
                  No nearby or accepted requests are available right now.
                </Text>
              ) : (
                <View style={styles.activityList}>
                  {nearbyRequests.slice(0, 3).map(request => (
                    <ActivityItem
                      key={`nearby-${request.id}`}
                      statusLabel="Inside Radius"
                      subtitle={`${request.serviceCategoryName} | ${
                        request.locationText
                      } | ${
                        request.distanceKm === null
                          ? 'Distance pending'
                          : `${request.distanceKm.toFixed(2)} km`
                      }`}
                      title={request.propertyTitle}
                    />
                  ))}
                  {assignedRequests.slice(0, 3).map(request => (
                    <ActivityItem
                      key={`assigned-${request.id}`}
                      statusLabel="Accepted"
                      subtitle={`${request.serviceCategoryName} | ${request.locationText}`}
                      title={request.propertyTitle}
                    />
                  ))}
                </View>
              )}
            </View>
          </View>
        </ScrollView>

        <AddServiceAreaModal
          draft={serviceAreaDraft}
          onChangeDraft={setServiceAreaDraft}
          onClose={handleCloseAddArea}
          onSave={handleSaveServiceArea}
          saving={saving}
          serviceAreaMarkers={serviceAreaCenterMarkers}
          visible={modalVisible}
        />

        <AppBottomNav
          activeTab={activeTab}
          labels={providerTabLabels}
          onTabPress={onTabPress}
        />
      </View>
    </SafeAreaView>
  );
};

const AddServiceAreaModal: React.FC<{
  draft: ServiceAreaDraft;
  onChangeDraft: React.Dispatch<React.SetStateAction<ServiceAreaDraft>>;
  onClose: () => void;
  onSave: () => void;
  saving: boolean;
  serviceAreaMarkers: OpenStreetMapMarker[];
  visible: boolean;
}> = ({
  draft,
  onChangeDraft,
  onClose,
  onSave,
  saving,
  serviceAreaMarkers,
  visible,
}) => {
  const pickerRegion = useMemo<Region>(() => {
    if (draft.coordinate) {
      return {
        latitude: draft.coordinate.latitude,
        latitudeDelta: 0.35,
        longitude: draft.coordinate.longitude,
        longitudeDelta: 0.35,
      };
    }

    const firstServiceMarker = serviceAreaMarkers[0];

    if (firstServiceMarker) {
      return {
        latitude: firstServiceMarker.latitude,
        latitudeDelta: 0.35,
        longitude: firstServiceMarker.longitude,
        longitudeDelta: 0.35,
      };
    }

    return defaultRegion;
  }, [draft.coordinate, serviceAreaMarkers]);

  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="formSheet"
      visible={visible}>
      <SafeAreaView style={styles.modalSafeArea}>
        <View style={styles.modalRoot}>
          <View style={styles.modalHeaderRow}>
            <Text style={styles.modalTitle}>Add provider location</Text>
            <Pressable
              accessibilityRole="button"
              onPress={onClose}
              style={({pressed}) => [
                styles.modalCloseButton,
                pressed ? styles.pressed : null,
              ]}>
              <Text style={styles.modalCloseButtonText}>Close</Text>
            </Pressable>
          </View>

          <Text style={styles.modalText}>
            Tap the map to save the provider location, then set the service
            radius in kilometers.
          </Text>

          <View style={styles.modalMapFrame}>
            <OpenStreetMapView
              initialSelectedCoordinate={draft.coordinate}
              interactive
              markers={serviceAreaMarkers}
              onMapPress={coordinate =>
                onChangeDraft(current => ({...current, coordinate}))
              }
              region={pickerRegion}
            />
          </View>

          <Text style={styles.coordinateText}>
            {formatCoordinateLabel(draft.coordinate)}
          </Text>

          <ScrollView
            contentContainerStyle={styles.modalFormContent}
            keyboardShouldPersistTaps="handled">
            <View style={styles.fieldWrap}>
              <Text style={styles.fieldLabel}>Country</Text>
              <TextInput
                onChangeText={value =>
                  onChangeDraft(current => ({...current, country: value}))
                }
                placeholder="Sri Lanka"
                placeholderTextColor="#A39B92"
                style={styles.fieldInput}
                value={draft.country}
              />
            </View>

            <View style={styles.fieldWrap}>
              <Text style={styles.fieldLabel}>City</Text>
              <TextInput
                onChangeText={value =>
                  onChangeDraft(current => ({...current, city: value}))
                }
                placeholder="Colombo"
                placeholderTextColor="#A39B92"
                style={styles.fieldInput}
                value={draft.city}
              />
            </View>

            <View style={styles.fieldWrap}>
              <Text style={styles.fieldLabel}>Radius (km)</Text>
              <TextInput
                keyboardType="decimal-pad"
                onChangeText={value =>
                  onChangeDraft(current => ({...current, areaRadiusKm: value}))
                }
                placeholder="10"
                placeholderTextColor="#A39B92"
                style={styles.fieldInput}
                value={draft.areaRadiusKm}
              />
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <Pressable
              accessibilityRole="button"
              onPress={onClose}
              style={({pressed}) => [
                styles.modalSecondaryButton,
                pressed ? styles.pressed : null,
              ]}>
              <Text style={styles.modalSecondaryButtonText}>Cancel</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={onSave}
              style={({pressed}) => [
                styles.modalPrimaryButton,
                saving ? styles.modalPrimaryButtonDisabled : null,
                pressed ? styles.pressed : null,
              ]}>
              <Text style={styles.modalPrimaryButtonText}>
                {saving ? 'Saving...' : 'Save Area'}
              </Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const LegendChip: React.FC<LegendChipProps> = ({label, tone}) => {
  return (
    <View
      style={[
        styles.legendChip,
        tone === 'accepted'
          ? styles.legendChipAccepted
          : tone === 'radius'
            ? styles.legendChipRadius
            : null,
      ]}>
      <Text style={styles.legendChipText}>{label}</Text>
    </View>
  );
};

const SummaryCard: React.FC<SummaryCardProps> = ({subtitle, title}) => {
  return (
    <View style={styles.summaryCard}>
      <Text style={styles.summaryCardTitle}>{title}</Text>
      <Text style={styles.summaryCardSubtitle}>{subtitle}</Text>
    </View>
  );
};

const ActivityItem: React.FC<ActivityItemProps> = ({
  statusLabel,
  subtitle,
  title,
}) => {
  return (
    <View style={styles.activityItem}>
      <View style={styles.activityBadge}>
        <Text style={styles.activityBadgeText}>{statusLabel}</Text>
      </View>
      <View style={styles.activityTextWrap}>
        <Text numberOfLines={1} style={styles.activityTitle}>
          {title}
        </Text>
        <Text numberOfLines={2} style={styles.activitySubtitle}>
          {subtitle}
        </Text>
      </View>
    </View>
  );
};

const ServiceAreaListItem: React.FC<ServiceAreaListItemProps> = ({
  deleting,
  onDelete,
  serviceArea,
}) => {
  return (
    <View style={styles.areaItem}>
      <View style={styles.areaTextWrap}>
        <Text style={styles.areaTitle}>
          {`${serviceArea.city}, ${serviceArea.country}`}
        </Text>
        <Text style={styles.areaSubtitle}>
          {formatRadiusLabel(serviceArea.areaRadiusKm)}
        </Text>
        <Text style={styles.areaSubtitle}>
          {serviceArea.latitude === null || serviceArea.longitude === null
            ? 'Coordinates pending'
            : `${serviceArea.latitude.toFixed(5)}, ${serviceArea.longitude.toFixed(
                5,
              )}`}
        </Text>
      </View>

      <Pressable
        accessibilityRole="button"
        disabled={deleting}
        onPress={onDelete}
        style={({pressed}) => [
          styles.deleteAreaButton,
          deleting ? styles.deleteAreaButtonDisabled : null,
          pressed ? styles.pressed : null,
        ]}>
        <Text style={styles.deleteAreaButtonText}>
          {deleting ? 'Removing...' : 'Delete'}
        </Text>
      </Pressable>
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
  inlineMessageWrap: {
    marginBottom: spacing.md,
  },
  mapCard: {
    borderRadius: 18,
    backgroundColor: colors.white,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#E5DCD2',
    marginBottom: spacing.md,
  },
  mapTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 18,
    marginBottom: 6,
  },
  mapText: {
    color: '#5D554D',
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 6,
  },
  mapHint: {
    color: colors.primary,
    fontFamily: fonts.medium,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: spacing.sm,
  },
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  legendChip: {
    borderRadius: radii.pill,
    backgroundColor: '#F7E3BF',
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
  },
  legendChipAccepted: {
    backgroundColor: '#DCEDE7',
  },
  legendChipRadius: {
    backgroundColor: '#E3F0FF',
  },
  legendChipText: {
    color: colors.textPrimary,
    fontFamily: fonts.medium,
    fontSize: 12,
  },
  mapFrame: {
    height: 330,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#D7E6E8',
  },
  emptyMapState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  emptyMapStateText: {
    color: colors.textSecondary,
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: '#FFF7EC',
    borderWidth: 1,
    borderColor: '#E9D8BF',
    padding: spacing.md,
  },
  summaryCardTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 16,
    marginBottom: 4,
  },
  summaryCardSubtitle: {
    color: '#615951',
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 18,
  },
  sectionCard: {
    borderRadius: 18,
    backgroundColor: '#FCF4E9',
    borderWidth: 1,
    borderColor: '#E9D8BF',
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 18,
  },
  sectionText: {
    color: '#5D554D',
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: spacing.sm,
  },
  sectionAction: {
    minHeight: 32,
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  sectionActionText: {
    color: colors.white,
    fontFamily: fonts.medium,
    fontSize: 12,
  },
  stateText: {
    color: colors.textSecondary,
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 20,
  },
  areaList: {
    gap: spacing.sm,
  },
  areaItem: {
    borderRadius: 12,
    backgroundColor: colors.white,
    padding: spacing.sm + 2,
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  areaTextWrap: {
    flex: 1,
  },
  areaTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 14,
    marginBottom: 2,
  },
  areaSubtitle: {
    color: '#615951',
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 18,
  },
  deleteAreaButton: {
    minHeight: 32,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: '#E2D3C5',
    backgroundColor: '#F7F1E9',
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteAreaButtonDisabled: {
    opacity: 0.8,
  },
  deleteAreaButtonText: {
    color: colors.textPrimary,
    fontFamily: fonts.medium,
    fontSize: 12,
  },
  activityList: {
    gap: spacing.sm,
  },
  activityItem: {
    borderRadius: 12,
    backgroundColor: colors.white,
    padding: spacing.sm + 2,
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  activityBadge: {
    borderRadius: radii.pill,
    backgroundColor: '#F4AE2B',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 5,
  },
  activityBadgeText: {
    color: colors.white,
    fontFamily: fonts.medium,
    fontSize: 11,
  },
  activityTextWrap: {
    flex: 1,
  },
  activityTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 14,
    marginBottom: 2,
  },
  activitySubtitle: {
    color: '#5C554D',
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 18,
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
    marginBottom: spacing.sm,
  },
  modalTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 18,
  },
  modalCloseButton: {
    minHeight: 32,
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
  modalText: {
    color: '#5A534D',
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: spacing.sm,
  },
  modalMapFrame: {
    height: 250,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#D7E6E8',
    marginBottom: spacing.sm,
  },
  coordinateText: {
    color: colors.primary,
    fontFamily: fonts.medium,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: spacing.md,
  },
  modalFormContent: {
    paddingBottom: spacing.md,
  },
  fieldWrap: {
    marginBottom: spacing.sm,
  },
  fieldLabel: {
    color: colors.textPrimary,
    fontFamily: fonts.medium,
    fontSize: 13,
    marginBottom: 6,
  },
  fieldInput: {
    minHeight: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DDD2C5',
    backgroundColor: '#FBF8F4',
    paddingHorizontal: spacing.md,
    color: colors.textPrimary,
    fontFamily: fonts.regular,
    fontSize: 15,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: 'auto',
  },
  modalSecondaryButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DDD2C5',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FBF8F4',
  },
  modalSecondaryButtonText: {
    color: colors.textPrimary,
    fontFamily: fonts.medium,
    fontSize: 14,
  },
  modalPrimaryButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  modalPrimaryButtonDisabled: {
    opacity: 0.8,
  },
  modalPrimaryButtonText: {
    color: colors.white,
    fontFamily: fonts.bold,
    fontSize: 14,
  },
  pressed: {
    opacity: 0.84,
  },
});
