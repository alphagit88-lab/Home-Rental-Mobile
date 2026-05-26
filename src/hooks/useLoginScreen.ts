import { useState } from 'react';
import { setAuthSession } from '../services/authSession';
import { signIn } from '../services/rentalAuth';
import { DashboardVariant } from '../types/appFlow';
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
      const session = await signIn({
        email: email.trim().toLowerCase(),
        password,
      });

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
    email,
    password,
    rememberMe,
    passwordVisible,
    submitState,
    inlineMessage,
    setEmail,
    setPassword,
    setRememberMe,
    setPasswordVisible,
    onForgotPasswordPress,
    onSignUpPress,
    onRetryHeroPress,
    onSignInPress,
  };
};
