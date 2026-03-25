import React from 'react';
import {
  DimensionValue,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {AppBottomNav, AppTab} from '../components/AppBottomNav';
import {useHomeScreen} from '../hooks/useHomeScreen';
import {useResponsive} from '../hooks/useResponsive';
import {colors, fonts, radii, spacing} from '../theme';
import MenuIcon from '../assets/images/menu 1.svg';
import ProfilePic from '../assets/images/profile_pic.svg';
import PlayIcon from '../assets/images/20 1.svg';
import MapImage from '../assets/images/Map.svg';
import PlusButton from '../assets/images/Button_ plus.svg';
import MinusButton from '../assets/images/Button_ minus.svg';

type OwnerPropertiesScreenProps = {
  activeTab: AppTab;
  onAddNewPropertyPress: () => void;
  onTabPress: (tab: AppTab) => void;
};

type OwnerProperty = {
  id: string;
  code: string;
  title: string;
};

type MapMarker = {
  id: string;
  label: string;
  left: DimensionValue;
  top: DimensionValue;
};

const ownerProperties: OwnerProperty[] = [
  {id: 'property-1', title: 'Colombo Lux House', code: '#PRO001'},
  {id: 'property-2', title: 'Colombo Lux House', code: '#PRO002'},
  {id: 'property-3', title: 'Colombo Lux House', code: '#PRO003'},
  {id: 'property-4', title: 'Colombo Lux House', code: '#PRO004'},
];

const mapMarkers: MapMarker[] = [
  {id: 'marker-04', label: '04', left: '42%', top: '28%'},
  {id: 'marker-03', label: '03', left: '47%', top: '56%'},
  {id: 'marker-02', label: '02', left: '71%', top: '47%'},
  {id: 'marker-01', label: '1', left: '86%', top: '71%'},
];

export const OwnerPropertiesScreen: React.FC<OwnerPropertiesScreenProps> = ({
  activeTab,
  onAddNewPropertyPress,
  onTabPress,
}) => {
  const responsive = useResponsive();
  const home = useHomeScreen();
  const topInset = Platform.OS === 'android' ? spacing.xs : spacing.md;

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

            <Pressable
              accessibilityRole="button"
              onPress={onAddNewPropertyPress}
              style={styles.addButton}>
              <Text style={styles.addButtonText}>ADD NEW PROPERTY</Text>
            </Pressable>

            <View style={styles.mapCard}>
              <View
                style={[
                  styles.mapImageWrap,
                  {height: responsive.isTablet ? 320 : 246},
                ]}>
                <MapImage
                  height="100%"
                  preserveAspectRatio="xMidYMid slice"
                  style={styles.mapImage}
                  width="100%"
                />

                {mapMarkers.map(marker => (
                  <View
                    key={marker.id}
                    style={[
                      styles.mapMarker,
                      {left: marker.left, top: marker.top},
                    ]}>
                    <Text style={styles.mapMarkerText}>{marker.label}</Text>
                  </View>
                ))}

                <View style={styles.mapControls}>
                  <Pressable accessibilityRole="button" style={styles.mapControlButton}>
                    <PlusButton height={40} width={37} />
                  </Pressable>
                  <Pressable accessibilityRole="button" style={styles.mapControlButton}>
                    <MinusButton height={40} width={37} />
                  </Pressable>
                </View>
              </View>
            </View>

            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>My Properties</Text>

              <View style={styles.propertyList}>
                {ownerProperties.map(property => (
                  <OwnerPropertyCard
                    key={property.id}
                    code={property.code}
                    onPress={() => onTabPress('properties')}
                    title={property.title}
                  />
                ))}
              </View>
            </View>
          </View>
        </ScrollView>

        <AppBottomNav activeTab={activeTab} onTabPress={onTabPress} />
      </View>
    </SafeAreaView>
  );
};

type OwnerPropertyCardProps = {
  code: string;
  onPress: () => void;
  title: string;
};

const OwnerPropertyCard: React.FC<OwnerPropertyCardProps> = ({
  code,
  onPress,
  title,
}) => {
  return (
    <View style={styles.propertyCard}>
      <View style={styles.propertyTextWrap}>
        <Text numberOfLines={1} style={styles.propertyTitle}>
          {title}
        </Text>
        <Text style={styles.propertyCode}>{code}</Text>
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={({pressed}) => [
          styles.viewButton,
          pressed ? styles.pressed : null,
        ]}>
        <Text style={styles.viewButtonText}>View</Text>
        <View style={styles.playIconCircle}>
          <View style={styles.playIconGlyphWrap}>
            <PlayIcon height={10} style={styles.playIconRight} width={10} />
          </View>
        </View>
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
  addButton: {
    minHeight: 56,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  addButtonText: {
    color: colors.white,
    fontFamily: fonts.semibold,
    fontSize: 14,
    letterSpacing: 0.4,
  },
  mapCard: {
    backgroundColor: '#FCF4E9',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5D4BF',
    padding: spacing.sm + 2,
    marginBottom: spacing.sm,
  },
  mapImageWrap: {
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  mapImage: {
    ...StyleSheet.absoluteFillObject,
  },
  mapControls: {
    position: 'absolute',
    right: spacing.md,
    top: spacing.md,
    gap: spacing.sm,
  },
  mapControlButton: {
    borderRadius: 10,
  },
  mapMarker: {
    position: 'absolute',
    width: 54,
    height: 54,
    marginLeft: -27,
    marginTop: -27,
    borderRadius: 27,
    borderWidth: 6,
    borderColor: colors.primary,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapMarkerText: {
    color: colors.textPrimary,
    fontFamily: fonts.semibold,
    fontSize: 16,
  },
  sectionCard: {
    backgroundColor: '#FCF4E9',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5D4BF',
    padding: spacing.md,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.medium,
    fontSize: 18,
    marginBottom: spacing.md,
  },
  propertyList: {
    gap: spacing.sm,
  },
  propertyCard: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm + 4,
    gap: spacing.sm,
  },
  propertyTextWrap: {
    flex: 1,
  },
  propertyTitle: {
    color: colors.white,
    fontFamily: fonts.bold,
    fontSize: 14,
    marginBottom: 2,
  },
  propertyCode: {
    color: '#E3E9E6',
    fontFamily: fonts.regular,
    fontSize: 12,
  },
  viewButton: {
    minHeight: 28,
    borderRadius: radii.pill,
    backgroundColor: colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingLeft: spacing.sm + 4,
    paddingRight: spacing.sm,
  },
  viewButtonText: {
    color: colors.white,
    fontFamily: fonts.medium,
    fontSize: 12,
  },
  playIconCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIconGlyphWrap: {
    width: 10,
    height: 10,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  playIconRight: {
    transform: [{rotate: '-90deg'}],
    marginLeft: 1,
  },
  pressed: {
    opacity: 0.86,
  },
});
