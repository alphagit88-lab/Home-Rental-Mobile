import React, {useEffect, useMemo, useState} from 'react';
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
import {useOwnerBookings} from '../hooks/useOwnerBookings';
import {useHomeScreen} from '../hooks/useHomeScreen';
import {useResponsive} from '../hooks/useResponsive';
import {BookingRecord} from '../services/bookings';
import {colors, fonts, radii, spacing} from '../theme';
import {
  addDaysToIsoDate,
  buildCalendarGrid,
  buildVisibleMonthEntries,
  formatCalendarDate,
  getEndOfMonthIsoDate,
  getStartOfMonthIsoDate,
  getTodayIsoDate,
  iterateStayDates,
  weekdayLabels,
} from '../utils/bookingCalendar';
import {
  formatBookingDateLabel,
  formatBookingPaymentStatusLabel,
  formatBookingRange,
  formatBookingServiceRequestSummary,
  formatBookingStatusLabel,
} from '../utils/bookingPresentation';
import {BookingDetailsScreen} from './BookingDetailsScreen';
import MenuIcon from '../assets/images/menu 1.svg';
import ProfilePic from '../assets/images/profile_pic.svg';
import PlayIcon from '../assets/images/20 1.svg';
import CalendarDropdownIcon from '../assets/images/Vector 13.svg';

type OwnerBookingsScreenProps = {
  activeTab: AppTab;
  onTabPress: (tab: AppTab) => void;
};

type QuickFilter = 'last8Days' | 'lastMonth' | 'today' | null;

const isDateInWindow = (value: string, from: string, to: string) =>
  value >= from && value <= to;

