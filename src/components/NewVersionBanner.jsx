import { useEffect, useState } from 'react';
import { APP_VERSION, APP_VERSION_STORAGE_KEY } from '@/lib/appVersion';
import { Button } from '@/components/ui/button';

export default function NewVersionBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const storedVersion = window.localStorage.getItem(APP_VERSION_STORAGE_KEY);

    if (!storedVersion) {
      window.localStorage.setItem(APP_VERSION_STORAGE_KEY, APP_VERSION);
      return;
    }

    if (storedVersion !== APP_VERSION) {
      setShowBanner(true);
    }
  }, []);

  if (!showBanner) {
    return null;
  }

  return (
    <div className="sticky top-0 z-[70] border-b border-amber-200 bg-amber-50 px-4 py-2 shadow-sm">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-medium text-amber-900">A new version of the app is available.</p>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => {
              window.localStorage.setItem(APP_VERSION_STORAGE_KEY, APP_VERSION);
              window.location.reload();
            }}
            className="h-8 bg-amber-500 px-3 text-xs font-semibold text-white hover:bg-amber-600"
          >
            Refresh
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowBanner(false)}
            className="h-8 px-2 text-xs text-amber-900 hover:bg-amber-100"
          >
            Dismiss
          </Button>
        </div>
      </div>
    </div>
  );
}
