import {Alert, Linking} from 'react-native';
import {appSupport} from '../config/appSupport';

const openExternalTarget = async (
  url: string,
  fallbackTitle: string,
  fallbackMessage: string,
) => {
  try {
    await Linking.openURL(url);
  } catch {
    Alert.alert(fallbackTitle, fallbackMessage);
  }
};

const buildMailtoUrl = (subject: string) =>
  `mailto:${appSupport.contactEmail}?subject=${encodeURIComponent(subject)}`;

export const openSupportEmail = async () =>
  openExternalTarget(
    buildMailtoUrl(appSupport.supportSubject),
    'Support unavailable',
    `Please contact ${appSupport.contactEmail} for help with ${appSupport.appName}.`,
  );

export const openReportProblemEmail = async () =>
  openExternalTarget(
    buildMailtoUrl(appSupport.reportProblemSubject),
    'Report unavailable',
    `Please contact ${appSupport.contactEmail} to report a problem with ${appSupport.appName}.`,
  );

export const openPrivacyPolicy = async () =>
  openExternalTarget(
    appSupport.privacyPolicyUrl,
    'Privacy policy unavailable',
    `Open ${appSupport.privacyPolicyUrl} in your browser to review the ${appSupport.appName} privacy policy.`,
  );

export const openTermsOfUse = async () =>
  openExternalTarget(
    appSupport.termsUrl,
    'Terms unavailable',
    `Open ${appSupport.termsUrl} in your browser to review the ${appSupport.appName} terms.`,
  );

export const openAccountDeletionPage = async () =>
  openExternalTarget(
    appSupport.accountDeletionUrl,
    'Deletion page unavailable',
    `Open ${appSupport.accountDeletionUrl} in your browser to request account deletion for ${appSupport.appName}.`,
  );
