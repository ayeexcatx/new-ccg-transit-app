import React, { useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

const PADDING = 10;

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

function buildSpotlightClip(rect) {
  if (!rect) return 'none';
  const left = Math.max(rect.left - PADDING, 0);
  const top = Math.max(rect.top - PADDING, 0);
  const right = Math.min(rect.right + PADDING, window.innerWidth);
  const bottom = Math.min(rect.bottom + PADDING, window.innerHeight);

  return `polygon(0% 0%, 0% 100%, ${left}px 100%, ${left}px ${top}px, ${right}px ${top}px, ${right}px ${bottom}px, ${left}px ${bottom}px, ${left}px 100%, 100% 100%, 100% 0%)`;
}

export default function TutorialOverlay({
  open,
  step,
  targetRect,
  onNext,
  onBack,
  onSkip,
  onFinish,
}) {
  const tooltipStyle = useMemo(() => {
    if (!targetRect) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };

    const width = 340;
    const margin = 20;
    const aboveTop = targetRect.top - 190;
    const placeAbove = aboveTop > margin;
    const centeredLeft = targetRect.left + targetRect.width / 2 - width / 2;
    const left = clamp(centeredLeft, margin, window.innerWidth - width - margin);

    return {
      left,
      top: placeAbove ? targetRect.top - 14 : targetRect.bottom + 14,
      transform: placeAbove ? 'translateY(-100%)' : 'translateY(0)',
    };
  }, [targetRect]);

  const clipPath = useMemo(() => buildSpotlightClip(targetRect), [targetRect]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[95]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
        >
          <motion.div
            className="absolute inset-0 bg-slate-950/55 backdrop-blur-[1px]"
            style={{ clipPath }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          {targetRect && (
            <motion.div
              className="absolute rounded-2xl border border-blue-300/80 shadow-[0_0_0_1px_rgba(59,130,246,0.45),0_0_24px_rgba(59,130,246,0.25)] pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
                left: targetRect.left - PADDING,
                top: targetRect.top - PADDING,
                width: targetRect.width + PADDING * 2,
                height: targetRect.height + PADDING * 2,
              }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            />
          )}
          <motion.div
            className="absolute z-[96] w-[min(92vw,340px)] rounded-xl border border-slate-200 bg-white p-4 shadow-2xl"
            style={tooltipStyle}
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.22 }}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">{step.progressLabel}</p>
            <h4 className="mt-1 text-lg font-semibold text-slate-900">{step.title}</h4>
            <p className="mt-2 text-sm text-slate-600">{step.body}</p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {onBack && <Button variant="outline" size="sm" onClick={onBack}>Back</Button>}
              {onNext && <Button size="sm" onClick={onNext} className="bg-slate-900 hover:bg-slate-800">Next</Button>}
              {onFinish && <Button size="sm" onClick={onFinish} className="bg-slate-900 hover:bg-slate-800">Finish</Button>}
              {onSkip && <Button variant="ghost" size="sm" onClick={onSkip} className="text-slate-500">Skip Tour</Button>}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
