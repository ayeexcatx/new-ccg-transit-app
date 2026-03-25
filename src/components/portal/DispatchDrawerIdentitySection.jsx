import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FileText, Pencil, Truck } from 'lucide-react';
import { scheduledDispatchNote, scheduledStatusMessage } from './statusConfig';

export default function DispatchDrawerIdentitySection({
  dispatch,
  hasAdditional,
  jobNumberBadgeClassName,
  isAdmin,
  isOwner,
  visibleTrucks,
  getTruckDriverSummaryLabel,
  hasTruckSeenStatus,
  isEditingTrucks,
  onToggleEditingTrucks,
  requiredTruckCount,
  ownerTruckOptions,
  draftTrucks,
  toggleDraftTruck,
  truckEditMessage,
  hasTruckDraftChanges,
  isSavingTrucks,
  onSaveTrucks,
}) {
  if (dispatch.status === 'Scheduled') {
    return (
      <div>
        <h2 className="text-sm font-semibold text-slate-700">Scheduled Dispatch</h2>
        <p className="text-sm text-blue-600 mt-1 italic">{scheduledStatusMessage}</p>
        <p className="text-xs text-slate-600 mt-2 italic">{scheduledDispatchNote}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        {dispatch.client_name && (
          <h2 className="text-lg font-semibold text-slate-800">{dispatch.client_name}</h2>
        )}
        {!hasAdditional && (
          <div className="grid grid-cols-1 text-sm">
            {dispatch.job_number && (
              <div className="flex items-center gap-2 text-slate-700">
                <FileText className="h-4 w-4 text-slate-400 shrink-0" />
                <span className="font-bold">Job #</span>
                <Badge className={jobNumberBadgeClassName}>
                  {dispatch.job_number}
                </Badge>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="space-y-2.5 pt-1">
        <p className="text-xs font-bold text-slate-400">Working for CCG Transit</p>

        <div className="space-y-2">
          <div className="flex items-start gap-1.5">
            <Truck className="h-3.5 w-3.5 text-slate-400 mt-1 shrink-0" />
            {(isAdmin || isOwner) ? (
              <div className="min-w-0 flex-1 space-y-1.5">
                {visibleTrucks.map((t) => {
                  const truckDriverSummaryLabel = getTruckDriverSummaryLabel(t);

                  return (
                    <div key={t} className="flex items-start gap-2">
                      <Badge variant="outline" className="text-xs border-slate-900 text-slate-900 font-medium shrink-0">
                        {t}
                      </Badge>
                      {truckDriverSummaryLabel && (
                        <span className="text-xs text-slate-500 min-w-0 break-words leading-5">
                          {truckDriverSummaryLabel}
                        </span>
                      )}
                      {hasTruckSeenStatus(t) && (
                        <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold py-0 px-1.5">
                          Seen
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center gap-1.5 flex-wrap">
                {visibleTrucks.map((t) => (
                  <Badge key={t} variant="outline" className="text-xs border-slate-900 text-slate-900 font-medium w-fit">
                    {t}
                  </Badge>
                ))}
              </div>
            )}
            {isOwner && (
              <Button
                type="button"
                data-screenshot-exclude="true"
                variant="outline"
                size="sm"
                className="h-7 text-xs border-red-300 text-red-700 hover:bg-red-50 hover:text-red-800"
                data-tour="dispatch-edit-trucks"
                onClick={onToggleEditingTrucks}
              >
                <Pencil className="h-3.5 w-3.5 mr-1" />
                {isEditingTrucks ? 'Cancel' : 'Edit Trucks'}
              </Button>
            )}
          </div>

          {isOwner && isEditingTrucks && (
            <div data-screenshot-exclude="true" className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-3">
              <p className="text-xs text-slate-500">
                Select assigned trucks. You must keep exactly {requiredTruckCount} truck{requiredTruckCount === 1 ? '' : 's'}.
              </p>
              <div className="space-y-2">
                {ownerTruckOptions.map((truck) => (
                  <label key={truck} className="flex items-center gap-2 text-sm text-slate-700">
                    <Checkbox
                      checked={draftTrucks.includes(truck)}
                      disabled={!draftTrucks.includes(truck) && draftTrucks.filter(Boolean).length >= requiredTruckCount}
                      onCheckedChange={() => toggleDraftTruck(truck)}
                    />
                    <span className="font-mono">{truck}</span>
                  </label>
                ))}
              </div>
              {truckEditMessage?.text && (
                <div className="rounded-md border border-red-200 bg-red-50 px-2.5 py-2 text-xs text-red-700">
                  {truckEditMessage.text}
                </div>
              )}
              <Button
                type="button"
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                disabled={!hasTruckDraftChanges || isSavingTrucks || draftTrucks.filter(Boolean).length !== requiredTruckCount}
                onClick={onSaveTrucks}
              >
                {isSavingTrucks ? 'Saving…' : 'Save Truck Assignments'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
