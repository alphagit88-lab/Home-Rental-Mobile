import { useState } from 'react';
import { HeroState, InlineMessage, SubmitState, WelcomeContent } from './useLoginScreen';
import { DashboardVariant } from '../types/appFlow';
import { setAuthSession } from '../services/authSession';
import { RentalRole, signUp } from '../services/rentalAuth';
import {getDashboardVariantForRole} from '../types/appFlow';

const defaultHeroContent: WelcomeContent = {
  greeting: 'Hello, Guest',
  title: 'Welcome to Home Rent',
  tagline: 'Smart Home Rent Management.',
};

export const useSignUpScreen = () => {
  const [heroState, setHeroState] = useState<HeroState>({
    status: 'content',
    content: defaultHeroContent,
  });
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [inlineMessage, setInlineMessage] = useState<InlineMessage | null>(null);
  const dashboardVariant: DashboardVariant = 'standard';

  const onRetryHeroPress = () => {
    setHeroState({
      status: 'content',
      content: defaultHeroContent,
    });
    setInlineMessage(null);
  };

  const onSignUpPress = async (
    onSuccess?: (variant: DashboardVariant) => void,
  ) => {
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setSubmitState('error');
      setInlineMessage({
        text: 'Please complete name, email, and password.',
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

    if (password.trim().length < 6) {
      setSubmitState('error');
      setInlineMessage({
        text: 'Password must be at least 6 characters long.',
        tone: 'error',
      });
      return;
    }

    setSubmitState('loading');
    setInlineMessage(null);

    const role: RentalRole = 'owner';

    try {
      const session = await signUp({
        name: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
      });

      await setAuthSession(session);
      setSubmitState('idle');
      setInlineMessage({
        text: 'Account created successfully.',
        tone: 'success',
      });
      onSuccess?.(getDashboardVariantForRole(session.user.role));
    } catch (error) {
      setSubmitState('error');
      setInlineMessage({
        text:
          error instanceof Error
            ? error.message
            : 'Unable to create your account right now.',
        tone: 'error',
      });
    }
  };

  return {
    dashboardVariant,
    heroState,
    fullName,
    email,
    password,
    passwordVisible,
    submitState,
    inlineMessage,
    setFullName,
    setEmail,
    setPassword,
    setPasswordVisible,
    onRetryHeroPress,
    onSignUpPress,
  };
};
