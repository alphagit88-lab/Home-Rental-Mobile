import React, {useEffect, useMemo, useRef, useState} from 'react';
import {Platform, Pressable, StyleSheet, Text, View} from 'react-native';
import MapView, {Marker, Region} from 'react-native-maps';
import {
  OpenStreetMapView,
  OpenStreetMapViewHandle,
} from './OpenStreetMapView';
import {PropertyRecord} from '../services/properties';
import {colors, fonts, radii, spacing} from '../theme';

type OwnerPropertiesMapProps = {
  properties: PropertyRecord[];
};

type MapPin = {
  displayLatitude: number;
  displayLongitude: number;
  id: number;
  indexLabel: string;
  locationText: string;
  title: string;
};

const DEFAULT_REGION: Region = {
  latitude: 6.9271,
  longitude: 79.8612,
  latitudeDelta: 0.12,
  longitudeDelta: 0.12,
};

const getRegionFromProperties = (properties: PropertyRecord[]): Region => {
  if (properties.length === 0) {
    return DEFAULT_REGION;
  }

  const latitudes = properties.map(property => property.latitude);
  const longitudes = properties.map(property => property.longitude);
  const minLatitude = Math.min(...latitudes);
  const maxLatitude = Math.max(...latitudes);
  const minLongitude = Math.min(...longitudes);
  const maxLongitude = Math.max(...longitudes);
  const centerLatitude = (minLatitude + maxLatitude) / 2;
  const centerLongitude = (minLongitude + maxLongitude) / 2;
  const latitudeDelta = Math.max((maxLatitude - minLatitude) * 1.8, 0.04);
  const longitudeDelta = Math.max((maxLongitude - minLongitude) * 1.8, 0.04);

  return {
    latitude: centerLatitude,
    longitude: centerLongitude,
    latitudeDelta,
    longitudeDelta,
  };
};

const clampDelta = (value: number) => Math.min(Math.max(value, 0.005), 0.4);
const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const groupCoordinateKey = (latitude: number, longitude: number) =>
  `${latitude.toFixed(4)}:${longitude.toFixed(4)}`;

const buildMapPins = (
  properties: PropertyRecord[],
  region: Region,
): MapPin[] => {
  const groups = new Map<string, PropertyRecord[]>();

  properties.forEach(property => {
    const key = groupCoordinateKey(property.latitude, property.longitude);
    const existingGroup = groups.get(key) ?? [];
    existingGroup.push(property);
    groups.set(key, existingGroup);
  });

  const latitudeOffset = clamp(region.latitudeDelta * 0.012, 0.00045, 0.0015);
  const longitudeOffset = clamp(
    region.longitudeDelta * 0.012,
    0.00045,
    0.0015,
  );
  const pins: MapPin[] = [];

  groups.forEach(group => {
    group.forEach((property, index) => {
      const angle =
        group.length === 2
          ? index * Math.PI
          : group.length > 1
            ? (-Math.PI / 2) + ((Math.PI * 2 * index) / group.length)
            : 0;
      const latitudeAdjustment =
        group.length > 1 ? Math.sin(angle) * latitudeOffset : 0;
      const longitudeAdjustment =
        group.length > 1 ? Math.cos(angle) * longitudeOffset : 0;

      pins.push({
        displayLatitude: property.latitude + latitudeAdjustment,
        displayLongitude: property.longitude + longitudeAdjustment,
        id: property.id,
        indexLabel: String(pins.length + 1).padStart(2, '0'),
        locationText: property.locationText,
        title: property.title,
      });
    });
  });

  return pins;
};

