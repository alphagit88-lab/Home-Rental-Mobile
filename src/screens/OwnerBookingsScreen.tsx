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
import {AppBottomNav, AppTab} from '../components/AppBottomNav';
import {useHomeScreen} from '../hooks/useHomeScreen';
import {useResponsive} from '../hooks/useResponsive';
import {colors, fonts, radii, spacing} from '../theme';
import MenuIcon from '../assets/images/menu 1.svg';
import ProfilePic from '../assets/images/profile_pic.svg';
import PlayIcon from '../assets/images/20 1.svg';
import CalendarDropdownIcon from '../assets/images/Vector 13.svg';

type OwnerBookingsScreenProps = {
  activeTab: AppTab;
  onTabPress: (tab: AppTab) => void;
};

type CalendarDay = {
  id: string;
  label: string;
  muted?: boolean;
  selected?: boolean;
};

type OwnerBooking = {
  id: string;
  subtitle: string;
  title: string;
};

const weekdayLabels = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const calendarDays: CalendarDay[] = [
  {id: 'd-27', label: '27', muted: true},
  {id: 'd-28', label: '28', muted: true},
  {id: 'd-01', label: '1', muted: true},
  {id: 'd-02', label: '2', muted: true},
  {id: 'd-03', label: '3', muted: true},
  {id: 'd-04', label: '4', muted: true},
  {id: 'd-05', label: '5', muted: true},
  {id: 'd-06', label: '6', muted: true},
  {id: 'd-07', label: '7', muted: true},
  {id: 'd-08', label: '8', muted: true},
  {id: 'd-09', label: '9', muted: true},
  {id: 'd-10', label: '10', muted: true},
  {id: 'd-11', label: '11', muted: true},
  {id: 'd-12', label: '12', muted: true},
  {id: 'd-13', label: '13', muted: true},
  {id: 'd-14', label: '14', selected: true},
  {id: 'd-15', label: '15'},
  {id: 'd-16', label: '16'},
  {id: 'd-17', label: '17'},
  {id: 'd-18', label: '18'},
  {id: 'd-19', label: '19'},
  {id: 'd-20', label: '20'},
  {id: 'd-21', label: '21'},
  {id: 'd-22', label: '22'},
  {id: 'd-23', label: '23'},
  {id: 'd-24', label: '24'},
  {id: 'd-25', label: '25'},
  {id: 'd-26', label: '26'},
  {id: 'd-27b', label: '27'},
  {id: 'd-28b', label: '28'},
  {id: 'd-29', label: '29'},
  {id: 'd-30', label: '30'},
  {id: 'd-31', label: '31'},
  {id: 'd-01b', label: '1', muted: true},
  {id: 'd-02b', label: '2', muted: true},
];

const monthLabels = ['Jul', 'Jun', 'Mai', 'Apr', 'Mar', 'Feb', 'Jan', 'Dec', 'Nov'];

const ownerBookings: OwnerBooking[] = [
  {
    id: 'booking-1',
    title: 'Colombo Lux House',
    subtitle: 'Move-in 2026 FEB 26',
  },
  {
    id: 'booking-2',
    title: 'Colombo Lux House',
    subtitle: 'Move-in 2026 FEB 26',
  },
  {
    id: 'booking-3',
    title: 'Colombo Lux House',
    subtitle: 'Move-in 2026 FEB 26',
  },
  {
    id: 'booking-4',
    title: 'Colombo Lux House',
    subtitle: 'Move-in 2026 FEB 26',
  },
];

