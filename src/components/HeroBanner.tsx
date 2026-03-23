import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { HeroState } from '../hooks/useLoginScreen';
import { colors, fonts, spacing } from '../theme';
import HeroImage from '../assets/images/image.svg';
import LineDivider from '../assets/images/Line 1.svg';

type HeroBannerProps = {
  heroState: HeroState;
  height: number;
  horizontalPadding: number;
  greetingSize: number;
  titleSize: number;
  taglineSize: number;
  maxWidth: number;
  onRetry: () => void;
};

export const HeroBanner: React.FC<HeroBannerProps> = ({
  heroState,
  height,
  horizontalPadding,
  greetingSize,
  titleSize,
  taglineSize,
  maxWidth,
  onRetry,
}) => {
  return (
    <View style={[styles.container, { height }]}>
      <HeroImage
        height="100%"
        preserveAspectRatio="xMidYMid slice"
        style={styles.heroImage}
        width="100%"
      />
      <View style={styles.overlay} />

      <View
        style={[
          styles.content,
          {
            minHeight: height,
            paddingHorizontal: horizontalPadding,
            maxWidth,
          },
        ]}
      >
        {heroState.status === 'loading' ? (
          <View>
            <ActivityIndicator color={colors.accent} />
            <Text style={[styles.metaText, { fontSize: taglineSize }]}>
              Loading welcome content...
            </Text>
          </View>
        ) : null}

        {heroState.status === 'empty' ? (
          <View>
            <Text style={[styles.greeting, { fontSize: greetingSize }]}>
              Hello, Guest
            </Text>
            <Text style={[styles.metaText, { fontSize: taglineSize }]}>
              Welcome content is not available yet.
            </Text>
          </View>
        ) : null}

        {heroState.status === 'error' ? (
          <View>
            <Text style={[styles.greeting, { fontSize: greetingSize }]}>
              Hello, Guest
            </Text>
            <Text style={[styles.metaText, { fontSize: taglineSize }]}>
              {heroState.message}
            </Text>
            <Pressable accessibilityRole="button" onPress={onRetry}>
              <Text style={styles.retryText}>Retry</Text>
            </Pressable>
          </View>
        ) : null}

        {heroState.status === 'content' ? (
          <View>
            <Text style={[styles.greeting, { fontSize: greetingSize }]}>
              {heroState.content.greeting}
            </Text>
            <Text style={[styles.title, { fontSize: titleSize }]}>
              {heroState.content.title}
            </Text>
            <LineDivider style={styles.lineDivider} width={220} />
            <Text style={[styles.tagline, { fontSize: taglineSize }]}>
              {heroState.content.tagline}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#2F2923',
    overflow: 'hidden',
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.heroOverlay,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: 28,
  },
  greeting: {
    color: colors.textOnDark,
    fontFamily: fonts.heavy,
    lineHeight: 44,
    marginBottom: 2,
    textAlign: 'center',
  },
  title: {
    color: colors.textOnDark,
    fontFamily: fonts.bold,
    lineHeight: 38,
    marginBottom: 6,
    textAlign: 'center',
  },
  lineDivider: {
    alignSelf: 'center',
    marginBottom: 8,
  },
  tagline: {
    color: colors.accent,
    fontFamily: fonts.bold,
    lineHeight: 22,
    textAlign: 'center',
  },
  metaText: {
    color: colors.textOnDark,
    marginTop: spacing.sm,
    lineHeight: 22,
    fontFamily: fonts.regular,
    textAlign: 'center',
  },
  retryText: {
    color: colors.accent,
    marginTop: spacing.md,
    fontFamily: fonts.bold,
    fontSize: 14,
    textAlign: 'center',
  },
});
