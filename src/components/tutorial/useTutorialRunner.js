import { useCallback, useEffect, useMemo, useState } from 'react';

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const getVisibleRect = (selector) => {
  if (!selector) return null;
  const targets = Array.from(document.querySelectorAll(selector));
  const visible = targets.find((el) => {
    const style = window.getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
  });
  return visible?.getBoundingClientRect() || null;
};

// Shared runner for tutorial overlays to keep sequencing/target resolution behavior consistent.
export default function useTutorialRunner({ steps, active, getCurrentTarget }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState(null);

  const totalSteps = steps.length;
  const isCompletion = active && stepIndex >= totalSteps;
  const currentStep = !isCompletion ? steps[stepIndex] : null;

  const handleStepChange = useCallback((nextIndex) => {
    setStepIndex(clamp(nextIndex, 0, totalSteps));
  }, [totalSteps]);

  useEffect(() => {
    if (!active || isCompletion || !currentStep) return;

    let cancelled = false;
    let attempts = 0;

    const resolveTarget = () => {
      if (cancelled) return;
      const rect = getVisibleRect(getCurrentTarget(currentStep));
      if (rect) {
        setTargetRect(rect);
        return;
      }

      attempts += 1;
      if (attempts >= 8) {
        handleStepChange(stepIndex + 1);
        return;
      }

      window.setTimeout(resolveTarget, 120);
    };

    window.setTimeout(resolveTarget, 80);

    return () => {
      cancelled = true;
    };
  }, [active, currentStep, getCurrentTarget, handleStepChange, isCompletion, stepIndex]);

  useEffect(() => {
    if (!active || isCompletion) return;

    const updatePosition = () => {
      const rect = getVisibleRect(getCurrentTarget(currentStep));
      if (rect) setTargetRect(rect);
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [active, currentStep, getCurrentTarget, isCompletion]);

  const tooltipStyle = useMemo(() => {
    if (isCompletion || !targetRect) {
      return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    }

    const margin = 16;
    const top = clamp(targetRect.bottom + 14, margin, window.innerHeight - 230);
    const left = clamp(targetRect.left, margin, window.innerWidth - 400);
    return { top: `${top}px`, left: `${left}px` };
  }, [isCompletion, targetRect]);

  const setTooltipVerticalLimit = useCallback((maxHeight) => {
    if (isCompletion || !targetRect) {
      return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    }

    const margin = 16;
    const top = clamp(targetRect.bottom + 14, margin, window.innerHeight - maxHeight);
    const left = clamp(targetRect.left, margin, window.innerWidth - 400);
    return { top: `${top}px`, left: `${left}px` };
  }, [isCompletion, targetRect]);

  return {
    totalSteps,
    stepIndex,
    targetRect,
    isCompletion,
    currentStep,
    tooltipStyle,
    setStepIndex,
    setTargetRect,
    handleStepChange,
    setTooltipVerticalLimit,
  };
}
