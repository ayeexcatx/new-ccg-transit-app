import React from 'react';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';

export default function DispatchTimeLogSection({
  isOwner,
  isDriverUser,
  isAdmin,
  dispatchStatus,
  myTrucks,
  visibleTrucks,
  assignedTrucks,
  timeLogSectionRef,
  draftTimeEntries,
  timeEntries,
  dispatch,
  onChangeDraft,
  onCopyToAll,
  onSaveAll,
  hasUnsavedChanges,
  isSavingAll,
  entriesToSave,
  TruckTimeRow,
}) {
  return (
    <>
      {isOwner && myTrucks.length > 0 && dispatchStatus !== 'Cancelled' && (
        <div id="time-log-section" ref={timeLogSectionRef} data-tour="dispatch-time-log">
          <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Time Log</p>
          <div className="space-y-2">
            {myTrucks.map((truck) => (
              <TruckTimeRow
                key={truck}
                truck={truck}
                dispatch={dispatch}
                timeEntries={timeEntries}
                readOnly={false}
                draft={draftTimeEntries[truck]}
                onChangeDraft={onChangeDraft}
                onCopyToAll={onCopyToAll}
                isFirstRow={truck === myTrucks[0]}
              />
            ))}
          </div>
          <div className="pt-3">
            <Button
              type="button"
              onClick={onSaveAll}
              disabled={!hasUnsavedChanges || isSavingAll || entriesToSave.length === 0}
              className="w-full bg-slate-900 hover:bg-slate-800"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSavingAll ? 'Saving…' : 'Save All Time Logs'}
            </Button>
          </div>
        </div>
      )}

      {isDriverUser && visibleTrucks.length > 0 && dispatchStatus !== 'Cancelled' && (
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Time Log</p>
          <div className="space-y-1.5">
            {visibleTrucks.map((truck) => (
              <TruckTimeRow
                key={truck}
                truck={truck}
                dispatch={dispatch}
                timeEntries={timeEntries}
                readOnly={true}
              />
            ))}
          </div>
        </div>
      )}

      {isAdmin && assignedTrucks.length > 0 && (
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Time Log</p>
          <div className="space-y-1.5">
            {assignedTrucks.map((truck) => (
              <TruckTimeRow
                key={truck}
                truck={truck}
                dispatch={dispatch}
                timeEntries={timeEntries}
                readOnly={true}
                showActor={true}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
