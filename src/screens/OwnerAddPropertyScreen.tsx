import React, {useState} from 'react';
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
import {AppBottomNav, AppTab} from '../components/AppBottomNav';
import {useResponsive} from '../hooks/useResponsive';
import {colors, fonts, spacing} from '../theme';
import BackIcon from '../assets/images/left-arrow 2.svg';
import DropdownIcon from '../assets/images/Vector 13.svg';

type OwnerAddPropertyScreenProps = {
  activeTab: AppTab;
  headerTitle?: string;
  onBackPress: () => void;
  onSubmitPress?: () => void;
  onTabPress: (tab: AppTab) => void;
  submitLabel?: string;
};

type SelectFieldProps = {
  label: string;
  value: string;
};

type TextFieldProps = {
  keyboardType?: 'default' | 'number-pad';
  label: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  value: string;
};

type LargeFieldProps = {
  label: string;
  minHeight: number;
  onChangeText: (value: string) => void;
  placeholder: string;
  value: string;
};

export const OwnerAddPropertyScreen: React.FC<OwnerAddPropertyScreenProps> = ({
  activeTab,
  headerTitle = 'Add new Property',
  onBackPress,
  onSubmitPress,
  onTabPress,
  submitLabel = 'ADD NEW PROPERTY',
}) => {
  const responsive = useResponsive();
  const [propertyName, setPropertyName] = useState('');
  const [bedrooms, setBedrooms] = useState('01');
  const [bathrooms, setBathrooms] = useState('01');
  const [location, setLocation] = useState('');
  const [gallery, setGallery] = useState('');
  const [description, setDescription] = useState('');

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}>
        <View style={styles.root}>
          <View style={styles.header}>
            <View
              style={[
                styles.headerContent,
                {paddingHorizontal: responsive.horizontalPadding},
              ]}>
              <Pressable
                accessibilityRole="button"
                hitSlop={10}
                onPress={onBackPress}
                style={styles.backButton}>
                <BackIcon height={18} width={18} />
              </Pressable>

              <Text style={styles.headerTitle}>{headerTitle}</Text>

              <View style={styles.headerSpacer} />
            </View>
          </View>

          <ScrollView
            contentContainerStyle={[
              styles.scrollContent,
              {
                paddingHorizontal: responsive.horizontalPadding,
                paddingTop: spacing.md,
              },
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <View
              style={[
                styles.contentWidth,
                {maxWidth: responsive.maxContentWidth},
              ]}>
              <TextField
                label="Property Name"
                onChangeText={setPropertyName}
                placeholder="Property Name"
                value={propertyName}
              />

              <SelectField label="Property Type" value="Apartment" />
              <SelectField label="Listing Type" value="For Rent" />

              <TextField
                keyboardType="number-pad"
                label="Number of Bedrooms"
                onChangeText={setBedrooms}
                placeholder="01"
                value={bedrooms}
              />

              <TextField
                keyboardType="number-pad"
                label="Number of Bathrooms"
                onChangeText={setBathrooms}
                placeholder="01"
                value={bathrooms}
              />

              <SelectField label="Amenities & Facilities" value="Parking" />

              <TextField
                label="Location"
                onChangeText={setLocation}
                placeholder="Add Location"
                value={location}
              />

              <LargeField
                label="Gallery"
                minHeight={96}
                onChangeText={setGallery}
                placeholder="Add Property Images"
                value={gallery}
              />

              <LargeField
                label="Description"
                minHeight={88}
                onChangeText={setDescription}
                placeholder="Property Description"
                value={description}
              />

              <Pressable
                accessibilityRole="button"
                onPress={onSubmitPress ?? onBackPress}
                style={styles.submitButton}>
                <Text style={styles.submitButtonText}>{submitLabel}</Text>
              </Pressable>
            </View>
          </ScrollView>

          <AppBottomNav activeTab={activeTab} onTabPress={onTabPress} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const TextField: React.FC<TextFieldProps> = ({
  keyboardType = 'default',
  label,
  onChangeText,
  placeholder,
  value,
}) => {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        keyboardType={keyboardType}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#B6B1AB"
        selectionColor={colors.primary}
        style={styles.input}
        value={value}
      />
    </View>
  );
};

const SelectField: React.FC<SelectFieldProps> = ({label, value}) => {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Pressable accessibilityRole="button" style={styles.selectField}>
        <Text numberOfLines={1} style={styles.selectValue}>
          {value}
        </Text>
        <DropdownIcon height={6} width={10} />
      </Pressable>
    </View>
  );
};

const LargeField: React.FC<LargeFieldProps> = ({
  label,
  minHeight,
  onChangeText,
  placeholder,
  value,
}) => {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        multiline
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#B6B1AB"
        selectionColor={colors.primary}
        style={[styles.input, styles.largeInput, {minHeight}]}
        textAlignVertical="top"
        value={value}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  flex: {
    flex: 1,
  },
  root: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: '#D7D7D7',
    backgroundColor: colors.white,
  },
  headerContent: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 28,
    height: 28,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 16,
  },
  headerSpacer: {
    width: 28,
    height: 28,
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
  fieldGroup: {
    marginBottom: spacing.sm + 2,
  },
  fieldLabel: {
    color: '#333333',
    fontFamily: fonts.medium,
    fontSize: 14,
    marginBottom: 6,
    marginLeft: spacing.xs,
  },
  input: {
    minHeight: 30,
    borderWidth: 1,
    borderColor: '#E1E1E1',
    borderRadius: 8,
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: colors.textPrimary,
    fontFamily: fonts.regular,
    fontSize: 14,
    shadowColor: '#000000',
    shadowOpacity: 0.06,
    shadowRadius: 5,
    shadowOffset: {width: 0, height: 2},
    elevation: 2,
  },
  largeInput: {
    paddingTop: 12,
  },
  selectField: {
    minHeight: 30,
    borderWidth: 1,
    borderColor: '#E1E1E1',
    borderRadius: 8,
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#000000',
    shadowOpacity: 0.06,
    shadowRadius: 5,
    shadowOffset: {width: 0, height: 2},
    elevation: 2,
  },
  selectValue: {
    flex: 1,
    color: '#B6B1AB',
    fontFamily: fonts.regular,
    fontSize: 14,
    marginRight: spacing.sm,
  },
  submitButton: {
    minHeight: 58,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm + 2,
  },
  submitButtonText: {
    color: colors.white,
    fontFamily: fonts.semibold,
    fontSize: 14,
    letterSpacing: 0.4,
  },
});
