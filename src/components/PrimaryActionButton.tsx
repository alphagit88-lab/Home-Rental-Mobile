import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors, fonts, radii, spacing } from '../theme';

type PrimaryActionButtonProps = {
  title: string;
  loading?: boolean;
  onPress: () => void;
  trailingIcon?: React.ReactNode;
};

export const PrimaryActionButton: React.FC<PrimaryActionButtonProps> = ({
  title,
  loading = false,
  onPress,
  trailingIcon,
}) => {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        pressed && !loading ? styles.buttonPressed : null,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors.white} />
      ) : (
        <>
          <Text style={styles.buttonText}>{title.toUpperCase()}</Text>
          <View style={styles.arrowCircle}>
            {trailingIcon ?? <Text style={styles.arrowText}>{'>'}</Text>}
          </View>
        </>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 56,
    borderRadius: radii.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
    position: 'relative',
  },
  buttonPressed: {
    backgroundColor: colors.primaryPressed,
  },
  buttonText: {
    color: colors.white,
    fontSize: 15,
    fontFamily: fonts.bold,
    letterSpacing: 0.5,
  },
  arrowCircle: {
    position: 'absolute',
    right: spacing.md,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowText: {
    color: colors.primary,
    fontSize: 16,
    fontFamily: fonts.heavy,
    marginTop: -1,
  },
});
