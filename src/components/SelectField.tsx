import React from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { colors, fonts, radii, spacing } from '../theme';

type SelectFieldProps = {
  value?: string;
  placeholder: string;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  onPress: () => void;
  height?: number;
  leadingIconStyle?: StyleProp<ViewStyle>;
};

export const SelectField: React.FC<SelectFieldProps> = ({
  value,
  placeholder,
  leadingIcon,
  trailingIcon,
  onPress,
  height = 56,
  leadingIconStyle,
}) => {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.container, { minHeight: height }]}
    >
      {leadingIcon ? (
        <View style={[styles.leadingIcon, leadingIconStyle]}>{leadingIcon}</View>
      ) : null}
      <Text style={[styles.valueText, !value ? styles.placeholderText : null]}>
        {value || placeholder}
      </Text>
      {trailingIcon ? <View style={styles.trailingIcon}>{trailingIcon}</View> : null}
    </Pressable>
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
  valueText: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
    fontFamily: fonts.regular,
  },
  placeholderText: {
    color: colors.textSecondary,
  },
  trailingIcon: {
    marginLeft: spacing.sm,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
