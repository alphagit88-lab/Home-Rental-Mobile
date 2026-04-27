import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { AuthInput } from '../components/AuthInput';
import { HeroBanner } from '../components/HeroBanner';
import { InlineStateMessage } from '../components/InlineStateMessage';
import { PrimaryActionButton } from '../components/PrimaryActionButton';
import { useLoginScreen } from '../hooks/useLoginScreen';
import { useResponsive } from '../hooks/useResponsive';
import { colors, fonts, radii, spacing } from '../theme';
import { DashboardVariant } from '../types/appFlow';
import LockIcon from '../assets/images/Lock.svg';
import MessageIcon from '../assets/images/Message.svg';
import ShapeIcon from '../assets/images/Shape.svg';
import HideIcon from '../assets/images/hide.svg';
import HeroImage from '../assets/images/image.svg';

type LoginScreenProps = {
  onNavigateToHome?: (variant: DashboardVariant) => void;
  onNavigateToSignUp?: () => void;
};

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onNavigateToHome,
  onNavigateToSignUp,
}) => {
  const responsive = useResponsive();
  const login = useLoginScreen();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View
            style={[
              styles.page,
            ]}
          >
            <View
              style={[
                styles.contentWidth,
                { maxWidth: responsive.maxContentWidth },
              ]}
            >
              <HeroBanner
                backgroundImage={HeroImage}
                heroState={login.heroState}
                height={responsive.heroHeight}
                horizontalPadding={responsive.horizontalPadding}
                greetingSize={responsive.heroGreetingSize}
                titleSize={responsive.heroTitleSize}
                taglineSize={responsive.heroTaglineSize}
                maxWidth={responsive.maxContentWidth}
                onRetry={login.onRetryHeroPress}
              />

              <View
                style={[
                  styles.formSection,
                  {
                    paddingTop: responsive.formTopPadding,
                    paddingBottom: responsive.formBottomPadding,
                    paddingHorizontal: responsive.horizontalPadding,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.sectionTitle,
                    { fontSize: responsive.sectionTitleSize },
                  ]}
                >
                  Sign in
                </Text>

                <View style={styles.pathSelector}>
                  <AuthPathButton
                    active={login.dashboardVariant === 'standard'}
                    label="Tenant"
                    onPress={() => login.setDashboardVariant('standard')}
                  />
                  <AuthPathButton
                    active={login.dashboardVariant === 'owner'}
                    label="Property Owner"
                    onPress={() => login.setDashboardVariant('owner')}
                  />
                  <AuthPathButton
                    active={login.dashboardVariant === 'serviceProvider'}
                    label="Service Provider"
                    onPress={() => login.setDashboardVariant('serviceProvider')}
                  />
                </View>

                <View style={styles.fields}>
                  <AuthInput
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                    leadingIcon={<MessageIcon height={18} width={18} />}
                    onChangeText={login.setEmail}
                    placeholder="abc@email.com"
                    value={login.email}
                    height={responsive.inputHeight}
                  />

                  <AuthInput
                    autoCapitalize="none"
                    autoCorrect={false}
                    leadingIcon={<LockIcon height={18} width={18} />}
                    onChangeText={login.setPassword}
                    placeholder="Your password"
                    secureTextEntry={!login.passwordVisible}
                    trailingIcon={<HideIcon height={16} width={16} />}
                    onTrailingPress={() =>
                      login.setPasswordVisible(!login.passwordVisible)
                    }
                    value={login.password}
                    height={responsive.inputHeight}
                  />
                </View>

                <View
                  style={[
                    styles.optionsRow,
                    responsive.isVerySmallPhone && styles.optionsRowStacked,
                  ]}
                >
                  <View style={styles.rememberRow}>
                    <Switch
                      thumbColor={colors.white}
                      trackColor={{
                        false: '#D3CCC0',
                        true: colors.primary,
                      }}
                      value={login.rememberMe}
                      onValueChange={login.setRememberMe}
                    />
                    <Text
                      style={[
                        styles.optionText,
                        { fontSize: responsive.bodySize },
                      ]}
                    >
                      Remember Me
                    </Text>
                  </View>

                  <Pressable
                    accessibilityRole="button"
                    onPress={login.onForgotPasswordPress}
                  >
                    <Text
                      style={[
                        styles.forgotText,
                        { fontSize: responsive.bodySize },
                      ]}
                    >
                      Forgot Password?
                    </Text>
                  </Pressable>
                </View>

                {login.inlineMessage ? (
                  <View style={styles.messageWrap}>
                    <InlineStateMessage message={login.inlineMessage} />
                  </View>
                ) : null}

                <PrimaryActionButton
                  title="Sign In"
                  loading={login.submitState === 'loading'}
                  onPress={() => {
                    void login.onSignInPress(onNavigateToHome);
                  }}
                  trailingIcon={<ShapeIcon height={12} width={12} />}
                />

                <View style={styles.signupRow}>
                  <Text
                    style={[styles.signupText, { fontSize: responsive.bodySize }]}
                  >
                    Don't have an account?
                  </Text>
                  <Pressable
                    accessibilityRole="button"
                    onPress={onNavigateToSignUp ?? login.onSignUpPress}
                  >
                    <Text
                      style={[
                        styles.signupLink,
                        { fontSize: responsive.bodySize },
                      ]}
                    >
                      {' '}
                      Sign up
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

type AuthPathButtonProps = {
  active: boolean;
  label: string;
  onPress: () => void;
};

const AuthPathButton: React.FC<AuthPathButtonProps> = ({
  active,
  label,
  onPress,
}) => {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.pathButton,
        active && styles.pathButtonActive,
        pressed && styles.pathButtonPressed,
      ]}
    >
      <Text
        style={[
          styles.pathButtonText,
          active && styles.pathButtonTextActive,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  page: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  contentWidth: {
    width: '100%',
    alignSelf: 'center',
  },
  formSection: {
    backgroundColor: colors.background,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    marginBottom: spacing.lg,
  },
  pathSelector: {
    width: '100%',
    flexDirection: 'row',
    gap: spacing.xs,
    borderRadius: radii.pill,
    backgroundColor: '#E9DCC9',
    padding: spacing.xs,
    marginBottom: spacing.lg,
  },
  pathButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  pathButtonActive: {
    backgroundColor: colors.primary,
  },
  pathButtonPressed: {
    opacity: 0.88,
  },
  pathButtonText: {
    color: colors.textPrimary,
    fontFamily: fonts.medium,
    fontSize: 12,
    lineHeight: 15,
    textAlign: 'center',
  },
  pathButtonTextActive: {
    color: colors.white,
  },
  fields: {
    gap: spacing.md,
  },
  optionsRow: {
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionsRowStacked: {
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  optionText: {
    marginLeft: spacing.sm,
    color: colors.textPrimary,
    fontFamily: fonts.regular,
    flexShrink: 1,
  },
  forgotText: {
    color: colors.textPrimary,
    fontFamily: fonts.medium,
  },
  messageWrap: {
    marginBottom: spacing.lg,
  },
  signupRow: {
    marginTop: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  signupText: {
    color: colors.textPrimary,
    fontFamily: fonts.regular,
  },
  signupLink: {
    color: colors.primary,
    fontFamily: fonts.semibold,
  },
});
