import React, {useMemo} from 'react';
import {
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import MapView, {Marker, Region} from 'react-native-maps';
import {OpenStreetMapView} from './OpenStreetMapView';
import MapMarkerIcon from '../assets/images/mdi_map-marker.svg';
import {colors, fonts, radii, spacing} from '../theme';

type PropertyMapCardProps = {
  latitude?: number;
  longitude?: number;
  title: string;
  locationLabel: string;
};

type Coordinate = {
  latitude: number;
  longitude: number;
};

const getRegion = (coordinate: Coordinate): Region => ({
  ...coordinate,
  latitudeDelta: 0.018,
  longitudeDelta: 0.018,
});

export const PropertyMapCard: React.FC<PropertyMapCardProps> = ({
  latitude,
  longitude,
  title,
  locationLabel,
}) => {
  const addressText = locationLabel.trim() || 'No saved location yet.';
  const coordinate = useMemo(
    () => {
      if (
        typeof latitude !== 'number' ||
        typeof longitude !== 'number' ||
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude)
      ) {
        return null;
      }

      return {latitude, longitude};
    },
    [latitude, longitude],
  );
  const region = useMemo(
    () => (coordinate ? getRegion(coordinate) : null),
    [coordinate],
  );

  const handleDirectionsPress = async () => {
    if (!coordinate) {
      return;
    }

    const query = encodeURIComponent(
      `${coordinate.latitude},${coordinate.longitude}`,
    );
    const url = `https://www.google.com/maps/search/?api=1&query=${query}`;

    try {
      await Linking.openURL(url);
    } catch (error) {
      console.warn('Unable to open maps:', error);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.sectionLabel}>LOCATION</Text>
          <Text style={styles.sectionTitle}>Live map preview</Text>
        </View>

        <Pressable
          accessibilityRole="button"
          disabled={!coordinate}
          onPress={handleDirectionsPress}
          style={({pressed}) => [
            styles.directionButton,
            !coordinate ? styles.directionButtonDisabled : null,
            pressed && coordinate ? styles.directionButtonPressed : null,
          ]}>
          <Text
            style={[
              styles.directionButtonText,
              !coordinate ? styles.directionButtonTextDisabled : null,
            ]}>
            Directions
          </Text>
        </Pressable>
      </View>

      <View style={styles.mapCard}>
        {coordinate && region ? (
          Platform.OS === 'android' ? (
            <OpenStreetMapView
              markers={[
                {
                  description: addressText,
                  highlighted: true,
                  latitude: coordinate.latitude,
                  longitude: coordinate.longitude,
                  title,
                },
              ]}
              interactive={false}
              region={region}
            />
          ) : (
            <MapView
              initialRegion={region}
              pitchEnabled={false}
              rotateEnabled={false}
              scrollEnabled={false}
              style={styles.map}
              toolbarEnabled={false}
              zoomEnabled={false}>
              <Marker
                coordinate={coordinate}
                description={addressText}
                pinColor={colors.accent}
                title={title}
              />
            </MapView>
          )
        ) : (
          <View style={styles.mapUnavailable}>
            <Text style={styles.mapUnavailableText}>
              Location coordinates are not available for this property yet.
            </Text>
          </View>
        )}

        {Platform.OS === 'android' && coordinate ? (
          <View style={styles.attributionBadge}>
            <Text style={styles.attributionText}>Map data OpenStreetMap</Text>
          </View>
        ) : null}

        <View style={styles.mapBadge}>
          <MapMarkerIcon height={16} width={16} />
          <Text numberOfLines={1} style={styles.mapBadgeText}>
            {addressText}
          </Text>
        </View>
      </View>

      <View style={styles.addressRow}>
        <MapMarkerIcon height={18} width={18} />
        <View style={styles.addressTextWrap}>
          <Text style={styles.addressTitle}>{title}</Text>
          <Text style={styles.addressText}>{addressText}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  sectionLabel: {
    color: '#A9A096',
    fontFamily: fonts.medium,
    fontSize: 12,
    letterSpacing: 0.8,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 18,
    marginTop: 4,
  },
  directionButton: {
    minHeight: 38,
    borderRadius: radii.pill,
    backgroundColor: '#F5EFE5',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  directionButtonDisabled: {
    backgroundColor: '#EEE6DA',
  },
  directionButtonPressed: {
    opacity: 0.85,
  },
  directionButtonText: {
    color: colors.primary,
    fontFamily: fonts.semibold,
    fontSize: 13,
  },
  directionButtonTextDisabled: {
    color: '#A89D90',
  },
  mapCard: {
    height: 220,
    borderRadius: radii.lg,
    overflow: 'hidden',
    backgroundColor: '#ECE5DB',
    borderWidth: 1,
    borderColor: '#E7DDCF',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  mapUnavailable: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  mapUnavailableText: {
    color: colors.textSecondary,
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },
  attributionBadge: {
    position: 'absolute',
    left: spacing.md,
    top: spacing.md,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(25, 21, 19, 0.62)',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 6,
  },
  attributionText: {
    color: colors.white,
    fontFamily: fonts.medium,
    fontSize: 10,
    lineHeight: 12,
  },
  mapBadge: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    bottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(25, 21, 19, 0.78)',
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
  },
  mapBadgeText: {
    color: colors.white,
    fontFamily: fonts.medium,
    fontSize: 13,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  addressTextWrap: {
    flex: 1,
  },
  addressTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.semibold,
    fontSize: 14,
    marginBottom: 2,
  },
  addressText: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 20,
  },
});
