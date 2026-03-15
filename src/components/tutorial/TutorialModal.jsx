import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TutorialModal({ open, step, onStart, onSkip, onDismissForever }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="absolute inset-0 bg-slate-950/45 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          />
          <motion.div
            className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Sparkles className="h-5 w-5" />
            </div>
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.15em] text-slate-400">{step.progressLabel}</p>
            <h3 className="text-2xl font-semibold text-slate-900">{step.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">{step.body}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Button onClick={onStart} className="bg-slate-900 hover:bg-slate-800">Start Tour</Button>
              <Button onClick={onSkip} variant="outline">Skip for Now</Button>
              <Button onClick={onDismissForever} variant="ghost" className="text-slate-500 hover:text-slate-700">
                Don’t show again
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