export const OwnerBookingsScreen: React.FC<OwnerBookingsScreenProps> = ({
  activeTab,
  onTabPress,
}) => {
  const responsive = useResponsive();
  const home = useHomeScreen();
  const topInset = Platform.OS === 'android' ? spacing.xs : spacing.md;

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

            <View style={styles.calendarCard}>
              <View style={styles.calendarHeader}>
                <Text style={styles.calendarTitle}>Booking Calendar</Text>
              </View>

              <View style={styles.calendarToolbar}>
                <View style={styles.filterPillRow}>
                  <FilterPill label="Today" selected />
                  <FilterPill label="Last 8 days" />
                  <FilterPill label="Last month" />
                </View>

                <Pressable accessibilityRole="button" style={styles.dropdownButton}>
                  <CalendarDropdownIcon height={8} width={10} />
                </Pressable>
              </View>

              <View style={styles.calendarBody}>
                <View style={styles.calendarGridWrap}>
                  <View style={styles.weekdayRow}>
                    {weekdayLabels.map(label => (
                      <Text key={label} style={styles.weekdayText}>
                        {label}
                      </Text>
                    ))}
                  </View>

                  <View style={styles.daysGrid}>
                    {calendarDays.map(day => (
                      <View
                        key={day.id}
                        style={[
                          styles.dayCell,
                          day.selected ? styles.dayCellSelected : null,
                          day.muted ? styles.dayCellMuted : null,
                        ]}>
                        <Text
                          style={[
                            styles.dayCellText,
                            day.selected ? styles.dayCellTextSelected : null,
                            day.muted ? styles.dayCellTextMuted : null,
                          ]}>
                          {day.label}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>

                <View style={styles.monthColumn}>
                  {monthLabels.map(label => (
                    <View
                      key={label}
                      style={[
                        styles.monthRow,
                        label === 'Mar' ? styles.monthRowActive : null,
                      ]}>
                      <Text
                        style={[
                          styles.monthText,
                          label === 'Mar' ? styles.monthTextActive : null,
                          label !== 'Mar' ? styles.monthTextMuted : null,
                        ]}>
                        {label}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.calendarFooter}>
                <Pressable accessibilityRole="button" style={styles.clearButton}>
                  <Text style={styles.clearButtonText}>Clear</Text>
                </Pressable>
                <Pressable accessibilityRole="button" style={styles.applyButton}>
                  <Text style={styles.applyButtonText}>Apply</Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.bookingsCard}>
              <Text style={styles.bookingsTitle}>Bookings</Text>

              <View style={styles.bookingList}>
                {ownerBookings.map(booking => (
                  <BookingListItem
                    key={booking.id}
                    subtitle={booking.subtitle}
                    title={booking.title}
                  />
                ))}
              </View>
            </View>
          </View>
        </ScrollView>

        <AppBottomNav activeTab={activeTab} onTabPress={onTabPress} />
      </View>
    </SafeAreaView>
  );
};

type FilterPillProps = {
  label: string;
  selected?: boolean;
};

const FilterPill: React.FC<FilterPillProps> = ({label, selected}) => {
  return (
    <View style={[styles.filterPill, selected ? styles.filterPillSelected : null]}>
      <Text
        style={[
          styles.filterPillText,
          selected ? styles.filterPillTextSelected : null,
        ]}>
        {label}
      </Text>
    </View>
  );
};

type BookingListItemProps = {
  subtitle: string;
  title: string;
};

const BookingListItem: React.FC<BookingListItemProps> = ({subtitle, title}) => {
  return (
    <View style={styles.bookingItem}>
      <View style={styles.bookingItemTextWrap}>
        <Text numberOfLines={1} style={styles.bookingItemTitle}>
          {title}
        </Text>
        <Text numberOfLines={1} style={styles.bookingItemSubtitle}>
          {subtitle}
        </Text>
      </View>

      <Pressable accessibilityRole="button" style={styles.viewButton}>
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
  calendarCard: {
    backgroundColor: colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D9D9D9',
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  calendarHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#E8E2DA',
    paddingVertical: spacing.md + 2,
    alignItems: 'center',
  },
  calendarTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.medium,
    fontSize: 18,
  },
  calendarToolbar: {
    borderBottomWidth: 1,
    borderBottomColor: '#E8E2DA',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
  },
  filterPillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flex: 1,
    flexWrap: 'wrap',
  },
  filterPill: {
    minHeight: 24,
    borderRadius: radii.pill,
    backgroundColor: '#F3F1EE',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm + 4,
  },
  filterPillSelected: {
    backgroundColor: '#F3F1EE',
  },
  filterPillText: {
    color: colors.textPrimary,
    fontFamily: fonts.regular,
    fontSize: 12,
  },
  filterPillTextSelected: {
    fontFamily: fonts.medium,
  },
  dropdownButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F3F1EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarBody: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
  },
  calendarGridWrap: {
    flex: 1,
  },
  weekdayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  weekdayText: {
    width: 32,
    textAlign: 'center',
    color: colors.textPrimary,
    fontFamily: fonts.regular,
    fontSize: 12,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: spacing.sm,
  },
  dayCell: {
    width: '14.28%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCellSelected: {
    paddingVertical: 0,
  },
  dayCellMuted: {
    opacity: 0.48,
  },
  dayCellText: {
    width: 28,
    height: 28,
    borderRadius: 14,
    textAlign: 'center',
    textAlignVertical: 'center',
    includeFontPadding: false,
    lineHeight: 28,
    color: colors.textPrimary,
    fontFamily: fonts.regular,
    fontSize: 12,
  },
  dayCellTextSelected: {
    backgroundColor: colors.accent,
    color: colors.white,
    fontFamily: fonts.medium,
  },
  dayCellTextMuted: {
    backgroundColor: '#F3F1EE',
    color: '#BFBFBF',
  },
  monthColumn: {
    width: 40,
    alignItems: 'stretch',
    paddingTop: 2,
  },
  monthRow: {
    paddingVertical: 3,
    alignItems: 'flex-start',
  },
  monthRowActive: {
    borderTopWidth: 1,
    borderTopColor: '#D5D0C9',
    borderBottomWidth: 1,
    borderBottomColor: '#D5D0C9',
    marginVertical: 4,
    paddingVertical: spacing.sm,
  },
  monthText: {
    fontFamily: fonts.regular,
    fontSize: 12,
  },
  monthTextActive: {
    color: colors.textPrimary,
    fontFamily: fonts.semibold,
    fontSize: 16,
  },
  monthTextMuted: {
    color: '#B8B8B8',
  },
  calendarFooter: {
    borderTopWidth: 1,
    borderTopColor: '#E8E2DA',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  clearButton: {
    minWidth: 56,
    minHeight: 30,
    borderRadius: 10,
    backgroundColor: '#F2F2F2',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  clearButtonText: {
    color: '#AFAFAF',
    fontFamily: fonts.regular,
    fontSize: 14,
  },
  applyButton: {
    minWidth: 56,
    minHeight: 30,
    borderRadius: 10,
    backgroundColor: '#1F7CF1',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  applyButtonText: {
    color: colors.white,
    fontFamily: fonts.medium,
    fontSize: 14,
  },
  bookingsCard: {
    backgroundColor: '#FCF4E9',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5D4BF',
    padding: spacing.md,
  },
  bookingsTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.medium,
    fontSize: 18,
    marginBottom: spacing.md,
  },
  bookingList: {
    gap: spacing.sm,
  },
  bookingItem: {
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
  bookingItemTextWrap: {
    flex: 1,
  },
  bookingItemTitle: {
    color: colors.white,
    fontFamily: fonts.bold,
    fontSize: 14,
    marginBottom: 2,
  },
  bookingItemSubtitle: {
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
});
