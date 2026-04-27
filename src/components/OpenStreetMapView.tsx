import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react';
import {Platform, StyleSheet, Text, View} from 'react-native';
import MapView, {
  Callout,
  Circle,
  MapPressEvent,
  Marker,
  PROVIDER_GOOGLE,
  Region,
} from 'react-native-maps';

export type OpenStreetMapCoordinate = {
  latitude: number;
  longitude: number;
};

export type OpenStreetMapMarker = {
  description?: string;
  highlighted?: boolean;
  indexLabel?: string;
  latitude: number;
  longitude: number;
  showTooltip?: boolean;
  title?: string;
};

export type OpenStreetMapCircle = {
  description?: string;
  fillColor?: string;
  latitude: number;
  longitude: number;
  radiusKm: number;
  strokeColor?: string;
  title?: string;
};

export type OpenStreetMapViewHandle = {
  fitToMarkers: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
};

type OpenStreetMapViewProps = {
  circles?: OpenStreetMapCircle[];
  initialSelectedCoordinate?: OpenStreetMapCoordinate | null;
  interactive?: boolean;
  markers: OpenStreetMapMarker[];
  onMapPress?: (coordinate: OpenStreetMapCoordinate) => void;
  region: Region;
};

const GOOGLE_MAP_PROVIDER =
  Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined;
const EDGE_PADDING = {bottom: 40, left: 40, right: 40, top: 40};
const SINGLE_POINT_DELTA = 0.03;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const isFiniteCoordinate = (
  latitude: number | null | undefined,
  longitude: number | null | undefined,
): latitude is number =>
  typeof latitude === 'number' &&
  typeof longitude === 'number' &&
  Number.isFinite(latitude) &&
  Number.isFinite(longitude);

const createCircleFitCoordinates = (
  circle: OpenStreetMapCircle,
): OpenStreetMapCoordinate[] => {
  if (
    !isFiniteCoordinate(circle.latitude, circle.longitude) ||
    !Number.isFinite(circle.radiusKm) ||
    circle.radiusKm <= 0
  ) {
    return [];
  }

  const latitudeOffset = circle.radiusKm / 111.32;
  const longitudeOffset =
    circle.radiusKm /
    (111.32 * Math.max(Math.abs(Math.cos((circle.latitude * Math.PI) / 180)), 0.2));

  return [
    {latitude: circle.latitude, longitude: circle.longitude},
    {
      latitude: circle.latitude + latitudeOffset,
      longitude: circle.longitude,
    },
    {
      latitude: circle.latitude - latitudeOffset,
      longitude: circle.longitude,
    },
    {
      latitude: circle.latitude,
      longitude: circle.longitude + longitudeOffset,
    },
    {
      latitude: circle.latitude,
      longitude: circle.longitude - longitudeOffset,
    },
  ];
};

const buildFitCoordinates = (
  markers: OpenStreetMapMarker[],
  circles: OpenStreetMapCircle[],
  initialSelectedCoordinate: OpenStreetMapCoordinate | null,
) => {
  const coordinates: OpenStreetMapCoordinate[] = [];

  markers.forEach(marker => {
    if (isFiniteCoordinate(marker.latitude, marker.longitude)) {
      coordinates.push({
        latitude: marker.latitude,
        longitude: marker.longitude,
      });
    }
  });

  circles.forEach(circle => {
    coordinates.push(...createCircleFitCoordinates(circle));
  });

  if (
    initialSelectedCoordinate &&
    isFiniteCoordinate(
      initialSelectedCoordinate.latitude,
      initialSelectedCoordinate.longitude,
    )
  ) {
    coordinates.push(initialSelectedCoordinate);
  }

  return coordinates;
};

const createSinglePointRegion = (
  coordinate: OpenStreetMapCoordinate,
  fallbackRegion: Region,
): Region => ({
  latitude: coordinate.latitude,
  latitudeDelta: Math.min(fallbackRegion.latitudeDelta, SINGLE_POINT_DELTA),
  longitude: coordinate.longitude,
  longitudeDelta: Math.min(fallbackRegion.longitudeDelta, SINGLE_POINT_DELTA),
});

const createZoomedRegion = (region: Region, factor: number): Region => ({
  latitude: region.latitude,
  latitudeDelta: clamp(region.latitudeDelta * factor, 0.002, 80),
  longitude: region.longitude,
  longitudeDelta: clamp(region.longitudeDelta * factor, 0.002, 80),
});

