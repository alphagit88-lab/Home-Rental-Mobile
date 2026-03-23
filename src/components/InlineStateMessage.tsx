import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { InlineMessage } from '../hooks/useLoginScreen';
import { colors, fonts, radii, spacing } from '../theme';

type InlineStateMessageProps = {
  message: InlineMessage;
};

export const InlineStateMessage: React.FC<InlineStateMessageProps> = ({
  message,
}) => {
  const toneStyles =
    message.tone === 'error'
      ? styles.errorTone
      : message.tone === 'success'
        ? styles.successTone
        : styles.neutralTone;

  return (
    <View style={[styles.container, toneStyles]}>
      <Text style={[styles.text, styles[`${message.tone}Text`]]}>{message.text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
  },
  neutralTone: {
    backgroundColor: 'rgba(230, 169, 53, 0.14)',
  },
  errorTone: {
    backgroundColor: 'rgba(194, 75, 75, 0.12)',
  },
  successTone: {
    backgroundColor: 'rgba(47, 125, 96, 0.14)',
  },
  text: {
    fontSize: 13,
    fontFamily: fonts.medium,
  },
  neutralText: {
    color: colors.neutralMessage,
  },
  errorText: {
    color: colors.error,
  },
  successText: {
    color: colors.success,
  },
});
