import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { AuthInput } from '../components/AuthInput';
import { HeroBanner } from '../components/HeroBanner';
import { InlineStateMessage } from '../components/InlineStateMessage';
import { PrimaryActionButton } from '../components/PrimaryActionButton';
import { SelectField } from '../components/SelectField';
import { useResponsive } from '../hooks/useResponsive';
import { useSignUpScreen } from '../hooks/useSignUpScreen';
import { colors, fonts, spacing } from '../theme';
import ProfileIcon from '../assets/images/Profile.svg';
import RoleArrowIcon from '../assets/images/20 1.svg';
import MessageIcon from '../assets/images/Message.svg';
import LockIcon from '../assets/images/Lock.svg';
import HideIcon from '../assets/images/hide.svg';
import ShapeIcon from '../assets/images/Shape.svg';
import SignUpHeroImage from '../assets/images/Untitled design (3) 1.svg';

type SignUpScreenProps = {
  onNavigateToSignIn?: () => void;
  onNavigateToHome?: () => void;
};

export const SignUpScreen: React.FC<SignUpScreenProps> = ({
  onNavigateToSignIn,
  onNavigateToHome,
}) => {
  const responsive = useResponsive();
  const signUp = useSignUpScreen();

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
          <View style={styles.page}>
            <View
              style={[
                styles.contentWidth,
                { maxWidth: responsive.maxContentWidth },
              ]}
            >
              <HeroBanner
                backgroundImage={SignUpHeroImage}
                heroState={signUp.heroState}
                height={responsive.heroHeight}
                horizontalPadding={responsive.horizontalPadding}
                greetingSize={responsive.heroGreetingSize}
                titleSize={responsive.heroTitleSize}
                taglineSize={responsive.heroTaglineSize}
                maxWidth={responsive.maxContentWidth}
                onRetry={signUp.onRetryHeroPress}
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
                  Sign up
                </Text>

                <View style={styles.fields}>
                  <SelectField
                    height={responsive.inputHeight}
                    leadingIcon={<ProfileIcon height={18} width={18} />}
                    onPress={signUp.onRolePress}
                    placeholder="Sign up as a"
                    trailingIcon={<RoleArrowIcon height={16} width={16} />}
                    value={signUp.signUpAs}
                  />

                  <AuthInput
                    autoCapitalize="words"
                    autoCorrect={false}
                    height={responsive.inputHeight}
                    leadingIcon={<ProfileIcon height={18} width={18} />}
                    onChangeText={signUp.setFullName}
                    placeholder="Full name"
                    value={signUp.fullName}
                  />

                  <AuthInput
                    autoCapitalize="none"
                    autoCorrect={false}
                    height={responsive.inputHeight}
                    keyboardType="email-address"
                    leadingIcon={<MessageIcon height={18} width={18} />}
                    onChangeText={signUp.setEmail}
                    placeholder="abc@email.com"
                    value={signUp.email}
                  />

                  <AuthInput
                    autoCapitalize="none"
                    autoCorrect={false}
                    height={responsive.inputHeight}
                    leadingIcon={<LockIcon height={18} width={18} />}
                    onChangeText={signUp.setPassword}
                    placeholder="Your password"
                    secureTextEntry={!signUp.passwordVisible}
                    trailingIcon={<HideIcon height={16} width={16} />}
                    onTrailingPress={() =>
                      signUp.setPasswordVisible(!signUp.passwordVisible)
                    }
                    value={signUp.password}
                  />
                </View>

                {signUp.inlineMessage ? (
                  <View style={styles.messageWrap}>
                    <InlineStateMessage message={signUp.inlineMessage} />
                  </View>
                ) : null}

                <View style={styles.buttonWrap}>
                  <PrimaryActionButton
                    title="Sign Up"
                    loading={signUp.submitState === 'loading'}
                    onPress={() => signUp.onSignUpPress(onNavigateToHome)}
                    trailingIcon={<ShapeIcon height={12} width={12} />}
                  />
                </View>

                <View style={styles.signInRow}>
                  <Text style={[styles.signInText, { fontSize: responsive.bodySize }]}>
                    Already have an account?
                  </Text>
                  <Pressable
                    accessibilityRole="button"
                    onPress={onNavigateToSignIn}
                  >
                    <Text
                      style={[styles.signInLink, { fontSize: responsive.bodySize }]}
                    >
                      {' '}
                      Sign in
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
  fields: {
    gap: spacing.md,
  },
  messageWrap: {
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  buttonWrap: {
    marginTop: spacing.lg,
  },
  signInRow: {
    marginTop: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  signInText: {
    color: colors.textPrimary,
    fontFamily: fonts.regular,
  },
  signInLink: {
    color: colors.primary,
    fontFamily: fonts.semibold,
  },
});
