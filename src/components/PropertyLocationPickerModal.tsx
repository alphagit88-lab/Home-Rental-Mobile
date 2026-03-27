import React, {useEffect, useMemo, useState} from 'react';
import {
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import MapView, {Marker, PROVIDER_GOOGLE, Region} from 'react-native-maps';
import {colors, fonts, radii, spacing} from '../theme';

export type PropertyLocationCoordinate = {
  latitude: number;
  longitude: number;
};

type PropertyLocationPickerModalProps = {
  initialCoordinate?: PropertyLocationCoordinate | null;
  onClose: () => void;
  onConfirm: (coordinate: PropertyLocationCoordinate) => void;
  visible: boolean;
};

const DEFAULT_REGION: Region = {
  latitude: 6.9271,
  longitude: 79.8612,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};
const PICKED_LOCATION_DELTA = 0.015;
const GOOGLE_MAP_PROVIDER =
  Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined;

const formatCoordinate = (value: number) => value.toFixed(6);

const formatCoordinateLabel = (coordinate: PropertyLocationCoordinate | null) =>
  coordinate
    ? `${formatCoordinate(coordinate.latitude)}, ${formatCoordinate(
        coordinate.longitude,
      )}`
    : 'No location selected yet.';

const getInitialRegion = (
  coordinate?: PropertyLocationCoordinate | null,
): Region =>
  coordinate
    ? {
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
        latitudeDelta: PICKED_LOCATION_DELTA,
        longitudeDelta: PICKED_LOCATION_DELTA,
      }
    : DEFAULT_REGION;

export const PropertyLocationPickerModal: React.FC<
  PropertyLocationPickerModalProps
> = ({initialCoordinate = null, onClose, onConfirm, visible}) => {
  const [draftCoordinate, setDraftCoordinate] =
    useState<PropertyLocationCoordinate | null>(initialCoordinate);
  const [pickerSession, setPickerSession] = useState(0);
  const initialRegion = useMemo(
    () => getInitialRegion(initialCoordinate),
    [initialCoordinate],
  );
  const selectedCoordinate = draftCoordinate ?? initialCoordinate;

  useEffect(() => {
    if (!visible) {
      return;
    }

    setDraftCoordinate(initialCoordinate);
    setPickerSession(current => current + 1);
  }, [initialCoordinate, visible]);

  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="fullScreen"
      visible={visible}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.root}>
          <View style={styles.headerRow}>
            <Pressable
              accessibilityRole="button"
              hitSlop={10}
              onPress={onClose}
              style={({pressed}) => [
                styles.secondaryButton,
                pressed ? styles.pressed : null,
              ]}>
              <Text style={styles.secondaryButtonText}>Cancel</Text>
            </Pressable>

            <Text style={styles.headerTitle}>Select on Map</Text>

            <View style={styles.headerSpacer} />
          </View>

          <Text style={styles.helperText}>
            Tap the exact property spot on the map, then press Use This
            Location to save its latitude and longitude.
          </Text>

          <View style={styles.mapCard}>
            <MapView
              key={`google-picker-${pickerSession}`}
              initialRegion={initialRegion}
              onPress={event => setDraftCoordinate(event.nativeEvent.coordinate)}
              provider={GOOGLE_MAP_PROVIDER}
              showsCompass={false}
              showsMyLocationButton={false}
              showsScale={false}
              style={styles.map}
              toolbarEnabled={false}>
              {selectedCoordinate ? (
                <Marker
                  coordinate={selectedCoordinate}
                  pinColor={colors.accent}
                  title="Selected property location"
                />
              ) : null}
            </MapView>
          </View>

          <View style={styles.coordinateCard}>
            <Text style={styles.coordinateLabel}>Selected Coordinates</Text>
            <Text style={styles.coordinateValue}>
              {formatCoordinateLabel(selectedCoordinate)}
            </Text>
          </View>

          <View style={styles.actionsRow}>
            <Pressable
              accessibilityRole="button"
              onPress={onClose}
              style={({pressed}) => [
                styles.actionButton,
                styles.cancelActionButton,
                pressed ? styles.pressed : null,
              ]}>
              <Text
                style={[styles.actionButtonText, styles.cancelActionButtonText]}>
                Cancel
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              disabled={!selectedCoordinate}
              onPress={() => {
                if (!selectedCoordinate) {
                  return;
                }

                onConfirm(selectedCoordinate);
              }}
              style={({pressed}) => [
                styles.actionButton,
                styles.confirmActionButton,
                !selectedCoordinate ? styles.disabledActionButton : null,
                pressed && selectedCoordinate ? styles.pressed : null,
              ]}>
              <Text
                style={[
                  styles.actionButtonText,
                  !selectedCoordinate ? styles.disabledActionButtonText : null,
                ]}>
                Use This Location
              </Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
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
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerTitle: {
    color: colors.textPrimary,
    flex: 1,
    fontFamily: fonts.bold,
    fontSize: 18,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 72,
  },
  helperText: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 20,
    marginTop: spacing.md,
  },
  mapCard: {
    backgroundColor: '#D7E6E8',
    borderColor: '#D8DCD4',
    borderRadius: radii.lg,
    borderWidth: 1,
    flex: 1,
    marginTop: spacing.md,
    minHeight: 360,
    overflow: 'hidden',
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  coordinateCard: {
    backgroundColor: '#F7F0E5',
    borderColor: '#E1D7C6',
    borderRadius: radii.md,
    borderWidth: 1,
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md - 2,
  },
  coordinateLabel: {
    color: '#7E776F',
    fontFamily: fonts.medium,
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  coordinateValue: {
    color: colors.textPrimary,
    fontFamily: fonts.semibold,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 6,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  actionButton: {
    alignItems: 'center',
    borderRadius: 12,
    flex: 1,
    justifyContent: 'center',
    minHeight: 52,
    paddingHorizontal: spacing.md,
  },
  cancelActionButton: {
    backgroundColor: '#F2E8D8',
  },
  confirmActionButton: {
    backgroundColor: colors.primary,
  },
  actionButtonText: {
    color: colors.white,
    fontFamily: fonts.semibold,
    fontSize: 14,
  },
  cancelActionButtonText: {
    color: colors.primary,
  },
  disabledActionButton: {
    backgroundColor: '#D9D2C7',
  },
  disabledActionButtonText: {
    color: '#7F776E',
  },
  secondaryButton: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    minHeight: 36,
    width: 72,
  },
  secondaryButtonText: {
    color: colors.primary,
    fontFamily: fonts.semibold,
    fontSize: 14,
  },
  pressed: {
    opacity: 0.88,
  },
});
