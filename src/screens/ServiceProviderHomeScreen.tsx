import React, {useEffect, useMemo, useState} from 'react';
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
import HeroBackground from '../assets/images/Untitled design (3) 1.svg';
import {AppBottomNav, AppTab} from '../components/AppBottomNav';
import {HeaderProfileSwitcher} from '../components/HeaderProfileSwitcher';
import {InlineStateMessage} from '../components/InlineStateMessage';
import {InlineMessage} from '../hooks/useLoginScreen';
import {useHomeScreen} from '../hooks/useHomeScreen';
import {useProviderCategories} from '../hooks/useProviderCategories';
import {useProviderServiceAreas} from '../hooks/useProviderServiceAreas';
import {useProviderServiceRequests} from '../hooks/useProviderServiceRequests';
import {useResponsive} from '../hooks/useResponsive';
import {useServiceCategories} from '../hooks/useServiceCategories';
import {colors, fonts, radii, spacing} from '../theme';
import {
  formatBookingRange,
  formatBookingStatusLabel,
} from '../utils/bookingPresentation';

type ServiceProviderHomeScreenProps = {
  activeTab: AppTab;
  onTabPress: (tab: AppTab) => void;
};

type RequestItemProps = {
  onPress: () => void;
  subtitle: string;
  title: string;
};

const providerTabLabels: Partial<Record<AppTab, string>> = {
  bookings: 'Requests',
  dashboard: 'Home',
  properties: 'Map',
};

export const ServiceProviderHomeScreen: React.FC<
  ServiceProviderHomeScreenProps