export const OwnerBookingsScreen: React.FC<OwnerBookingsScreenProps> = ({
  activeTab,
  onTabPress,
}) => {
  const responsive = useResponsive();
  const home = useHomeScreen();
  const topInset = Platform.OS === 'android' ? spacing.xs : spacing.md;
  const today = new Date();
  const todayIsoDate = getTodayIsoDate();
  const [selectedYear, setSelectedYear] = useState(today.getUTCFullYear());
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(
    today.getUTCMonth(),
  );
  const [selectedDay, setSelectedDay] = useState<string | null>(todayIsoDate);
  const [quickFilter, setQuickFilter] = useState<QuickFilter>('today');
  const visibleMonths = useMemo(
    () => buildVisibleMonthEntries(selectedYear, selectedMonthIndex),
    [selectedMonthIndex, selectedYear],
  );
  const queryFrom = getStartOfMonthIsoDate(
    visibleMonths[0].year,
    visibleMonths[0].monthIndex,
  );
  const lastVisibleMonth = visibleMonths[visibleMonths.length - 1];
  const queryTo = getEndOfMonthIsoDate(
    lastVisibleMonth.year,
    lastVisibleMonth.monthIndex,
  );
  const {
    bookings,
    errorMessage,
    loading,
    reload,
  } = useOwnerBookings({from: queryFrom, to: queryTo});
  const [bookingOverrides, setBookingOverrides] = useState<
    Record<number, BookingRecord>
  >({});
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);
  const selectedMonthStart = getStartOfMonthIsoDate(selectedYear, selectedMonthIndex);
  const selectedMonthEnd = getEndOfMonthIsoDate(selectedYear, selectedMonthIndex);
  const last8DaysStart = addDaysToIsoDate(todayIsoDate, -7) ?? todayIsoDate;
  const previousMonthDate = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - 1, 1),
  );
  const previousMonthStart = getStartOfMonthIsoDate(
    previousMonthDate.getUTCFullYear(),
    previousMonthDate.getUTCMonth(),
  );
  const previousMonthEnd = getEndOfMonthIsoDate(
    previousMonthDate.getUTCFullYear(),
    previousMonthDate.getUTCMonth(),
  );
  useEffect(() => {
    setBookingOverrides({});
  }, [bookings]);
  const effectiveBookings = useMemo(
    () => bookings.map(booking => bookingOverrides[booking.id] ?? booking),
    [bookingOverrides, bookings],
  );
  const visibleBookings = useMemo(
    () =>
      effectiveBookings
        .filter(booking => {
          const stayDates = iterateStayDates(booking.checkIn, booking.checkOut);

          if (stayDates.length === 0) {
            return false;
          }

          if (selectedDay) {
            return stayDates.includes(selectedDay);
          }

          if (quickFilter === 'today') {
            return stayDates.includes(todayIsoDate);
          }

          if (quickFilter === 'last8Days') {
            return stayDates.some(date =>
              isDateInWindow(date, last8DaysStart, todayIsoDate),
            );
          }

          if (quickFilter === 'lastMonth') {
            return stayDates.some(date =>
              isDateInWindow(date, previousMonthStart, previousMonthEnd),
            );
          }

          return stayDates.some(date =>
            isDateInWindow(date, selectedMonthStart, selectedMonthEnd),
          );
        })
        .sort((first, second) => first.checkIn.localeCompare(second.checkIn)),
    [
      effectiveBookings,
      last8DaysStart,
      previousMonthEnd,
      previousMonthStart,
      quickFilter,
      selectedDay,
      selectedMonthEnd,
      selectedMonthStart,
      todayIsoDate,
    ],
  );
  const bookedDateCounts = useMemo(() => {
    const dateCounts = new Map<string, number>();

    effectiveBookings.forEach(booking => {
      iterateStayDates(booking.checkIn, booking.checkOut).forEach(date => {
        if (!isDateInWindow(date, selectedMonthStart, selectedMonthEnd)) {
          return;
        }

        dateCounts.set(date, (dateCounts.get(date) ?? 0) + 1);
      });
    });

    return dateCounts;
  }, [effectiveBookings, selectedMonthEnd, selectedMonthStart]);
  const calendarDays = useMemo(() => {
    const daySlots = buildCalendarGrid(selectedYear, selectedMonthIndex);

    return daySlots.map((day, index) => {
      if (day === null) {
        return {
          id: `empty-${index}`,
          label: '',
          muted: true,
          value: null,
        };
      }

      const dateValue = formatCalendarDate(selectedYear, selectedMonthIndex, day);

      return {
        bookingCount: bookedDateCounts.get(dateValue) ?? 0,
        id: dateValue,
        label: String(day),
        muted: false,
        selected:
          (selectedDay && selectedDay === dateValue) ||
          (!selectedDay && quickFilter === 'today' && dateValue === todayIsoDate),
        value: dateValue,
      };
    });
  }, [
    bookedDateCounts,
    quickFilter,
    selectedDay,
    selectedMonthIndex,
    selectedYear,
    todayIsoDate,
  ]);
  const selectedBooking = useMemo(
    () =>
      selectedBookingId === null
        ? null
        : effectiveBookings.find(booking => booking.id === selectedBookingId) ?? null,
    [effectiveBookings, selectedBookingId],
  );

  if (selectedBooking) {
    return (
      <BookingDetailsScreen
        activeTab={activeTab}
        booking={selectedBooking}
        onBack={() => setSelectedBookingId(null)}
        onBookingUpdated={updatedBooking =>
          setBookingOverrides(current => ({
            ...current,
            [updatedBooking.id]: updatedBooking,
          }))
        }
        onTabPress={tab => {
          setSelectedBookingId(null);
          onTabPress(tab);
        }}
        viewerRole="owner"
      />
    );
  }

  const handleQuickFilterPress = (value: QuickFilter) => {
    if (value === 'today') {
      setSelectedYear(today.getUTCFullYear());
      setSelectedMonthIndex(today.getUTCMonth());
      setSelectedDay(todayIsoDate);
      setQuickFilter('today');
      return;
    }

    if (value === 'lastMonth') {
      setSelectedYear(previousMonthDate.getUTCFullYear());
      setSelectedMonthIndex(previousMonthDate.getUTCMonth());
      setSelectedDay(null);
      setQuickFilter('lastMonth');
      return;
    }

    setSelectedYear(today.getUTCFullYear());
    setSelectedMonthIndex(today.getUTCMonth());
    setSelectedDay(null);
    setQuickFilter(value);
  };

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
                  <FilterPill
                    label="Today"
                    onPress={() => handleQuickFilterPress('today')}
                    selected={quickFilter === 'today'}
                  />
                  <FilterPill
                    label="Last 8 days"
                    onPress={() => handleQuickFilterPress('last8Days')}
                    selected={quickFilter === 'last8Days'}
                  />
                  <FilterPill
                    label="Last month"
                    onPress={() => handleQuickFilterPress('lastMonth')}
                    selected={quickFilter === 'lastMonth'}
                  />
                </View>

                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    const nextMonthDate = new Date(
                      Date.UTC(selectedYear, selectedMonthIndex + 1, 1),
                    );
                    setSelectedYear(nextMonthDate.getUTCFullYear());
                    setSelectedMonthIndex(nextMonthDate.getUTCMonth());
                    setSelectedDay(null);
                    setQuickFilter(null);
                  }}
                  style={styles.dropdownButton}>
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
                      <Pressable
                        accessibilityRole="button"
                        disabled={!day.value}
                        key={day.id}
                        onPress={() => {
                          if (!day.value) {
                            return;
                          }

                          setSelectedDay(day.value);
                          setQuickFilter(null);
                        }}
                        style={[
                          styles.dayCell,
                          day.selected ? styles.dayCellSelected : null,
                          day.muted ? styles.dayCellMuted : null,
                          (day.bookingCount ?? 0) > 0 ? styles.dayCellBooked : null,
                        ]}>
                        <Text
                          style={[
                            styles.dayCellText,
                            day.selected ? styles.dayCellTextSelected : null,
                            day.muted ? styles.dayCellTextMuted : null,
                          ]}>
                          {day.label}
                        </Text>
                        {(day.bookingCount ?? 0) > 0 ? (
                          <View
                            style={[
                              styles.dayIndicator,
                              day.selected ? styles.dayIndicatorSelected : null,
                            ]}
                          />
                        ) : null}
                      </Pressable>
                    ))}
                  </View>
                </View>

                <View style={styles.monthColumn}>
                  {visibleMonths.map(month => (
                    <Pressable
                      accessibilityRole="button"
                      key={month.key}
                      onPress={() => {
                        setSelectedYear(month.year);
                        setSelectedMonthIndex(month.monthIndex);
                        setSelectedDay(null);
                        setQuickFilter(null);
                      }}
                      style={[
                        styles.monthRow,
                        month.year === selectedYear &&
                        month.monthIndex === selectedMonthIndex
                          ? styles.monthRowActive
                          : null,
                      ]}>
                      <Text
                        style={[
                          styles.monthText,
                          month.year === selectedYear &&
                          month.monthIndex === selectedMonthIndex
                            ? styles.monthTextActive
                            : null,
                          month.year !== selectedYear ||
                          month.monthIndex !== selectedMonthIndex
                            ? styles.monthTextMuted
                            : null,
                        ]}>
                        {month.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <View style={styles.calendarFooter}>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    setSelectedYear(today.getUTCFullYear());
                    setSelectedMonthIndex(today.getUTCMonth());
                    setSelectedDay(null);
                    setQuickFilter(null);
                  }}
                  style={styles.clearButton}>
                  <Text style={styles.clearButtonText}>Clear</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    void reload();
                  }}
                  style={styles.applyButton}>
                  <Text style={styles.applyButtonText}>Apply</Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.bookingsCard}>
              <Text style={styles.bookingsTitle}>Bookings</Text>

              <View style={styles.bookingList}>
                {loading ? (
                  <Text style={styles.stateText}>Loading your bookings...</Text>
                ) : errorMessage ? (
                  <Text style={styles.stateText}>{errorMessage}</Text>
                ) : visibleBookings.length === 0 ? (
                  <Text style={styles.stateText}>
                    No bookings match the selected calendar view.
                  </Text>
                ) : (
                  visibleBookings.map(booking => (
                    <BookingListItem
                      key={booking.id}
                      onPress={() => setSelectedBookingId(booking.id)}
                      subtitle={`${formatBookingStatusLabel(
                        booking.bookingStatus,
                      )} | ${formatBookingPaymentStatusLabel(
                        booking.paymentStatus,
                      )} | ${booking.tenantName ?? 'Tenant'} | ${formatBookingRange(
                        booking.checkIn,
                        booking.checkOut,
                      )} | ${formatBookingServiceRequestSummary(
                        booking.serviceRequests,
                      )}`}
                      title={booking.propertyTitle}
                      trailingLabel={formatBookingDateLabel(booking.createdAt)}
                    />
                  ))
                )}
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
  onPress: () => void;
  selected?: boolean;
};

const FilterPill: React.FC<FilterPillProps> = ({label, onPress, selected}) => {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[
        styles.filterPill,
        selected ? styles.filterPillSelected : null,
      ]}>
      <Text
        style={[
          styles.filterPillText,
          selected ? styles.filterPillTextSelected : null,
        ]}>
        {label}
      </Text>
    </Pressable>
  );
};

type BookingListItemProps = {
  onPress: () => void;
  subtitle: string;
  trailingLabel: string;
  title: string;
};

const BookingListItem: React.FC<BookingListItemProps> = ({
  onPress,
  subtitle,
  title,
  trailingLabel,
}) => {
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

      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={styles.viewButton}>
        <Text numberOfLines={1} style={styles.viewButtonText}>
          {trailingLabel}
        </Text>
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
  dayCellBooked: {
    position: 'relative',
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
  dayIndicator: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginTop: 4,
  },
  dayIndicatorSelected: {
    backgroundColor: colors.white,
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
  stateText: {
    color: colors.textSecondary,
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 20,
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
    minWidth: 116,
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
    fontSize: 10,
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