const MarkerPin: React.FC<{
  highlighted?: boolean;
  label: string;
  selected?: boolean;
}> = ({highlighted = false, label, selected = false}) => (
  <View style={styles.pinWrap}>
    <View
      style={[
        styles.pinBody,
        highlighted ? styles.pinBodyHighlighted : styles.pinBodyDefault,
        selected ? styles.pinBodySelected : null,
      ]}>
      <Text style={styles.pinLabel}>{label}</Text>
    </View>
    <View
      style={[
        styles.pinTail,
        highlighted ? styles.pinTailHighlighted : styles.pinTailDefault,
        selected ? styles.pinTailSelected : null,
      ]}
    />
  </View>
);

export const OpenStreetMapView = forwardRef<
  OpenStreetMapViewHandle,
  OpenStreetMapViewProps
>(
  (
    {
      circles = [],
      initialSelectedCoordinate = null,
      interactive = true,
      markers,
      onMapPress,
      region,
    },
    ref,
  ) => {
    const mapRef = useRef<MapView | null>(null);
    const mapReadyRef = useRef(false);
    const fitCoordinates = useMemo(
      () => buildFitCoordinates(markers, circles, initialSelectedCoordinate),
      [circles, initialSelectedCoordinate, markers],
    );
    const fitCoordinatesRef = useRef<OpenStreetMapCoordinate[]>(fitCoordinates);
    const lastKnownRegionRef = useRef(region);
    const selectionEnabled = Boolean(onMapPress);

    fitCoordinatesRef.current = fitCoordinates;

    useEffect(() => {
      lastKnownRegionRef.current = region;

      if (!mapReadyRef.current || fitCoordinates.length > 0) {
        return;
      }

      mapRef.current?.animateToRegion(region, 250);
    }, [fitCoordinates.length, region]);

    useEffect(() => {
      if (!mapReadyRef.current) {
        return;
      }

      const coordinates = fitCoordinatesRef.current;
      const fallbackRegion = lastKnownRegionRef.current;

      if (coordinates.length === 0) {
        mapRef.current?.animateToRegion(fallbackRegion, 250);
        return;
      }

      if (coordinates.length === 1) {
        mapRef.current?.animateToRegion(
          createSinglePointRegion(coordinates[0], fallbackRegion),
          250,
        );
        return;
      }

      mapRef.current?.fitToCoordinates(coordinates, {
        animated: true,
        edgePadding: EDGE_PADDING,
      });
    }, [fitCoordinates]);

    useImperativeHandle(
      ref,
      () => ({
        fitToMarkers: () => {
          const coordinates = fitCoordinatesRef.current;
          const fallbackRegion = lastKnownRegionRef.current;

          if (!mapReadyRef.current) {
            return;
          }

          if (coordinates.length === 0) {
            mapRef.current?.animateToRegion(fallbackRegion, 250);
            return;
          }

          if (coordinates.length === 1) {
            mapRef.current?.animateToRegion(
              createSinglePointRegion(coordinates[0], fallbackRegion),
              250,
            );
            return;
          }

          mapRef.current?.fitToCoordinates(coordinates, {
            animated: true,
            edgePadding: EDGE_PADDING,
          });
        },
        zoomIn: () => {
          if (!mapReadyRef.current) {
            return;
          }

          const nextRegion = createZoomedRegion(lastKnownRegionRef.current, 0.5);
          lastKnownRegionRef.current = nextRegion;
          mapRef.current?.animateToRegion(nextRegion, 250);
        },
        zoomOut: () => {
          if (!mapReadyRef.current) {
            return;
          }

          const nextRegion = createZoomedRegion(lastKnownRegionRef.current, 2);
          lastKnownRegionRef.current = nextRegion;
          mapRef.current?.animateToRegion(nextRegion, 250);
        },
      }),
      [],
    );

    const handleMapPress = (event: MapPressEvent) => {
      if (!onMapPress) {
        return;
      }

      onMapPress(event.nativeEvent.coordinate);
    };

    return (
      <MapView
        initialRegion={region}
        onMapReady={() => {
          mapReadyRef.current = true;

          const coordinates = fitCoordinatesRef.current;
          const fallbackRegion = lastKnownRegionRef.current;

          if (coordinates.length === 0) {
            mapRef.current?.animateToRegion(fallbackRegion, 0);
            return;
          }

          if (coordinates.length === 1) {
            mapRef.current?.animateToRegion(
              createSinglePointRegion(coordinates[0], fallbackRegion),
              0,
            );
            return;
          }

          mapRef.current?.fitToCoordinates(coordinates, {
            animated: false,
            edgePadding: EDGE_PADDING,
          });
        }}
        onPress={selectionEnabled ? handleMapPress : undefined}
        onRegionChangeComplete={nextRegion => {
          lastKnownRegionRef.current = nextRegion;
        }}
        pitchEnabled={interactive}
        provider={GOOGLE_MAP_PROVIDER}
        ref={refValue => {
          mapRef.current = refValue;
        }}
        rotateEnabled={interactive}
        scrollEnabled={interactive}
        showsCompass={false}
        showsMyLocationButton={false}
        showsScale={false}
        style={styles.map}
        toolbarEnabled={false}
        zoomEnabled={interactive}>
        {circles.map((circle, index) => {
          if (
            !isFiniteCoordinate(circle.latitude, circle.longitude) ||
            !Number.isFinite(circle.radiusKm) ||
            circle.radiusKm <= 0
          ) {
            return null;
          }

          return (
            <Circle
              center={{
                latitude: circle.latitude,
                longitude: circle.longitude,
              }}
              fillColor={circle.fillColor ?? 'rgba(47, 125, 96, 0.15)'}
              key={`circle-${circle.latitude}-${circle.longitude}-${index}`}
              radius={circle.radiusKm * 1000}
              strokeColor={circle.strokeColor ?? '#2F7D60'}
              strokeWidth={2}
            />
          );
        })}

        {markers.map((marker, index) => {
          if (!isFiniteCoordinate(marker.latitude, marker.longitude)) {
            return null;
          }

          return (
            <Marker
              anchor={{x: 0.5, y: 1}}
              coordinate={{
                latitude: marker.latitude,
                longitude: marker.longitude,
              }}
              description={marker.description}
              key={`marker-${marker.latitude}-${marker.longitude}-${index}`}
              title={marker.title}>
              <MarkerPin
                highlighted={marker.highlighted}
                label={marker.indexLabel || '*'}
              />
              {marker.showTooltip ? (
                <Callout tooltip>
                  <View style={styles.calloutCard}>
                    <Text style={styles.calloutTitle}>
                      {marker.title || marker.indexLabel || 'Location'}
                    </Text>
                    {marker.description ? (
                      <Text style={styles.calloutDescription}>
                        {marker.description}
                      </Text>
                    ) : null}
                  </View>
                </Callout>
              ) : null}
            </Marker>
          );
        })}

        {initialSelectedCoordinate &&
        isFiniteCoordinate(
          initialSelectedCoordinate.latitude,
          initialSelectedCoordinate.longitude,
        ) ? (
          <Marker
            anchor={{x: 0.5, y: 1}}
            coordinate={initialSelectedCoordinate}
            title="Selected location">
            <MarkerPin label="PIN" selected />
          </Marker>
        ) : null}
      </MapView>
    );
  },
);

const styles = StyleSheet.create({
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  pinWrap: {
    alignItems: 'center',
  },
  pinBody: {
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    height: 36,
    justifyContent: 'center',
    minWidth: 36,
    paddingHorizontal: 8,
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.22,
    shadowRadius: 7,
    elevation: 5,
  },
  pinBodyDefault: {
    backgroundColor: '#F0B53A',
  },
  pinBodyHighlighted: {
    backgroundColor: '#3F7765',
  },
  pinBodySelected: {
    backgroundColor: '#3F7765',
    minWidth: 44,
  },
  pinLabel: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  pinTail: {
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
    height: 10,
    marginTop: -1,
    width: 4,
  },
  pinTailDefault: {
    backgroundColor: '#F0B53A',
  },
  pinTailHighlighted: {
    backgroundColor: '#3F7765',
  },
  pinTailSelected: {
    backgroundColor: '#3F7765',
  },
  calloutCard: {
    maxWidth: 220,
    borderRadius: 12,
    backgroundColor: 'rgba(25, 21, 19, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  calloutTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },
  calloutDescription: {
    color: '#DDD5CE',
    fontSize: 11,
    lineHeight: 16,
  },
});
