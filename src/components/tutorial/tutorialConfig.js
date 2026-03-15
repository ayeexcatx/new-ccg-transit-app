import { createPageUrl } from '@/utils';

export const COMPANY_OWNER_TUTORIAL_ID = 'companyOwnerMainPortal';
export const COMPANY_OWNER_TUTORIAL_DISMISSED_KEY = 'companyOwnerTutorialDismissed';
export const COMPANY_OWNER_TUTORIAL_COMPLETED_KEY = 'companyOwnerTutorialCompleted';
export const DISPATCH_DRAWER_TUTORIAL_SEEN_KEY = 'dispatchDrawerTutorialSeen';
export const DISPATCH_DRAWER_TUTORIAL_COMPLETED_KEY = 'dispatchDrawerTutorialCompleted';

const COMPANY_OWNER_TUTORIAL_COMPLETION_STEP = {
  title: "You're all set",
  description: 'You can replay this tutorial anytime using the Tutorial button.',
};

const DISPATCH_DRAWER_TUTORIAL_COMPLETION_STEP = {
  title: 'Dispatch Tutorial Complete',
  description: 'You can replay this tutorial anytime using the Tutorial button in the dispatch drawer.',
};

export const companyOwnerTutorialSteps = [
  {
    id: 'home-screen',
    page: createPageUrl('Home'),
    target: '[data-tour="home-overview"]',
    title: 'Home Screen',
    description:
      'This is the home screen, which gives you a quick snapshot of pending actions and dispatches.',
  },
  {
    id: 'announcement-center',
    page: createPageUrl('Home'),
    target: '[data-tour="announcement-center"]',
    title: 'Announcement Center',
    description:
      'This is where you will receive general communications and advisories from CCG Transit.',
  },
  {
    id: 'action-needed',
    page: createPageUrl('Home'),
    target: '[data-tour="action-needed"]',
    title: 'Action Needed',
    description:
      'This area will show you any dispatches that require your urgent attention, such as waiting for your confirmation of receipt.',
  },
  {
    id: 'dispatch-preview',
    page: createPageUrl('Home'),
    target: '[data-tour="dispatch-preview"]',
    title: 'Dispatch Preview',
    description: 'This is a quick view of the next few dispatches assigned to you.',
  },
  {
    id: 'dispatches-page',
    page: createPageUrl('Home'),
    target: '[data-tour="dispatches-nav"]',
    title: 'Dispatches',
    description: 'This is where you can see your entire dispatch history and upcoming dispatches.',
  },
  {
    id: 'availability-page',
    page: createPageUrl('Home'),
    target: '[data-tour="availability-nav"]',
    title: 'Availability',
    description:
      'This is where you will let us know if you are available for a certain shift and how many trucks you have available.',
  },
  {
    id: 'recurring-weekly-defaults',
    page: createPageUrl('Availability'),
    target: '[data-tour="recurring-weekly-defaults"]',
    title: 'Recurring Weekly Defaults',
    description:
      'This is where you can set your default availability that will automatically apply each week.',
  },
  {
    id: 'availability-controls',
    page: createPageUrl('Availability'),
    target: '[data-tour="availability-controls"]',
    title: 'Availability Controls',
    description:
      'This is where you can actively choose the number of trucks you have available for each shift.',
  },
  {
    id: 'drivers-page',
    page: createPageUrl('Home'),
    target: '[data-tour="drivers-nav"]',
    title: 'Drivers',
    description:
      'This is where you can add drivers by clicking Add Driver and entering their information. Please read the instructions about the driver portal at the bottom of the page in full. Once you add a driver, you will need to request a password for them.',
  },
  {
    id: 'incidents-page',
    page: createPageUrl('Home'),
    target: '[data-tour="incidents-nav"]',
    title: 'Incidents',
    description: 'This is where you can view your incident history or create a new incident report.',
  },
];

export const dispatchDrawerTutorialSteps = [
  {
    id: 'report-incident',
    target: '[data-tour="dispatch-report-incident"]',
    title: 'Report Incident',
    description:
      'This is where you can report a breakdown or any other incident related to your dispatch. Ideally, this should be done after advising the dispatcher and while you are stopped, or sometime after your shift while the details are still fresh.',
  },
  {
    id: 'screenshot-dispatch',
    target: '[data-tour="dispatch-screenshot"]',
    title: 'Screenshot Dispatch',
    description:
      'Press this button to take a clean screenshot of your dispatch without the action buttons or editable sections.',
  },
  {
    id: 'edit-trucks',
    target: '[data-tour="dispatch-edit-trucks"]',
    title: 'Edit Trucks',
    description: 'This is where you can edit the trucks you have assigned to the dispatch.',
  },
  {
    id: 'driver-assignments',
    target: '[data-tour="dispatch-driver-assignments"]',
    title: 'Driver Assignments',
    description: 'This is where you can assign drivers to your dispatch.',
    warningText: 'Please familiarize yourself with the instructions on the Drivers page before using this feature.',
  },
  {
    id: 'assignment-details',
    target: '[data-tour="dispatch-assignment-details"]',
    title: 'Assignment Details',
    description: 'This section shows the dispatch start time and instructions.',
  },
  {
    id: 'dispatch-notes',
    target: '[data-tour="dispatch-notes"]',
    title: 'Dispatch Notes',
    description: 'These are dispatch notes and reminders that may be included with a dispatch.',
  },
  {
    id: 'confirm-receipt',
    target: '[data-tour="dispatch-confirm-receipt"]',
    title: 'Confirm Receipt',
    description:
      'This is where you confirm receipt of the dispatch. You must confirm any time you receive: a new dispatch, a new schedule, an amendment, a cancellation, or another important update.',
  },
  {
    id: 'time-log',
    target: '[data-tour="dispatch-time-log"]',
    title: 'Time Log',
    description:
      'This is where you enter the check-in and check-out times for yourself or your drivers. The time log is for informational purposes only.',
  },
];

export const tutorialRegistry = {
  [COMPANY_OWNER_TUTORIAL_ID]: {
    steps: companyOwnerTutorialSteps,
    completionStep: COMPANY_OWNER_TUTORIAL_COMPLETION_STEP,
    storageKeys: {
      dismissed: COMPANY_OWNER_TUTORIAL_DISMISSED_KEY,
      completed: COMPANY_OWNER_TUTORIAL_COMPLETED_KEY,
    },
  },
  dispatchDrawer: {
    steps: dispatchDrawerTutorialSteps,
    completionStep: DISPATCH_DRAWER_TUTORIAL_COMPLETION_STEP,
    storageKeys: {
      seen: DISPATCH_DRAWER_TUTORIAL_SEEN_KEY,
      completed: DISPATCH_DRAWER_TUTORIAL_COMPLETED_KEY,
    },
  },
};
