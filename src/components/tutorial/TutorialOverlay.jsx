import React from 'react';
import TutorialTooltip from './TutorialTooltip';

export default function TutorialOverlay({
  active,
  targetRect,
  tooltipStyle,
  step,
  stepIndex,
  totalSteps,
  isCompletion,
  onBack,
  onNext,
  onSkip,
  onFinish,
  onReplay,
}) {
  if (!active) return null;

  return (
    <>
      <div className="fixed inset-0 z-[210] bg-slate-950/60 transition-opacity duration-200" />
      {targetRect && !isCompletion && (
        <div
          className="pointer-events-none fixed z-[220] rounded-xl border-2 border-white/95 shadow-[0_0_0_9999px_rgba(2,6,23,0.78),0_0_0_2px_rgba(255,255,255,0.95),0_0_48px_rgba(255,255,255,0.55)] transition-all duration-200"
          style={{
            top: `${targetRect.top - 8}px`,
            left: `${targetRect.left - 8}px`,
            width: `${targetRect.width + 16}px`,
            height: `${targetRect.height + 16}px`,
            backgroundColor: 'transparent',
          }}
        />
      )}
      <TutorialTooltip
        step={step}
        stepIndex={stepIndex}
        totalSteps={totalSteps}
        style={tooltipStyle}
        isFirst={stepIndex === 0}
        isLast={stepIndex === totalSteps - 1}
        isCompletion={isCompletion}
        onBack={onBack}
        onNext={onNext}
        onSkip={onSkip}
        onFinish={onFinish}
        onReplay={onReplay}
      />
    </>
  );
}
