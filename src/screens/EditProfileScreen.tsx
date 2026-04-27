import React, { useState } from 'react';
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
import { AppBottomNav, AppTab } from '../components/AppBottomNav';
import { AuthInput } from '../components/AuthInput';
import { InlineStateMessage } from '../components/InlineStateMessage';
import { PrimaryActionButton } from '../components/PrimaryActionButton';
import { useResponsive } from '../hooks/useResponsive';
import { getAuthSession, updateAuthSessionUser } from '../services/authSession';
import { updateProfile } from '../services/rentalAuth';
import { colors, fonts, radii, spacing } from '../theme';
import {formatRentalRoleLabel} from '../types/appFlow';
import HideIcon from '../assets/images/hide.svg';
import LockIcon from '../assets/images/Lock.svg';
import MessageIcon from '../assets/images/Message.svg';
import ProfileIcon from '../assets/images/Profile.svg';
import ShapeIcon from '../assets/images/Shape.svg';

type SubmitState = 'idle' | 'loading' | 'error';
type MessageTone = 'neutral' | 'error' | 'success';

type InlineMessage = {
  text: string;
  tone: MessageTone;
};

type EditProfileScreenProps = {
  activeTab: AppTab;
  onBackPress: () => void;
  onProfileSaved: () => void;
  onTabPress: (tab: AppTab) => void;
};