export const OwnerPropertiesMap: React.FC<OwnerPropertiesMapProps> = ({
  properties,
}) => {
  const nativeMapRef = useRef<MapView | null>(null);
  const osmMapRef = useRef<OpenStreetMapViewHandle | null>(null);
  const initialRegion = useMemo(
    () => getRegionFromProperties(properties),
    [properties],
  );
  const [currentRegion, setCurrentRegion] = useState<Region>(initialRegion);
  const activeRegion = Platform.OS === 'android' ? initialRegion : currentRegion;
  const mapPins = useMemo(
    () => buildMapPins(properties, activeRegion),
    [activeRegion, properties],
  );

  useEffect(() => {
    const nextRegion = getRegionFromProperties(properties);
    setCurrentRegion(nextRegion);

    if (Platform.OS === 'android') {
      osmMapRef.current?.fitToMarkers();
    } else {
      nativeMapRef.current?.animateToRegion(nextRegion, 350);
    }
  }, [properties]);

  const handleZoom = (direction: 'in' | 'out') => {
    if (Platform.OS === 'android') {
      if (direction === 'in') {
        osmMapRef.current?.zoomIn();
      } else {
        osmMapRef.current?.zoomOut();
      }

      return;
    }

    const factor = direction === 'in' ? 0.6 : 1.6;
    const nextRegion = {
      ...currentRegion,
      latitudeDelta: clampDelta(currentRegion.latitudeDelta * factor),
      longitudeDelta: clampDelta(currentRegion.longitudeDelta * factor),
    };

    setCurrentRegion(nextRegion);
    nativeMapRef.current?.animateToRegion(nextRegion, 250);
  };

  return (
    <View style={styles.mapShell}>
      {Platform.OS === 'android' ? (
        <OpenStreetMapView
          ref={ref => {
            osmMapRef.current = ref;
          }}
          markers={mapPins.map(pin => ({
            description: pin.locationText,
            highlighted: properties.length === 1,
            indexLabel: pin.indexLabel,
            latitude: pin.displayLatitude,
            longitude: pin.displayLongitude,
            showTooltip: properties.length <= 4,
            title: pin.title,
          }))}
          region={initialRegion}
        />
      ) : (
        <MapView
          region={currentRegion}
          onRegionChangeComplete={setCurrentRegion}
          ref={ref => {
            nativeMapRef.current = ref;
          }}
          showsCompass={false}
          showsMyLocationButton={false}
          showsScale={false}
          style={styles.map}
          toolbarEnabled={false}>
          {mapPins.map(pin => (
            <Marker
              coordinate={{
                latitude: pin.displayLatitude,
                longitude: pin.displayLongitude,
              }}
              key={pin.id}
              pinColor={colors.accent}
              title={`${pin.indexLabel} ${pin.title}`}
              description={pin.locationText}
            />
          ))}
        </MapView>
      )}

      {Platform.OS === 'android' ? (
        <View style={styles.attributionBadge}>
          <Text style={styles.attributionText}>Map data OpenStreetMap</Text>
        </View>
      ) : null}

      <View style={styles.controls}>
        <Pressable
          accessibilityRole="button"
          onPress={() => handleZoom('in')}
          style={({pressed}) => [
            styles.controlButton,
            pressed ? styles.controlButtonPressed : null,
          ]}>
          <Text style={styles.controlText}>+</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => handleZoom('out')}
          style={({pressed}) => [
            styles.controlButton,
            pressed ? styles.controlButtonPressed : null,
          ]}>
          <Text style={styles.controlText}>-</Text>
        </Pressable>
      </View>

      {properties.length === 0 ? (
        <View style={styles.emptyBadge}>
          <Text style={styles.emptyBadgeText}>
            Add your first property to see it on the map
          </Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  mapShell: {
    borderRadius: 10,
    height: '100%',
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#D7E6E8',
    width: '100%',
  },
  map: {
    width: '100%',
    height: '100%',
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
  controls: {
    position: 'absolute',
    right: spacing.md,
    top: spacing.md,
    gap: spacing.sm,
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 4},
    elevation: 4,
  },
  controlButtonPressed: {
    opacity: 0.84,
  },
  controlText: {
    color: colors.white,
    fontFamily: fonts.bold,
    fontSize: 22,
    lineHeight: 24,
    marginTop: -1,
  },
  emptyBadge: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    bottom: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: 'rgba(25, 21, 19, 0.72)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  emptyBadgeText: {
    color: colors.white,
    fontFamily: fonts.medium,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
});
