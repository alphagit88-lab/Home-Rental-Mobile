import React from 'react';
import {
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import MenuIcon from '../assets/images/menu 1.svg';
import ProfilePic from '../assets/images/profile_pic.svg';
import EditProfileIcon from '../assets/images/iconamoon_profile-light.svg';
import SecurityIcon from '../assets/images/material-symbols_privacy-tip-outline.svg';
import NotificationsIcon from '../assets/images/iconamoon_notification.svg';
import PrivacyIcon from '../assets/images/ic_outline-lock.svg';
import SubscriptionIcon from '../assets/images/material-symbols_credit-card-outline.svg';
import HelpIcon from '../assets/images/mdi_question-mark-circle-outline.svg';
import TermsIcon from '../assets/images/tabler_circle-letter-i.svg';
import FreeUpSpaceIcon from '../assets/images/ri_delete-bin-5-line.svg';
import DataSaverIcon from '../assets/images/ic_outline-data-exploration.svg';
import ReportProblemIcon from '../assets/images/ic_sharp-outlined-flag.svg';
import AddAccountIcon from '../assets/images/ic_sharp-people-outline.svg';
import LogoutIcon from '../assets/images/mdi_logout.svg';
import {AppBottomNav, AppTab} from '../components/AppBottomNav';
import {useHomeScreen} from '../hooks/useHomeScreen';
import {useResponsive} from '../hooks/useResponsive';
import {colors, fonts, radii, spacing} from '../theme';

type AccountScreenProps = {
  activeTab: AppTab;
  onEditProfile: () => void;
  onOpenHelp: () => void;
  onOpenPrivacyPolicy: () => void;
  onOpenTerms: () => void;
  onReportProblem: () => void;
  onRequestAccountDeletion: () => void;
  onLogout: () => void;
  onTabPress: (tab: AppTab) => void;
};

type SettingsItem = {
  Icon: React.FC<any>;
  label: string;
  onPress?: () => void;
};

type SettingsSection = {
  items: SettingsItem[];
  title: string;
};

export const AccountScreen: React.FC<AccountScreenProps> = ({
  activeTab,
  onEditProfile,
  onOpenHelp,
  onOpenPrivacyPolicy,
  onOpenTerms,
  onReportProblem,
  onRequestAccountDeletion,
  onLogout,
  onTabPress,
}) => {
  const responsive = useResponsive();
  const home = useHomeScreen();
  const topInset = Platform.OS === 'android' ? spacing.xs : spacing.md;

  const sections: SettingsSection[] = [
    {
      title: 'Account',
      items: [
        {label: 'Edit profile', Icon: EditProfileIcon, onPress: onEditProfile},
        {label: 'Security', Icon: SecurityIcon},
        {label: 'Notifications', Icon: NotificationsIcon},
        {
          label: 'Privacy Policy',
          Icon: PrivacyIcon,
          onPress: onOpenPrivacyPolicy,
        },
      ],
    },
    {
      title: 'Support & About',
      items: [
        {label: 'My Subscription', Icon: SubscriptionIcon},
        {label: 'Help & Support', Icon: HelpIcon, onPress: onOpenHelp},
        {label: 'Terms and Policies', Icon: TermsIcon, onPress: onOpenTerms},
      ],
    },
    {
      title: 'Cache & cellular',
      items: [
        {label: 'Free up space', Icon: FreeUpSpaceIcon},
        {label: 'Data Saver', Icon: DataSaverIcon},
      ],
    },
    {
      title: 'Actions',
      items: [
        {label: 'Report a problem', Icon: ReportProblemIcon, onPress: onReportProblem},
        {
          label: 'Delete account',
          Icon: FreeUpSpaceIcon,
          onPress: onRequestAccountDeletion,
        },
        {label: 'Add account', Icon: AddAccountIcon},
        {label: 'Log out', Icon: LogoutIcon, onPress: onLogout},
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <View style={styles.root}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingHorizontal: responsive.horizontalPadding,
              paddingTop: topInset,
            },
          ]}
          showsVerticalScrollIndicator={false}>
          <View
            style={[
              styles.contentWidth,
              {maxWidth: responsive.maxContentWidth},
            ]}>
            <View style={styles.headerRow}>
              <Pressable
                accessibilityRole="button"
                onPress={home.onMenuPress}
                style={styles.iconButton}>
                <MenuIcon height={22} width={32} />
              </Pressable>

              <Pressable
                accessibilityRole="button"
                onPress={home.onProfilePress}
                style={styles.profileButton}>
                <Text
                  style={styles.profileLabel}>{`Hello ${home.userName}.`}</Text>
                <View style={styles.profileImageWrap}>
                  <ProfilePic height="100%" width="100%" />
                </View>
              </Pressable>
            </View>

            {sections.map(section => (
              <View key={section.title} style={styles.sectionWrap}>
                <Text style={styles.sectionTitle}>{section.title}</Text>

                <View style={styles.sectionCard}>
                  {section.items.map(item => (
                    <SettingsRow
                      key={item.label}
                      Icon={item.Icon}
                      label={item.label}
                      onPress={item.onPress}
                    />
                  ))}
                </View>
              </View>
            ))}
          </View>
        </ScrollView>

        <AppBottomNav activeTab={activeTab} onTabPress={onTabPress} />
      </View>
    </SafeAreaView>
  );
};

type SettingsRowProps = {
  Icon: React.FC<any>;
  label: string;
  onPress?: () => void;
};

const SettingsRow: React.FC<SettingsRowProps> = ({Icon, label, onPress}) => {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={!onPress}
      onPress={onPress}
      style={({pressed}) => [
        styles.row,
        pressed && onPress ? styles.rowPressed : null,
      ]}>
      <View style={styles.rowIconWrap}>
        <Icon height={22} width={22} />
      </View>
      <Text style={styles.rowLabel}>{label}</Text>
    </Pressable>
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
  iconButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  profileImageWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    backgroundColor: '#ECECEC',
  },
  profileLabel: {
    color: colors.textPrimary,
    fontFamily: fonts.medium,
    fontSize: 13,
  },
  sectionWrap: {
    marginBottom: spacing.sm + 2,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 16,
    marginBottom: spacing.sm,
    marginLeft: 4,
  },
  sectionCard: {
    borderRadius: radii.md,
    backgroundColor: '#F4F2F6',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 42,
    borderRadius: 10,
    paddingHorizontal: spacing.sm,
  },
  rowPressed: {
    backgroundColor: 'rgba(63, 109, 95, 0.08)',
  },
  rowIconWrap: {
    width: 32,
    marginRight: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
    color: colors.textPrimary,
    fontFamily: fonts.medium,
    fontSize: 15,
  },
});