export const EditProfileScreen: React.FC<EditProfileScreenProps> = ({
  activeTab,
  onBackPress,
  onProfileSaved,
  onTabPress,
}) => {
  const responsive = useResponsive();
  const session = getAuthSession();
  const [fullName, setFullName] = useState(session?.user.name ?? '');
  const [email, setEmail] = useState(session?.user.email ?? '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentPasswordVisible, setCurrentPasswordVisible] = useState(false);
  const [newPasswordVisible, setNewPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [inlineMessage, setInlineMessage] = useState<InlineMessage | null>(null);

  const onSavePress = async () => {
    if (!session) {
      setSubmitState('error');
      setInlineMessage({
        text: 'Please sign in again before editing your profile.',
        tone: 'error',
      });
      return;
    }

    if (!fullName.trim() || !email.trim()) {
      setSubmitState('error');
      setInlineMessage({
        text: 'Please fill in both name and email.',
        tone: 'error',
      });
      return;
    }

    if (!email.includes('@')) {
      setSubmitState('error');
      setInlineMessage({
        text: 'Please enter a valid email address.',
        tone: 'error',
      });
      return;
    }

    const wantsPasswordChange =
      currentPassword.trim().length > 0 ||
      newPassword.trim().length > 0 ||
      confirmPassword.trim().length > 0;

    if (wantsPasswordChange) {
      if (!currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
        setSubmitState('error');
        setInlineMessage({
          text: 'To change your password, fill in current, new, and confirm password.',
          tone: 'error',
        });
        return;
      }

      if (newPassword.trim().length < 6) {
        setSubmitState('error');
        setInlineMessage({
          text: 'New password must be at least 6 characters long.',
          tone: 'error',
        });
        return;
      }

      if (newPassword !== confirmPassword) {
        setSubmitState('error');
        setInlineMessage({
          text: 'New password and confirm password do not match.',
          tone: 'error',
        });
        return;
      }
    }

    setSubmitState('loading');
    setInlineMessage(null);

    try {
      const response = await updateProfile(session.token, {
        currentPassword: currentPassword.trim() || undefined,
        name: fullName.trim(),
        email: email.trim().toLowerCase(),
        newPassword: newPassword.trim() || undefined,
      });

      updateAuthSessionUser(response.user);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSubmitState('idle');
      onProfileSaved();
    } catch (error) {
      setSubmitState('error');
      setInlineMessage({
        text:
          error instanceof Error
            ? error.message
            : 'Unable to save your profile right now.',
        tone: 'error',
      });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.root}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingHorizontal: responsive.horizontalPadding },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View
            style={[
              styles.contentWidth,
              { maxWidth: responsive.maxContentWidth },
            ]}
          >
            <View style={styles.headerRow}>
              <Pressable
                accessibilityRole="button"
                onPress={onBackPress}
                style={({ pressed }) => [
                  styles.backButton,
                  pressed && styles.backButtonPressed,
                ]}
              >
                <Text style={styles.backButtonText}>{'<'}</Text>
              </Pressable>
              <Text style={styles.headerTitle}>Edit Profile</Text>
              <View style={styles.headerSpacer} />
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Your details</Text>

              <View style={styles.fields}>
                <AuthInput
                  autoCapitalize="words"
                  autoCorrect={false}
                  height={responsive.inputHeight}
                  leadingIcon={<ProfileIcon height={18} width={18} />}
                  onChangeText={setFullName}
                  placeholder="Full name"
                  value={fullName}
                />

                <AuthInput
                  autoCapitalize="none"
                  autoCorrect={false}
                  height={responsive.inputHeight}
                  keyboardType="email-address"
                  leadingIcon={<MessageIcon height={18} width={18} />}
                  onChangeText={setEmail}
                  placeholder="abc@email.com"
                  value={email}
                />
              </View>

              <View style={styles.roleBadge}>
                <Text style={styles.roleBadgeLabel}>Role</Text>
                <Text style={styles.roleBadgeValue}>
                  {formatRentalRoleLabel(session?.user.role)}
                </Text>
              </View>

              <View style={styles.passwordSection}>
                <Text style={styles.sectionSubtitle}>Change password</Text>
                <Text style={styles.sectionHint}>
                  Leave these blank if you only want to update name or email.
                </Text>

                <View style={styles.fields}>
                  <AuthInput
                    autoCapitalize="none"
                    autoCorrect={false}
                    height={responsive.inputHeight}
                    leadingIcon={<LockIcon height={18} width={18} />}
                    onChangeText={setCurrentPassword}
                    onTrailingPress={() =>
                      setCurrentPasswordVisible(!currentPasswordVisible)
                    }
                    placeholder="Current password"
                    secureTextEntry={!currentPasswordVisible}
                    trailingIcon={<HideIcon height={16} width={16} />}
                    value={currentPassword}
                  />

                  <AuthInput
                    autoCapitalize="none"
                    autoCorrect={false}
                    height={responsive.inputHeight}
                    leadingIcon={<LockIcon height={18} width={18} />}
                    onChangeText={setNewPassword}
                    onTrailingPress={() => setNewPasswordVisible(!newPasswordVisible)}
                    placeholder="New password"
                    secureTextEntry={!newPasswordVisible}
                    trailingIcon={<HideIcon height={16} width={16} />}
                    value={newPassword}
                  />

                  <AuthInput
                    autoCapitalize="none"
                    autoCorrect={false}
                    height={responsive.inputHeight}
                    leadingIcon={<LockIcon height={18} width={18} />}
                    onChangeText={setConfirmPassword}
                    onTrailingPress={() =>
                      setConfirmPasswordVisible(!confirmPasswordVisible)
                    }
                    placeholder="Confirm new password"
                    secureTextEntry={!confirmPasswordVisible}
                    trailingIcon={<HideIcon height={16} width={16} />}
                    value={confirmPassword}
                  />
                </View>
              </View>

              {inlineMessage ? (
                <View style={styles.messageWrap}>
                  <InlineStateMessage message={inlineMessage} />
                </View>
              ) : null}

              <PrimaryActionButton
                title="Save Changes"
                loading={submitState === 'loading'}
                onPress={() => {
                  void onSavePress();
                }}
                trailingIcon={<ShapeIcon height={12} width={12} />}
              />
            </View>
          </View>
        </ScrollView>

        <AppBottomNav activeTab={activeTab} onTabPress={onTabPress} />
      </KeyboardAvoidingView>
    </SafeAreaView>
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
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingTop: spacing.md,
    paddingBottom: 136,
  },
  contentWidth: {
    width: '100%',
    alignSelf: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    backgroundColor: colors.inputBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonPressed: {
    opacity: 0.85,
  },
  backButtonText: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 20,
    marginTop: -1,
  },
  headerTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 20,
  },
  headerSpacer: {
    width: 44,
  },
  card: {
    borderRadius: radii.lg,
    backgroundColor: '#F7F3EA',
    padding: spacing.lg,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 18,
    marginBottom: spacing.lg,
  },
  fields: {
    gap: spacing.md,
  },
  roleBadge: {
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: radii.md,
    backgroundColor: 'rgba(63, 109, 95, 0.08)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  roleBadgeLabel: {
    color: colors.textSecondary,
    fontFamily: fonts.medium,
    fontSize: 12,
    marginBottom: 4,
  },
  roleBadgeValue: {
    color: colors.textPrimary,
    fontFamily: fonts.semibold,
    fontSize: 15,
  },
  passwordSection: {
    marginBottom: spacing.lg,
  },
  sectionSubtitle: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 16,
    marginBottom: spacing.xs,
  },
  sectionHint: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 13,
    marginBottom: spacing.md,
    lineHeight: 18,
  },
  messageWrap: {
    marginBottom: spacing.lg,
  },
});
