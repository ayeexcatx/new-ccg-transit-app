import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BookOpenCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '@/utils';
import TutorialModal from './TutorialModal';
import TutorialOverlay from './TutorialOverlay';
import { tutorialStepMap } from './tutorialConfig';
import { tutorialStorage } from './tutorialStorage';

const TutorialContext = createContext(null);

const HOME_PATH = createPageUrl('Home');
const PORTAL_PATH = createPageUrl('Portal');

const getTargetRect = (targetName) => {
  if (!targetName) return null;
  const target = document.querySelector(`[data-tour="${targetName}"]`);
  if (!target) return null;
  return target.getBoundingClientRect();
};

export function TutorialProvider({ children, session }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeStepId, setActiveStepId] = useState(null);
  const [targetRect, setTargetRect] = useState(null);
  const hasAutoStartedRef = useRef(false);

  const isOwner = session?.code_type === 'CompanyOwner';
  const activeStep = activeStepId ? tutorialStepMap[activeStepId] : null;
  const isWelcomeStep = activeStep?.id === 'welcome';
  const isSpotlightStep = activeStep?.kind === 'spotlight';
  const isRunning = Boolean(activeStep);

  const updateSpotlightRect = useCallback(() => {
    if (!isSpotlightStep || !activeStep?.target) {
      setTargetRect(null);
      return;
    }

    let attempts = 0;
    const maxAttempts = 15;

    const seekTarget = () => {
      const rect = getTargetRect(activeStep.target);
      if (rect) {
        setTargetRect(rect);
        return;
      }
      attempts += 1;
      if (attempts < maxAttempts) {
        window.requestAnimationFrame(seekTarget);
      } else {
        setTargetRect(null);
      }
    };

    seekTarget();
  }, [isSpotlightStep, activeStep]);

  const closeTutorial = useCallback(() => {
    setActiveStepId(null);
    setTargetRect(null);
  }, []);

  const startWelcome = useCallback(() => {
    if (!isOwner) return;
    setActiveStepId('welcome');
    setTargetRect(null);
  }, [isOwner]);

  const startHomeStep = useCallback(() => {
    navigate(HOME_PATH);
    setActiveStepId('home');
  }, [navigate]);

  const startDispatchesStep = useCallback(() => {
    navigate(PORTAL_PATH);
    setActiveStepId('dispatches');
  }, [navigate]);

  const restartTutorial = useCallback(() => {
    tutorialStorage.setCompleted(false);
    tutorialStorage.setDismissed(false);
    startWelcome();
  }, [startWelcome]);

  const completeTutorial = useCallback(() => {
    tutorialStorage.setCompleted(true);
    closeTutorial();
  }, [closeTutorial]);

  const dismissForever = useCallback(() => {
    tutorialStorage.setDismissed(true);
    closeTutorial();
  }, [closeTutorial]);

  const skipForNow = useCallback(() => {
    closeTutorial();
  }, [closeTutorial]);

  useEffect(() => {
    if (!isOwner) {
      closeTutorial();
      return;
    }
    if (hasAutoStartedRef.current) return;

    const shouldAutoOpen = !tutorialStorage.isCompleted() && !tutorialStorage.isDismissed();
    if (shouldAutoOpen) {
      hasAutoStartedRef.current = true;
      startWelcome();
    }
  }, [isOwner, closeTutorial, startWelcome]);

  useEffect(() => {
    if (!isSpotlightStep) return;
    updateSpotlightRect();

    const handleRecalc = () => updateSpotlightRect();
    window.addEventListener('resize', handleRecalc);
    window.addEventListener('scroll', handleRecalc, true);
    return () => {
      window.removeEventListener('resize', handleRecalc);
      window.removeEventListener('scroll', handleRecalc, true);
    };
  }, [isSpotlightStep, activeStepId, location.pathname, updateSpotlightRect]);

  useEffect(() => {
    if (!isRunning) return;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        closeTutorial();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isRunning, closeTutorial]);

  const contextValue = useMemo(() => ({
    isOwner,
    restartTutorial,
  }), [isOwner, restartTutorial]);

  return (
    <TutorialContext.Provider value={contextValue}>
      {children}
      <TutorialModal
        open={isRunning && isWelcomeStep}
        step={tutorialStepMap.welcome}
        onStart={startHomeStep}
        onSkip={skipForNow}
        onDismissForever={dismissForever}
      />
      <TutorialOverlay
        open={isRunning && activeStepId === 'home'}
        step={tutorialStepMap.home}
        targetRect={targetRect}
        onBack={startWelcome}
        onNext={startDispatchesStep}
        onSkip={skipForNow}
      />
      <TutorialOverlay
        open={isRunning && activeStepId === 'dispatches'}
        step={tutorialStepMap.dispatches}
        targetRect={targetRect}
        onBack={startHomeStep}
        onFinish={completeTutorial}
      />
    </TutorialContext.Provider>
  );
}

export function useTutorial() {
  return useContext(TutorialContext);
}

export function TutorialRestartButton() {
  const tutorial = useTutorial();
  if (!tutorial?.isOwner) return null;

  return (
    <Button variant="outline" size="sm" onClick={tutorial.restartTutorial} className="text-xs">
      <BookOpenCheck className="mr-1 h-3.5 w-3.5" />
      Tutorial
    </Button>
  );
}
