import React from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  TextInput,
  TextInputProps,
  ViewStyle,
  View,
} from 'react-native';
import { colors, fonts, radii, spacing } from '../theme';

type AuthInputProps = TextInputProps & {
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  onTrailingPress?: () => void;
  height?: number;
  leadingIconStyle?: StyleProp<ViewStyle>;
};

export const AuthInput: React.FC<AuthInputProps> = ({
  leadingIcon,
  trailingIcon,
  onTrailingPress,
  height = 56,
  leadingIconStyle,
  style,
  ...rest
}) => {
  return (
    <View style={[styles.container, { minHeight: height }]}>
      {leadingIcon ? (
        <View style={[styles.leadingIcon, leadingIconStyle]}>{leadingIcon}</View>
      ) : null}
      <TextInput
        {...rest}
        style={[styles.input, style]}
        placeholderTextColor={colors.textSecondary}
      />
      {trailingIcon ? (
        <Pressable
          accessibilityRole="button"
          onPress={onTrailingPress}
          style={styles.trailingButton}
        >
          {trailingIcon}
        </Pressable>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    backgroundColor: colors.inputBackground,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  leadingIcon: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 14,
    fontFamily: fonts.regular,
    paddingVertical: 0,
  },
  trailingButton: {
    marginLeft: spacing.sm,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
