import { useState } from 'react';
import { DashboardVariant } from '../types/appFlow';
import { setAuthSession } from '../services/authSession';
import {RentalRole, signIn} from '../services/rentalAuth';
import {getDashboardVariantForRole} from '../types/appFlow';

export type WelcomeContent = {
  greeting: string;
  title: string;
  tagline: string;
};

export type HeroState =
  | { status: 'loading' }
  | { status: 'empty' }
  | { status: 'error'; message: string }
  | { status: 'content'; content: WelcomeContent };

export type SubmitState = 'idle' | 'loading' | 'error';
export type MessageTone = 'neutral' | 'error' | 'success';

export type InlineMessage = {
  text: string;
  tone: MessageTone;
};

const defaultHeroContent: WelcomeContent = {
  greeting: 'Hello, Guest',
  title: 'Welcome to Home Rent',
  tagline: 'Smart Home Rent Management.',
};

export const useLoginScreen = () => {
  const [heroState, setHeroState] = useState<HeroState>({
    status: 'content',
    content: defaultHeroContent,
  });
  const [dashboardVariant, setDashboardVariant] =
    useState<DashboardVariant>('standard');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [inlineMessage, setInlineMessage] = useState<InlineMessage | null>(null);

  const onForgotPasswordPress = () => {
    // TODO: Connect forgot password flow or navigation.
    setInlineMessage({
      text: 'Forgot password is not connected yet.',
      tone: 'neutral',
    });
  };

  const onSignUpPress = () => {
    // TODO: Connect sign-up screen or route.
    setInlineMessage({
      text: 'TODO: Connect sign-up flow.',
      tone: 'neutral',
    });
  };

  const onRetryHeroPress = () => {
    // TODO: Replace with backend or CMS hero fetch.
    setHeroState({
      status: 'content',
      content: defaultHeroContent,
    });
    setInlineMessage(null);
  };

  const onSignInPress = async (
    onSuccess?: (variant: DashboardVariant) => void,
  ) => {
    if (!email.trim() || !password.trim()) {
      setSubmitState('error');
      setInlineMessage({
        text: 'Please enter both email and password.',
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

    setSubmitState('loading');
    setInlineMessage(null);

    try {
      const expectedRole: RentalRole =
        dashboardVariant === 'owner'
          ? 'owner'
          : dashboardVariant === 'serviceProvider'
            ? 'service_provider'
            : 'tenant';
      const session = await signIn({
        email: email.trim().toLowerCase(),
        password,
      });

      if (session.user.role !== expectedRole) {
        setSubmitState('error');
        setInlineMessage({
          text: (() => {
            if (expectedRole === 'owner') {
              return 'This account is not a Property Owner account. Choose the matching role to continue.';
            }

            if (expectedRole === 'service_provider') {
              return 'This account is not a Service Provider account. Choose the matching role to continue.';
            }

            return 'This account is not a Tenant account. Choose the matching role to continue.';
          })(),
          tone: 'error',
        });
        return;
      }

      await setAuthSession(session, {
        persist: rememberMe,
      });
      setSubmitState('idle');
      setInlineMessage({
        text: `Welcome back, ${session.user.name}.`,
        tone: 'success',
      });
      onSuccess?.(getDashboardVariantForRole(session.user.role));
    } catch (error) {
      setSubmitState('error');
      setInlineMessage({
        text:
          error instanceof Error ? error.message : 'Unable to sign in right now.',
        tone: 'error',
      });
    }
  };

  return {
    heroState,
    dashboardVariant,
    email,
    password,
    rememberMe,
    passwordVisible,
    submitState,
    inlineMessage,
    setEmail,
    setPassword,
    setRememberMe,
    setDashboardVariant,
    setPasswordVisible,
    onForgotPasswordPress,
    onSignUpPress,
    onRetryHeroPress,
    onSignInPress,
  };
};
