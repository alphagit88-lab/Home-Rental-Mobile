import { useEffect, useRef, useState } from 'react';

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

  const onSignInPress = () => {
    if (!email.trim() || !password.trim()) {
      setSubmitState('error');
      setInlineMessage({
        text: 'Please enter both email and password.',
        tone: 'error',
      });
      return;
    }

    // TODO: Replace with real sign-in request and backend validation.
    setSubmitState('loading');
    setInlineMessage(null);

    signInTimerRef.current = setTimeout(() => {
      setSubmitState('error');
      setInlineMessage({
        text: 'TODO: Connect the sign-in API.',
        tone: 'neutral',
      });
    }, 1100);
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
