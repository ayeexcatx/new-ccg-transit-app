import { createPageUrl } from '@/utils';

export const tutorialSteps = [
  {
    id: 'welcome',
    kind: 'modal',
    page: null,
    progressLabel: 'Step 1 of 3',
    title: 'Welcome to CCG Dispatch Hub',
    body: 'This quick tour will show you the most important parts of your portal so you can get started faster.',
  },
  {
    id: 'home',
    kind: 'spotlight',
    page: createPageUrl('Home'),
    target: 'home-overview',
    progressLabel: 'Step 2 of 3',
    title: 'Home Page',
    body: 'This is your starting point for announcements, action-needed items, and dispatch activity.',
  },
  {
    id: 'dispatches',
    kind: 'spotlight',
    page: createPageUrl('Portal'),
    target: 'dispatches-overview',
    progressLabel: 'Step 3 of 3',
    title: 'Dispatches',
    body: 'This is where you can view dispatches, open dispatch details, and manage assignments.',
  },
];

export const tutorialStepMap = tutorialSteps.reduce((acc, step, index) => {
  acc[step.id] = { ...step, index };
  return acc;
}, {});
