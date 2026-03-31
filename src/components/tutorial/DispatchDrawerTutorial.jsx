import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { CircleHelp } from 'lucide-react';
import TutorialOverlay from './TutorialOverlay';
import TutorialWelcomeModal from './TutorialWelcomeModal';
import useTutorialRunner from './useTutorialRunner';
import { cn } from '@/lib/utils';
import {
  DISPATCH_DRAWER_TUTORIAL_LANGUAGE,
  tutorialRegistry,
} from './tutorialConfig';

export default function DispatchDrawerTutorial({ isOwner, drawerOpen, triggerClassName }) {
  const tutorialConfig = tutorialRegistry.dispatchDrawer;
  const { seen: seenKey, completed: completedKey } = tutorialConfig.storageKeys;

  const [isRunning, setIsRunning] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(tutorialConfig.defaultLanguage);

  const activeSteps = tutorialConfig.stepsByLanguage[selectedLanguage]
    || tutorialConfig.stepsByLanguage[tutorialConfig.defaultLanguage];
  const activeCompletionStep = tutorialConfig.completionStepsByLanguage[selectedLanguage]
    || tutorialConfig.completionStepsByLanguage[tutorialConfig.defaultLanguage];

  const {
    totalSteps,
    stepIndex,
    targetRect,
    isCompletion,
    currentStep,
    handleStepChange,
    setStepIndex,
    setTargetRect,
    setTooltipVerticalLimit,
  } = useTutorialRunner({
    steps: activeSteps,
    active: isRunning,
    getCurrentTarget: (step) => step?.target,
    getScrollContainer: (step) => step?.scrollContainer || '[data-tutorial-scroll="drawer"]',
  });

  const stopTutorial = useCallback(() => {
    setIsRunning(false);
    setTargetRect(null);
  }, [setTargetRect]);

  const openTutorialWelcome = useCallback(() => {
    if (!isOwner || !drawerOpen) return;
    stopTutorial();
    setShowWelcome(true);
  }, [drawerOpen, isOwner, stopTutorial]);

  const startTutorial = useCallback((language = tutorialConfig.defaultLanguage) => {
    if (!isOwner || !drawerOpen) return;
    localStorage.setItem(seenKey, 'true');
    setSelectedLanguage(language);
    setShowWelcome(false);
    setStepIndex(0);
    setIsRunning(true);
  }, [drawerOpen, isOwner, seenKey, setStepIndex, tutorialConfig.defaultLanguage]);

  const startEnglishTutorial = useCallback(() => {
    startTutorial(DISPATCH_DRAWER_TUTORIAL_LANGUAGE.ENGLISH);
  }, [startTutorial]);

  const startPortugueseTutorial = useCallback(() => {
    startTutorial(DISPATCH_DRAWER_TUTORIAL_LANGUAGE.PORTUGUESE);
  }, [startTutorial]);

  const handleFinish = useCallback(() => {
    localStorage.setItem(completedKey, 'true');
    stopTutorial();
  }, [completedKey, stopTutorial]);

  const handleSkipForNow = useCallback(() => {
    setShowWelcome(false);
    stopTutorial();
  }, [stopTutorial]);

  const goToNextStep = useCallback(() => {
    if (isCompletion) {
      handleFinish();
      return;
    }
    handleStepChange(stepIndex + 1);
  }, [handleFinish, handleStepChange, isCompletion, stepIndex]);

  const goToPreviousStep = useCallback(() => {
    if (isCompletion) {
      handleStepChange(totalSteps - 1);
      return;
    }
    handleStepChange(stepIndex - 1);
  }, [handleStepChange, isCompletion, stepIndex, totalSteps]);

  useEffect(() => {
    if (!isOwner || !drawerOpen || isRunning || showWelcome) return;
    const seen = localStorage.getItem(seenKey) === 'true';
    if (!seen) {
      openTutorialWelcome();
    }
  }, [drawerOpen, isOwner, isRunning, openTutorialWelcome, seenKey, showWelcome]);

  useEffect(() => {
    if (!drawerOpen) {
      setShowWelcome(false);
      stopTutorial();
    }
  }, [drawerOpen, stopTutorial]);

  const tooltipStyle = useMemo(() => setTooltipVerticalLimit(260), [setTooltipVerticalLimit]);

  return (
    <>
      {isOwner && (
        <Button
          type="button"
          size="sm"
          variant="default"
          onClick={openTutorialWelcome}
          className={cn(
            'h-7 border border-blue-700 bg-blue-600 px-2 text-xs text-white shadow-sm hover:bg-blue-700 focus-visible:ring-blue-500',
            triggerClassName,
          )}
          data-tour="dispatch-tutorial-trigger"
        >
          <CircleHelp className="mr-1 h-3.5 w-3.5" />
          Tutorial
        </Button>
      )}

      <TutorialWelcomeModal
        open={showWelcome}
        title="Welcome to the Dispatch Detail Drawer Tutorial"
        description="This quick tour will walk you through the main actions and details available in the dispatch detail drawer."
        portugueseLabel="Inciar Tour em Portugues"
        showDismiss={false}
        onStart={startEnglishTutorial}
        onStartPortuguese={startPortugueseTutorial}
        onSkip={handleSkipForNow}
      />

      <TutorialOverlay
        active={isRunning}
        targetRect={targetRect}
        tooltipStyle={tooltipStyle}
        step={isCompletion ? activeCompletionStep : currentStep}
        stepIndex={stepIndex}
        totalSteps={totalSteps}
        isCompletion={isCompletion}
        onBack={goToPreviousStep}
        onNext={goToNextStep}
        onSkip={handleSkipForNow}
        onFinish={handleFinish}
        onReplay={openTutorialWelcome}
      />
    </>
  );
}
