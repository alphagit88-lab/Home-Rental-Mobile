import { useEffect, useRef, useState } from 'react';
import { DashboardVariant } from '../types/appFlow';

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
  const signInTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (signInTimerRef.current) {
        clearTimeout(signInTimerRef.current);
      }
    };
  }, []);

  const onForgotPasswordPress = () => {
    // TODO: Connect forgot password flow or navigation.
    setInlineMessage({
      text: 'TODO: Connect forgot password flow.',
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

  const onSignInPress = (
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

    setSubmitState('loading');
    setInlineMessage(null);

    signInTimerRef.current = setTimeout(() => {
      setSubmitState('idle');
      onSuccess?.(dashboardVariant);
    }, 550);
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
