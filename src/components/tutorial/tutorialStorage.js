const KEY_PREFIX = 'ccg-owner-tutorial';
const COMPLETED_KEY = `${KEY_PREFIX}:completed`;
const DISMISSED_KEY = `${KEY_PREFIX}:dismissed`;

const readFlag = (key) => {
  try {
    return window.localStorage.getItem(key) === 'true';
  } catch {
    return false;
  }
};

const writeFlag = (key, value) => {
  try {
    if (value) {
      window.localStorage.setItem(key, 'true');
      return;
    }
    window.localStorage.removeItem(key);
  } catch {
    // no-op for non-browser contexts
  }
};

export const tutorialStorage = {
  isCompleted: () => readFlag(COMPLETED_KEY),
  isDismissed: () => readFlag(DISMISSED_KEY),
  setCompleted: (value) => writeFlag(COMPLETED_KEY, value),
  setDismissed: (value) => writeFlag(DISMISSED_KEY, value),
};