> = ({activeTab, onTabPress}) => {
  const responsive = useResponsive();
  const home = useHomeScreen();
  const compactLayout = responsive.isSmallPhone;
  const veryCompactLayout = responsive.isVerySmallPhone;
  const topInset =
    Platform.OS === 'android'
      ? (StatusBar.currentHeight ?? 0) + spacing.sm
      : spacing.md;
  const {
    categories: availableCategories,
    errorMessage: availableCategoriesErrorMessage,
    loading: availableCategoriesLoading,
  } = useServiceCategories();
  const {
    categories: providerCategories,
    errorMessage: providerCategoriesErrorMessage,
    loading: providerCategoriesLoading,
    saveCategoryIds,
    saving: providerCategoriesSaving,
  } = useProviderCategories();
  const {
    assignedRequests,
    errorMessage: requestsErrorMessage,
    loading: requestsLoading,
    nearbyRequests,
  } = useProviderServiceRequests({limit: 50});
  const {
    errorMessage: serviceAreasErrorMessage,
    loading: serviceAreasLoading,
    serviceAreas,
  } = useProviderServiceAreas();
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [inlineMessage, setInlineMessage] = useState<InlineMessage | null>(null);

  useEffect(() => {
    setSelectedCategoryIds(providerCategories.map(category => category.id));
  }, [providerCategories]);

  const selectedCategoryNames = useMemo(
    () =>
      availableCategories
        .filter(category => selectedCategoryIds.includes(category.id))
        .map(category => category.name),
    [availableCategories, selectedCategoryIds],
  );

  const handleToggleCategory = (categoryId: number) => {
    setSelectedCategoryIds(current =>
      current.includes(categoryId)
        ? current.filter(id => id !== categoryId)
        : [...current, categoryId],
    );
    setInlineMessage(null);
  };

  const handleSaveCategories = async () => {
    try {
      const updatedCategories = await saveCategoryIds(selectedCategoryIds);
      const nextCategoryNames = updatedCategories.map(category => category.name);

      setInlineMessage({
        text:
          nextCategoryNames.length > 0
            ? `Saved categories: ${nextCategoryNames.join(', ')}.`
            : 'Your provider categories were cleared successfully.',
        tone: 'success',
      });
    } catch (error) {
      setInlineMessage({
        text:
          error instanceof Error
            ? error.message
            : 'Unable to save your provider categories.',
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

              <HeaderProfileSwitcher />
            </View>

            <View style={styles.heroCard}>
              <HeroBackground
                height="100%"
                preserveAspectRatio="xMidYMid slice"
                style={styles.heroImage}
                width="100%"
              />
              <View style={styles.heroOverlay} />

              <View
                style={[
                  styles.heroContent,
                  compactLayout ? styles.heroContentCompact : null,
                ]}>
                <View style={styles.heroTextBlock}>
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.heroGreeting,
                      compactLayout ? styles.heroGreetingCompact : null,
                    ]}>{`Hello, ${home.userName}.`}</Text>
                  <Text
                    style={[
                      styles.heroTitle,
                      compactLayout ? styles.heroTitleCompact : null,
                    ]}>
                    Service Provider Dashboard
                  </Text>
                  <Text
                    style={[
                      styles.heroSubtitle,
                      compactLayout ? styles.heroSubtitleCompact : null,
                    ]}>
                    Manage the services you offer and review nearby tenant
                    requests.
                  </Text>
                </View>

                <View style={styles.heroBottomBlock}>
                  <View
                    style={[
                      styles.heroStatsRow,
                      compactLayout ? styles.heroStatsRowCompact : null,
                    ]}>
                    <StatTile
                      compact={compactLayout}
                      label="Nearby"
                      value={requestsLoading ? '...' : String(nearbyRequests.length)}
                    />
                    <StatTile
                      compact={compactLayout}
                      label="Service Areas"
                      value={
                        serviceAreasLoading ? '...' : String(serviceAreas.length)
                      }
                    />
                    <StatTile
                      compact={compactLayout}
                      label="Accepted"
                      value={
                        requestsLoading ? '...' : String(assignedRequests.length)
                      }
                    />
                  </View>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => onTabPress('properties')}
                    style={[
                      styles.heroButton,
                      compactLayout ? styles.heroButtonCompact : null,
                    ]}>
                    <Text
                      style={[
                        styles.heroButtonText,
                        compactLayout ? styles.heroButtonTextCompact : null,
                      ]}>
                      Open Radius Map
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>

            {inlineMessage ? (
              <View style={styles.inlineMessageWrap}>
                <InlineStateMessage message={inlineMessage} />
              </View>
            ) : null}

            <View style={styles.sectionCard}>
              <View
                style={[
                  styles.sectionHeaderRow,
                  veryCompactLayout ? styles.sectionHeaderRowStacked : null,
                ]}>
                <Text style={styles.sectionTitle}>Service radius</Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => onTabPress('properties')}
                  style={({pressed}) => [
                    styles.secondaryButton,
                    veryCompactLayout ? styles.secondaryButtonStacked : null,
                    pressed ? styles.pressed : null,
                  ]}>
                  <Text style={styles.secondaryButtonText}>Manage on map</Text>
                </Pressable>
              </View>
              <Text style={styles.sectionText}>
                Nearby requests only appear when they fall inside one of your
                saved service-area circles.
              </Text>

              {serviceAreasLoading ? (
                <Text style={styles.stateText}>Loading your service areas...</Text>
              ) : serviceAreasErrorMessage ? (
                <Text style={styles.stateText}>{serviceAreasErrorMessage}</Text>
              ) : serviceAreas.length === 0 ? (
                <Text style={styles.stateText}>
                  No provider location has been added yet. Open the map and add
                  a service area to start matching requests by radius.
                </Text>
              ) : (
                <Text style={styles.selectedText}>
                  {serviceAreas
                    .map(
                      serviceArea =>
                        `${serviceArea.city} (${serviceArea.areaRadiusKm?.toFixed(1) ?? '0'} km)`,
                    )
                    .join(', ')}
                </Text>
              )}
            </View>

            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Service categories</Text>
              <Text style={styles.sectionText}>
                Pick the services you can handle. Only matching tenant requests
                will be shown to you.
              </Text>

              {availableCategoriesLoading || providerCategoriesLoading ? (
                <Text style={styles.stateText}>Loading service categories...</Text>
              ) : availableCategoriesErrorMessage ? (
                <Text style={styles.stateText}>
                  {availableCategoriesErrorMessage}
                </Text>
              ) : providerCategoriesErrorMessage ? (
                <Text style={styles.stateText}>
                  {providerCategoriesErrorMessage}
                </Text>
              ) : availableCategories.length === 0 ? (
                <Text style={styles.stateText}>
                  No active service categories were returned by the backend.
                </Text>
              ) : (
                <>
                  <View style={styles.chipWrap}>
                    {availableCategories.map(category => {
                      const selected = selectedCategoryIds.includes(category.id);

                      return (
                        <Pressable
                          accessibilityRole="button"
                          key={category.id}
                          onPress={() => handleToggleCategory(category.id)}
                          style={({pressed}) => [
                            styles.categoryChip,
                            selected ? styles.categoryChipSelected : null,
                            pressed ? styles.pressed : null,
                          ]}>
                          <Text
                            style={[
                              styles.categoryChipText,
                              selected ? styles.categoryChipTextSelected : null,
                            ]}>
                            {category.name}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>

                  <Text style={styles.selectedText}>
                    {selectedCategoryNames.length > 0
                      ? `Selected: ${selectedCategoryNames.join(', ')}`
                      : 'No categories selected yet.'}
                  </Text>
                </>
              )}

              <Pressable
                accessibilityRole="button"
                disabled={providerCategoriesSaving}
                onPress={() => {
                  void handleSaveCategories();
                }}
                style={[
                  styles.primaryButton,
                  providerCategoriesSaving ? styles.primaryButtonDisabled : null,
                ]}>
                <Text style={styles.primaryButtonText}>
                  {providerCategoriesSaving ? 'Saving...' : 'Save Categories'}
                </Text>
              </Pressable>
            </View>

            <View style={styles.sectionCard}>
              <View
                style={[
                  styles.sectionHeaderRow,
                  veryCompactLayout ? styles.sectionHeaderRowStacked : null,
                ]}>
                <Text style={styles.sectionTitle}>Nearby requests</Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => onTabPress('bookings')}
                  style={({pressed}) => [
                    styles.secondaryButton,
                    veryCompactLayout ? styles.secondaryButtonStacked : null,
                    pressed ? styles.pressed : null,
                  ]}>
                  <Text style={styles.secondaryButtonText}>Review all</Text>
                </Pressable>
              </View>

              {requestsLoading ? (
                <Text style={styles.stateText}>Loading nearby requests...</Text>
              ) : requestsErrorMessage ? (
                <Text style={styles.stateText}>{requestsErrorMessage}</Text>
              ) : nearbyRequests.length === 0 ? (
                <Text style={styles.stateText}>
                  No nearby requests matched your current categories and service
                  area.
                </Text>
              ) : (
                <View style={styles.requestList}>
                  {nearbyRequests.slice(0, 3).map(request => (
                    <RequestItem
                      key={request.id}
                      onPress={() => onTabPress('bookings')}
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
                </View>
              )}
            </View>

            <View style={styles.sectionCard}>
              <View
                style={[
                  styles.sectionHeaderRow,
                  veryCompactLayout ? styles.sectionHeaderRowStacked : null,
                ]}>
                <Text style={styles.sectionTitle}>Accepted requests</Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => onTabPress('bookings')}
                  style={({pressed}) => [
                    styles.secondaryButton,
                    veryCompactLayout ? styles.secondaryButtonStacked : null,
                    pressed ? styles.pressed : null,
                  ]}>
                  <Text style={styles.secondaryButtonText}>Open requests</Text>
                </Pressable>
              </View>

              {requestsLoading ? (
                <Text style={styles.stateText}>Loading accepted requests...</Text>
              ) : requestsErrorMessage ? (
                <Text style={styles.stateText}>{requestsErrorMessage}</Text>
              ) : assignedRequests.length === 0 ? (
                <Text style={styles.stateText}>
                  Accepted requests will appear here after you accept a tenant
                  request.
                </Text>
              ) : (
                <View style={styles.requestList}>
                  {assignedRequests.slice(0, 3).map(request => (
                    <RequestItem
                      key={request.id}
                      onPress={() => onTabPress('bookings')}
                      subtitle={`${formatBookingStatusLabel(
                        request.requestStatus,
                      )} | ${formatBookingRange(
                        request.checkIn,
                        request.checkOut,
                      )}`}
                      title={`${request.propertyTitle} | ${request.serviceCategoryName}`}
                    />
                  ))}
                </View>
              )}
            </View>
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

type StatTileProps = {
  compact?: boolean;
  label: string;
  value: string;
};

const StatTile: React.FC<StatTileProps> = ({compact = false, label, value}) => {
  return (
    <View style={[styles.statTile, compact ? styles.statTileCompact : null]}>
      <Text
        adjustsFontSizeToFit
        minimumFontScale={0.85}
        numberOfLines={1}
        style={[styles.statValue, compact ? styles.statValueCompact : null]}>
        {value}
      </Text>
      <Text
        numberOfLines={2}
        style={[styles.statLabel, compact ? styles.statLabelCompact : null]}>
        {label}
      </Text>
    </View>
  );
};

const RequestItem: React.FC<RequestItemProps> = ({onPress, subtitle, title}) => {
  return (
    <View style={styles.requestItem}>
      <View style={styles.requestTextWrap}>
        <Text numberOfLines={1} style={styles.requestTitle}>
          {title}
        </Text>
        <Text numberOfLines={2} style={styles.requestSubtitle}>
          {subtitle}
        </Text>
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={({pressed}) => [
          styles.requestAction,
          pressed ? styles.pressed : null,
        ]}>
        <Text style={styles.requestActionText}>Open</Text>
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
  heroCard: {
    minHeight: 292,
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(18, 17, 15, 0.42)',
  },
  heroContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  heroContentCompact: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  heroTextBlock: {
    width: '100%',
    alignItems: 'center',
  },
  heroBottomBlock: {
    width: '100%',
  },
  heroGreeting: {
    color: colors.white,
    fontFamily: fonts.heavy,
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 4,
  },
  heroGreetingCompact: {
    fontSize: 21,
  },
  heroTitle: {
    color: colors.white,
    fontFamily: fonts.bold,
    fontSize: 20,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  heroTitleCompact: {
    fontSize: 17,
    lineHeight: 23,
  },
  heroSubtitle: {
    color: '#F6F2EB',
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    maxWidth: 260,
  },
  heroSubtitleCompact: {
    fontSize: 12,
    lineHeight: 17,
    maxWidth: 240,
  },
  heroStatsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    width: '100%',
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  heroStatsRowCompact: {
    gap: spacing.xs,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  statTile: {
    flex: 1,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    minHeight: 74,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statTileCompact: {
    minHeight: 68,
    paddingVertical: spacing.sm,
  },
  statValue: {
    color: colors.white,
    fontFamily: fonts.heavy,
    fontSize: 22,
    marginBottom: 2,
  },
  statValueCompact: {
    fontSize: 20,
  },
  statLabel: {
    color: '#E6EDE8',
    fontFamily: fonts.medium,
    fontSize: 12,
    lineHeight: 15,
    textAlign: 'center',
  },
  statLabelCompact: {
    fontSize: 11,
    lineHeight: 14,
  },
  heroButton: {
    minHeight: 52,
    width: '100%',
    borderRadius: radii.md,
    backgroundColor: '#FFF2DF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroButtonCompact: {
    minHeight: 48,
  },
  heroButtonText: {
    color: colors.primary,
    fontFamily: fonts.heavy,
    fontSize: 16,
  },
  heroButtonTextCompact: {
    fontSize: 15,
  },
  inlineMessageWrap: {
    marginBottom: spacing.md,
  },
  sectionCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E3D7C7',
    backgroundColor: '#FFF9F2',
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.sm,
    flexWrap: 'wrap',
  },
  sectionHeaderRowStacked: {
    alignItems: 'flex-start',
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 17,
    marginBottom: spacing.xs,
  },
  sectionText: {
    color: '#5A534D',
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: spacing.sm,
  },
  stateText: {
    color: colors.textSecondary,
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 20,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  categoryChip: {
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: '#D9CEC0',
    backgroundColor: colors.white,
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: 8,
  },
  categoryChipSelected: {
    borderColor: colors.primary,
    backgroundColor: '#EEF6F2',
  },
  categoryChipText: {
    color: colors.textPrimary,
    fontFamily: fonts.regular,
    fontSize: 12,
  },
  categoryChipTextSelected: {
    color: colors.primary,
    fontFamily: fonts.medium,
  },
  selectedText: {
    color: '#6B635B',
    fontFamily: fonts.medium,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: spacing.sm,
  },
  primaryButton: {
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonDisabled: {
    opacity: 0.8,
  },
  primaryButtonText: {
    color: colors.white,
    fontFamily: fonts.bold,
    fontSize: 15,
  },
  secondaryButton: {
    minHeight: 32,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: '#E0D4C6',
    backgroundColor: '#FFF4E6',
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonStacked: {
    alignSelf: 'flex-start',
  },
  secondaryButtonText: {
    color: colors.primary,
    fontFamily: fonts.medium,
    fontSize: 12,
  },
  requestList: {
    gap: spacing.sm,
  },
  requestItem: {
    borderRadius: 12,
    backgroundColor: '#F4EADF',
    padding: spacing.sm + 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  requestTextWrap: {
    flex: 1,
  },
  requestTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 14,
    marginBottom: 2,
  },
  requestSubtitle: {
    color: '#5D564F',
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 18,
  },
  requestAction: {
    minHeight: 30,
    borderRadius: radii.pill,
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  requestActionText: {
    color: colors.white,
    fontFamily: fonts.medium,
    fontSize: 12,
  },
  pressed: {
    opacity: 0.84,
  },
});
