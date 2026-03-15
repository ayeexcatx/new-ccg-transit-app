import { useCallback, useEffect, useMemo, useState } from 'react';

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const EDGE_MARGIN = 24;
const CENTER_TOLERANCE = 80;
const SCROLL_SETTLE_TIMEOUT = 800;

const resolveVisibleTarget = (selector) => {
  if (!selector) return null;
  const targets = Array.from(document.querySelectorAll(selector));
  const visible = targets.find((el) => {
    const style = window.getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
  });
  if (!visible) return null;
  return {
    element: visible,
    rect: visible.getBoundingClientRect(),
  };
};

const getIsNearViewportCenter = (rect) => {
  if (!rect) return false;

  const viewportHeight = window.innerHeight;
  const viewportCenter = viewportHeight / 2;
  const targetCenter = rect.top + (rect.height / 2);
  const fullyVisible = rect.top >= EDGE_MARGIN && rect.bottom <= viewportHeight - EDGE_MARGIN;
  const closeToCenter = Math.abs(targetCenter - viewportCenter) <= CENTER_TOLERANCE;

  return fullyVisible && closeToCenter;
};

const waitForCenteredTarget = (element, startedAt = performance.now()) => new Promise((resolve) => {
  const checkPosition = () => {
    const rect = element?.getBoundingClientRect();

    if (!rect || (rect.width === 0 && rect.height === 0)) {
      resolve(null);
      return;
    }

    if (getIsNearViewportCenter(rect)) {
      resolve(rect);
      return;
    }

    if (performance.now() - startedAt >= SCROLL_SETTLE_TIMEOUT) {
      resolve(rect);
      return;
    }

    window.requestAnimationFrame(checkPosition);
  };

  window.requestAnimationFrame(checkPosition);
});

const scrollTargetIntoView = async (element, rect) => {
  if (!element || !rect || getIsNearViewportCenter(rect)) {
    return rect;
  }

  element.scrollIntoView({
    behavior: 'smooth',
    block: 'center',
    inline: 'nearest',
  });

  return waitForCenteredTarget(element);
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
    const maxAttempts = 20;

    const resolveTarget = async () => {
      if (cancelled) return;

      const resolvedTarget = resolveVisibleTarget(getCurrentTarget(currentStep));
      if (resolvedTarget) {
        await scrollTargetIntoView(resolvedTarget.element, resolvedTarget.rect);
        if (cancelled) return;

        const measuredTarget = resolveVisibleTarget(getCurrentTarget(currentStep));
        if (measuredTarget) {
          setTargetRect(measuredTarget.rect);
          return;
        }

        attempts += 1;
        if (attempts < maxAttempts) {
          window.setTimeout(resolveTarget, 120);
          return;
        }

        handleStepChange(stepIndex + 1);
        return;
      }

      attempts += 1;
      if (attempts >= maxAttempts) {
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
      const resolvedTarget = resolveVisibleTarget(getCurrentTarget(currentStep));
      if (resolvedTarget?.rect) setTargetRect(resolvedTarget.rect);
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
