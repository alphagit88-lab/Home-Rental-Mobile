import { useEffect, useRef, useState } from 'react';
import { HeroState, InlineMessage, SubmitState, WelcomeContent } from './useLoginScreen';

const defaultHeroContent: WelcomeContent = {
  greeting: 'Hello, Guest',
  title: 'Welcome to Home Rent',
  tagline: 'Smart Home Rent Management.',
};

const signupRoles = ['Owner', 'Tenant', 'Guest'];

export const useSignUpScreen = () => {
  const [heroState, setHeroState] = useState<HeroState>({
    status: 'content',
    content: defaultHeroContent,
  });
  const [signupRoleIndex, setSignupRoleIndex] = useState<number | null>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [inlineMessage, setInlineMessage] = useState<InlineMessage | null>(null);
  const signUpTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (signUpTimerRef.current) {
        clearTimeout(signUpTimerRef.current);
      }
    };
  }, []);

  const onRetryHeroPress = () => {
    setHeroState({
      status: 'content',
      content: defaultHeroContent,
    });
    setInlineMessage(null);
  };

  const onRolePress = () => {
    setSignupRoleIndex((current) =>
      current === null ? 0 : (current + 1) % signupRoles.length,
    );
    setInlineMessage({
      text: 'TODO: Replace role picker with your real selection flow.',
      tone: 'neutral',
    });
  };

  const onSignUpPress = (onSuccess?: () => void) => {
    setSubmitState('loading');
    setInlineMessage(null);

    signUpTimerRef.current = setTimeout(() => {
      setSubmitState('idle');
      onSuccess?.();
    }, 550);
  };

  return {
    heroState,
    signUpAs: signupRoleIndex === null ? '' : signupRoles[signupRoleIndex],
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
    onRolePress,
    onRetryHeroPress,
    onSignUpPress,
  };
};
