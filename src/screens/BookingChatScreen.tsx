import React, {useEffect, useRef, useState} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import LeftArrowIcon from '../assets/images/left-arrow 2.svg';
import {useResponsive} from '../hooks/useResponsive';
import {getAuthSession} from '../services/authSession';
import {
  BookingMessageRecord,
  getBookingMessages,
  sendBookingMessage,
} from '../services/bookingMessages';
import {BookingRecord} from '../services/bookings';
import {colors, fonts, radii, spacing} from '../theme';

type BookingChatScreenProps = {
  booking: BookingRecord;
  onBack: () => void;
  viewerRole: 'tenant' | 'owner';
};

const CHAT_REFRESH_INTERVAL_MS = 5000;

const formatMessageTime = (value: string | null) => {
  if (!value) {
    return '';
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return '';
  }

  return parsedDate.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });
};

export const BookingChatScreen: React.FC<BookingChatScreenProps> = ({
  booking,
  onBack,
  viewerRole,
}) => {
  const responsive = useResponsive();
  const session = getAuthSession();
  const scrollViewRef = useRef<ScrollView | null>(null);
  const [messages, setMessages] = useState<BookingMessageRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [messageDraft, setMessageDraft] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const partnerLabel = viewerRole === 'tenant' ? 'Owner' : 'Tenant';
  const partnerName =
    viewerRole === 'tenant'
      ? booking.ownerName?.trim() || 'Owner'
      : booking.tenantName?.trim() || 'Tenant';

  const fetchMessages = async (showLoader = false) => {
    const token = session?.token;

    if (!token) {
      setErrorMessage('Sign in again to open this booking chat.');
      setLoading(false);
      return;
    }

    if (showLoader) {
      setLoading(true);
    }

    try {
      const nextMessages = await getBookingMessages(token, booking.id);
      setMessages(nextMessages);
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Unable to load booking messages right now.',
      );
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    void fetchMessages(true);

    const intervalId: ReturnType<typeof setInterval> = setInterval(() => {
      void fetchMessages(false);
    }, CHAT_REFRESH_INTERVAL_MS);

    return () => {
      clearInterval(intervalId);
    };
  }, [booking.id, session?.token]);

  const handleSendMessage = async () => {
    const token = session?.token;
    const trimmedMessage = messageDraft.trim();

    if (!token) {
      setErrorMessage('Sign in again to send a message.');
      return;
    }

    if (!trimmedMessage) {
      setErrorMessage('Type a message before sending.');
      return;
    }

    setSending(true);
    setErrorMessage(null);

    try {
      const createdMessage = await sendBookingMessage(token, booking.id, {
        messageText: trimmedMessage,
      });

      setMessages(currentMessages => {
        if (currentMessages.some(message => message.id === createdMessage.id)) {
          return currentMessages;
        }

        return [...currentMessages, createdMessage];
      });
      setMessageDraft('');
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Unable to send your message right now.',
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.root}>
        <View
          style={[
            styles.contentWidth,
            {
              maxWidth: responsive.maxContentWidth,
              paddingHorizontal: responsive.horizontalPadding,
            },
          ]}>
          <View style={styles.headerRow}>
            <Pressable
              accessibilityRole="button"
              onPress={onBack}
              style={styles.backButton}>
              <LeftArrowIcon height={18} width={18} />
            </Pressable>

            <View style={styles.headerTextWrap}>
              <Text style={styles.headerTitle}>Booking Chat</Text>
              <Text style={styles.headerSubtitle}>{`${partnerLabel}: ${partnerName}`}</Text>
            </View>

            <Pressable
              accessibilityRole="button"
              onPress={() => {
                void fetchMessages(true);
              }}
              style={styles.refreshButton}>
              <Text style={styles.refreshButtonText}>Refresh</Text>
            </Pressable>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryEyebrow}>{booking.bookingCode}</Text>
            <Text style={styles.summaryTitle}>{booking.propertyTitle}</Text>
            <Text style={styles.summaryText}>
              Messages stay linked to this booking so the owner and tenant can
              coordinate in one place.
            </Text>
          </View>

          <View style={styles.chatCard}>
            <ScrollView
              contentContainerStyle={styles.chatListContent}
              onContentSizeChange={() =>
                scrollViewRef.current?.scrollToEnd({animated: messages.length > 0})
              }
              ref={scrollViewRef}
              showsVerticalScrollIndicator={false}
              style={styles.chatList}>
              {loading ? (
                <Text style={styles.stateText}>Loading conversation...</Text>
              ) : messages.length === 0 ? (
                <Text style={styles.stateText}>
                  Start the conversation with the {partnerLabel.toLowerCase()} about
                  check-in details, keys, or booking questions.
                </Text>
              ) : (
                messages.map(message => {
                  const outgoing = session?.user.id === message.senderId;

                  return (
                    <View
                      key={message.id}
                      style={[
                        styles.messageRow,
                        outgoing ? styles.messageRowOutgoing : null,
                      ]}>
                      <View
                        style={[
                          styles.messageBubble,
                          outgoing
                            ? styles.messageBubbleOutgoing
                            : styles.messageBubbleIncoming,
                        ]}>
                        <Text
                          style={[
                            styles.messageBody,
                            outgoing ? styles.messageBodyOutgoing : null,
                          ]}>
                          {message.messageText}
                        </Text>
                        <Text
                          style={[
                            styles.messageMeta,
                            outgoing ? styles.messageMetaOutgoing : null,
                          ]}>
                          {`${outgoing ? 'You' : message.senderName ?? partnerName} - ${formatMessageTime(
                            message.createdAt,
                          )}`}
                        </Text>
                      </View>
                    </View>
                  );
                })
              )}
            </ScrollView>

            {errorMessage ? (
              <View style={styles.errorCard}>
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            <View style={styles.composerRow}>
              <TextInput
                maxLength={2000}
                multiline
                onChangeText={setMessageDraft}
                placeholder={`Message the ${partnerLabel.toLowerCase()}`}
                placeholderTextColor={colors.textSecondary}
                style={styles.composerInput}
                textAlignVertical="top"
                value={messageDraft}
              />
              <Pressable
                accessibilityRole="button"
                disabled={sending || !messageDraft.trim()}
                onPress={() => {
                  void handleSendMessage();
                }}
                style={[
                  styles.sendButton,
                  sending || !messageDraft.trim() ? styles.sendButtonDisabled : null,
                ]}>
                <Text style={styles.sendButtonText}>
                  {sending ? 'Sending' : 'Send'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
  contentWidth: {
    flex: 1,
    width: '100%',
    alignSelf: 'center',
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) + 8 : 16,
    paddingBottom: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerTextWrap: {
    flex: 1,
  },
  headerTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 18,
    marginBottom: 2,
  },
  headerSubtitle: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 12,
  },
  refreshButton: {
    minHeight: 34,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: '#D8CDBE',
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  refreshButtonText: {
    color: colors.textPrimary,
    fontFamily: fonts.medium,
    fontSize: 12,
  },
  summaryCard: {
    borderRadius: 18,
    backgroundColor: '#173C35',
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  summaryEyebrow: {
    color: '#BFD5CD',
    fontFamily: fonts.medium,
    fontSize: 12,
    marginBottom: 4,
  },
  summaryTitle: {
    color: colors.white,
    fontFamily: fonts.heavy,
    fontSize: 22,
    marginBottom: 6,
  },
  summaryText: {
    color: '#D9E7E1',
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 20,
  },
  chatCard: {
    flex: 1,
    borderRadius: 18,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#E5DCD2',
    padding: spacing.md,
  },
  chatList: {
    flex: 1,
  },
  chatListContent: {
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  stateText: {
    color: colors.textSecondary,
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 20,
  },
  messageRow: {
    width: '100%',
    alignItems: 'flex-start',
  },
  messageRowOutgoing: {
    alignItems: 'flex-end',
  },
  messageBubble: {
    maxWidth: '84%',
    borderRadius: 18,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  messageBubbleIncoming: {
    backgroundColor: '#F7F2EB',
    borderTopLeftRadius: 6,
  },
  messageBubbleOutgoing: {
    backgroundColor: colors.primary,
    borderTopRightRadius: 6,
  },
  messageBody: {
    color: colors.textPrimary,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 6,
  },
  messageBodyOutgoing: {
    color: colors.white,
  },
  messageMeta: {
    color: '#6F675F',
    fontFamily: fonts.medium,
    fontSize: 11,
  },
  messageMetaOutgoing: {
    color: '#D3E3DD',
  },
  errorCard: {
    borderRadius: 12,
    backgroundColor: '#FFF2F2',
    borderWidth: 1,
    borderColor: '#F0C7C7',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginTop: spacing.sm,
  },
  errorText: {
    color: colors.error,
    fontFamily: fonts.medium,
    fontSize: 12,
    lineHeight: 18,
  },
  composerRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  composerInput: {
    flex: 1,
    minHeight: 56,
    maxHeight: 132,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D8CDBE',
    backgroundColor: '#FBF8F4',
    color: colors.textPrimary,
    fontFamily: fonts.regular,
    fontSize: 14,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
  },
  sendButton: {
    minWidth: 78,
    minHeight: 56,
    borderRadius: 16,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  sendButtonDisabled: {
    opacity: 0.55,
  },
  sendButtonText: {
    color: colors.white,
    fontFamily: fonts.bold,
    fontSize: 14,
  },
});
