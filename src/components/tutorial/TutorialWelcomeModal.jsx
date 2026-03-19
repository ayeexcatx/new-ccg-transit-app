import React from 'react';
import { Button } from '@/components/ui/button';

export default function TutorialWelcomeModal({ open, onStart, onStartPortuguese, onSkip, onDismiss }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[220] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-[1px] transition-opacity duration-200">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Welcome to CCG Dispatch Hub</h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          This quick tour will walk you through the main parts of your portal so you know where to find dispatches,
          announcements, availability, drivers, and incidents.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-end gap-2">
          <Button variant="outline" onClick={onDismiss}>Don't show again</Button>
          <Button variant="ghost" onClick={onSkip}>Skip for Now</Button>
          <Button variant="secondary" onClick={onStartPortuguese}>Inciar Tour em Português</Button>
          <Button onClick={onStart}>Start Tour</Button>
        </div>
      </div>
    </div>
  );
}
