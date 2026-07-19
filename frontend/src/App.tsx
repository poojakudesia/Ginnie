import React, { useEffect, useRef } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useAppStore, applyPalette } from './store/app';
import { useAuthStore } from './store/auth';
import { useTrackerStore } from './store/tracker';
import { saveProgress } from './api/auth';
import { IOSFrame } from './components/IOSFrame';
import { DLTabBar } from './components/DLTabBar';
import {
  WelcomeScreen, SignInScreen, ProfileSetupScreen,
  WishBuilderScreen, WishesSummaryScreen, QuestionsScreen,
  EnergyScreen, TechniquePickerScreen, TutorialScreen, PlanScreen,
  TrackerScreen, EnergyCheckScreen, ManifestScreen,
  HomeScreen, AffirmScreen, VizScreen, MovieScreen, FeedScreen,
  PathScreen, ProfileScreen,
} from './screens';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

// Screens that don't require auth (public + all onboarding steps)
const PUBLIC_SCREENS = new Set([
  'welcome', 'signin',
  'profile-setup', 'wish-builder', 'wishes',
  'questions', 'energy', 'techniques', 'tutorial', 'plan',
]);
// Screens that show the bottom tab bar (the 4 nav destinations + their sub-screens)
const TABBED_SCREENS = new Set([
  'tracker', 'manifest', 'wish-builder', 'tutorial', 'profile',
]);
// Screens worth remembering so the user resumes here next login
const RESUMABLE_SCREENS = new Set([
  'profile-setup', 'wish-builder', 'wishes',
  'questions', 'energy', 'techniques', 'tutorial', 'plan', 'tracker',
]);
// Once the user is practicing, these are the "in-app" screens where a weekly
// energy check may auto-prompt.
const IN_APP_SCREENS = new Set(['tracker', 'manifest', 'tutorial', 'profile']);

function AppContent() {
  const { screen, goto, palette } = useAppStore();
  const token = useAuthStore((s) => s.token);
  const lastEnergyCheck = useTrackerStore((s) => s.lastEnergyCheck);
  const energyPromptedRef = useRef(false);

  useEffect(() => { applyPalette(palette); }, [palette]);

  // Remember progress: persist the last meaningful screen to the profile
  useEffect(() => {
    if (token && RESUMABLE_SCREENS.has(screen)) saveProgress(screen);
  }, [screen, token]);

  // Weekly Energy Check — auto-prompt on Saturdays (no button). Fires once per
  // app session, only if it's Saturday and no check was recorded in the last 6
  // days. Completing the check sets lastEnergyCheck=today, so it won't re-fire.
  useEffect(() => {
    if (!token || energyPromptedRef.current) return;
    if (!IN_APP_SCREENS.has(screen)) return;
    const now = new Date();
    if (now.getDay() !== 6) return; // 6 = Saturday
    const sixDaysAgo = new Date(now);
    sixDaysAgo.setDate(now.getDate() - 6);
    const cutoff = `${sixDaysAgo.getFullYear()}-${String(sixDaysAgo.getMonth() + 1).padStart(2, '0')}-${String(sixDaysAgo.getDate()).padStart(2, '0')}`;
    const alreadyThisWeek = lastEnergyCheck && lastEnergyCheck > cutoff;
    if (!alreadyThisWeek) {
      energyPromptedRef.current = true;
      goto('energy-check');
    }
  }, [screen, token, lastEnergyCheck, goto]);

  // Route protection: if no token and trying to access protected screen, redirect to signin
  useEffect(() => {
    if (!token && !PUBLIC_SCREENS.has(screen)) {
      goto('signin');
    }
  }, [screen, token, goto]);

  const renderScreen = () => {
    switch (screen) {
      case 'welcome':       return <WelcomeScreen />;
      case 'signin':        return <SignInScreen />;
      case 'profile-setup': return <ProfileSetupScreen />;
      case 'wish-builder':  return <WishBuilderScreen />;
      case 'wishes':        return <WishesSummaryScreen />;
      case 'questions':     return <QuestionsScreen />;
      case 'energy':        return <EnergyScreen />;
      case 'techniques':    return <TechniquePickerScreen />;
      case 'tutorial':      return <TutorialScreen />;
      case 'plan':          return <PlanScreen />;
      case 'tracker':       return <TrackerScreen />;
      case 'energy-check':  return <EnergyCheckScreen />;
      case 'manifest':      return <ManifestScreen />;
      case 'home':          return <HomeScreen />;
      case 'affirm':        return <AffirmScreen />;
      case 'viz':           return <VizScreen />;
      case 'movie':         return <MovieScreen />;
      case 'feed':          return <FeedScreen />;
      case 'journey':       return <PathScreen />;
      case 'profile':       return <ProfileScreen />;
      default:              return <HomeScreen />;
    }
  };

  const showTabs = TABBED_SCREENS.has(screen);

  return (
    <IOSFrame>
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        {renderScreen()}
        {showTabs && <DLTabBar />}
      </div>
    </IOSFrame>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            fontFamily: 'var(--sans, system-ui)',
            fontSize: 14,
            borderRadius: 14,
            padding: '10px 16px',
            background: 'var(--card, #fff)',
            color: 'var(--ink, #1a1a1a)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
          },
        }}
      />
    </QueryClientProvider>
  );
}
