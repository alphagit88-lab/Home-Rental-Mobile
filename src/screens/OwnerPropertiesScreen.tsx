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
import PlayIcon from '../assets/images/20 1.svg';
import {AppBottomNav, AppTab} from '../components/AppBottomNav';
import {OwnerPropertiesMap} from '../components/OwnerPropertiesMap';
import {useHomeScreen} from '../hooks/useHomeScreen';
import {useOwnerProperties} from '../hooks/useOwnerProperties';
import {useResponsive} from '../hooks/useResponsive';
import {PropertyRecord} from '../services/properties';
import {colors, fonts, radii, spacing} from '../theme';

type OwnerPropertiesScreenProps = {
  activeTab: AppTab;
  onAddNewPropertyPress: () => void;
  onViewPropertyPress: (property: PropertyRecord) => void;
  onTabPress: (tab: AppTab) => void;
};

export const OwnerPropertiesScreen: React.FC<OwnerPropertiesScreenProps> = ({
  activeTab,
  onAddNewPropertyPress,
  onViewPropertyPress,
  onTabPress,
}) => {
  const responsive = useResponsive();
  const home = useHomeScreen();
  const topInset = Platform.OS === 'android' ? spacing.xs : spacing.md;
  const {errorMessage: inlineMessage, loading, properties} = useOwnerProperties();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
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
                <Text style={styles.profileLabel}>{`Hello ${home.userName}.`}</Text>
                <View style={styles.profileImageWrap}>
                  <ProfilePic height="100%" width="100%" />
                </View>
              </Pressable>
            </View>

            <Pressable
              accessibilityRole="button"
              onPress={onAddNewPropertyPress}
              style={styles.addButton}>
              <Text style={styles.addButtonText}>ADD NEW PROPERTY</Text>
            </Pressable>

            <View style={styles.mapCard}>
              <View
                style={[
                  styles.mapWrap,
                  {height: responsive.isTablet ? 320 : 246},
                ]}>
                <OwnerPropertiesMap properties={properties} />
              </View>
            </View>

            {inlineMessage ? (
              <View style={styles.messageCard}>
                <Text style={styles.messageText}>{inlineMessage}</Text>
              </View>
            ) : null}

            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>My Properties</Text>

              {loading ? (
                <Text style={styles.loadingText}>Loading your properties...</Text>
              ) : properties.length === 0 ? (
                <Text style={styles.emptyListText}>
                  You have not added any properties yet.
                </Text>
              ) : (
                <View style={styles.propertyList}>
                  {properties.map(property => (
                    <OwnerPropertyCard
                      code={property.propertyCode}
                      key={property.id}
                      onPress={() => onViewPropertyPress(property)}
                      title={property.title}
                    />
                  ))}
                </View>
              )}
            </View>
          </View>
        </ScrollView>

        <AppBottomNav activeTab={activeTab} onTabPress={onTabPress} />
      </View>
    </SafeAreaView>
  );
};

type OwnerPropertyCardProps = {
  code: string;
  onPress: () => void;
  title: string;
};

const OwnerPropertyCard: React.FC<OwnerPropertyCardProps> = ({
  code,
  onPress,
  title,
}) => {
  return (
    <View style={styles.propertyCard}>
      <View style={styles.propertyTextWrap}>
        <Text numberOfLines={1} style={styles.propertyTitle}>
          {title}
        </Text>
        <Text style={styles.propertyCode}>{code}</Text>
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={({pressed}) => [
          styles.viewButton,
          pressed ? styles.pressed : null,
        ]}>
        <Text style={styles.viewButtonText}>View</Text>
        <View style={styles.playIconCircle}>
          <View style={styles.playIconGlyphWrap}>
            <PlayIcon height={10} style={styles.playIconRight} width={10} />
          </View>
        </View>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingBottom: 146,
  },
  contentWidth: {
    width: '100%',
    alignSelf: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
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
  addButton: {
    minHeight: 56,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  addButtonText: {
    color: colors.white,
    fontFamily: fonts.semibold,
    fontSize: 14,
    letterSpacing: 0.4,
  },
  mapCard: {
    backgroundColor: '#FCF4E9',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5D4BF',
    padding: spacing.sm + 2,
    marginBottom: spacing.sm,
  },
  mapWrap: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  messageCard: {
    borderRadius: 12,
    backgroundColor: '#F4E8D8',
    borderWidth: 1,
    borderColor: '#E0CFB7',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    marginBottom: spacing.sm,
  },
  messageText: {
    color: colors.textSecondary,
    fontFamily: fonts.medium,
    fontSize: 12,
    lineHeight: 18,
  },
  sectionCard: {
    backgroundColor: '#FCF4E9',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5D4BF',
    padding: spacing.md,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.medium,
    fontSize: 18,
    marginBottom: spacing.md,
  },
  loadingText: {
    color: colors.textSecondary,
    fontFamily: fonts.medium,
    fontSize: 14,
  },
  emptyListText: {
    color: colors.textSecondary,
    fontFamily: fonts.medium,
    fontSize: 14,
    lineHeight: 20,
  },
  propertyList: {
    gap: spacing.sm,
  },
  propertyCard: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm + 4,
    gap: spacing.sm,
  },
  propertyTextWrap: {
    flex: 1,
  },
  propertyTitle: {
    color: colors.white,
    fontFamily: fonts.bold,
    fontSize: 14,
    marginBottom: 2,
  },
  propertyCode: {
    color: '#E3E9E6',
    fontFamily: fonts.regular,
    fontSize: 12,
  },
  viewButton: {
    minHeight: 28,
    borderRadius: radii.pill,
    backgroundColor: colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingLeft: spacing.sm + 4,
    paddingRight: spacing.sm,
  },
  viewButtonText: {
    color: colors.white,
    fontFamily: fonts.medium,
    fontSize: 12,
  },
  playIconCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIconGlyphWrap: {
    width: 10,
    height: 10,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  playIconRight: {
    transform: [{rotate: '-90deg'}],
    marginLeft: 1,
  },
  pressed: {
    opacity: 0.86,
  },
});
