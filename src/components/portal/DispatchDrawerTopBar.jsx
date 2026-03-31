import React from 'react';
import { SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ArrowLeft, Camera, Moon, Sun } from 'lucide-react';
import DispatchDrawerTutorial from '@/components/tutorial/DispatchDrawerTutorial';
import { statusBadgeColors } from './statusConfig';

export default function DispatchDrawerTopBar({
  dispatch,
  displayDate,
  isOwner,
  isDriverUser,
  open,
  onBack,
  isCreatingScreenshot,
  isEditingTrucks,
  onReportIncident,
  onScreenshotDispatch,
}) {
  const canShowReportIncident = isDriverUser || isOwner;
  const canShowScreenshot = isOwner;

  return (
    <div className="sticky top-0 bg-white border-b border-slate-200 px-5 py-4 z-10">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="-ml-2 h-8 px-2 text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>

        <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
          <DispatchDrawerTutorial isOwner={isOwner} drawerOpen={open} />

          {canShowReportIncident && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              data-screenshot-exclude="true"
              onClick={onReportIncident}
              data-tour="dispatch-report-incident"
            >
              <AlertTriangle className="h-3.5 w-3.5 mr-1" />
              Report Incident
            </Button>
          )}

          {canShowScreenshot && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 text-xs"
              disabled={isCreatingScreenshot || isEditingTrucks}
              onClick={onScreenshotDispatch}
              data-tour="dispatch-screenshot"
            >
              <Camera className="h-3.5 w-3.5 mr-1" />
              {isCreatingScreenshot ? 'Creating…' : 'Screenshot Dispatch'}
            </Button>
          )}
        </div>
      </div>

      <SheetHeader className="mt-3">
        <SheetTitle className="flex items-center justify-between gap-3 flex-wrap text-base">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
          <Badge className={`${statusBadgeColors[dispatch.status]} border text-xs font-medium`}>
            {dispatch.status}
          </Badge>
          <span className="text-xs text-slate-400 flex items-center gap-1 font-normal">
            {dispatch.shift_time === 'Day Shift' ? <Sun className="h-3 w-3" /> : <Moon className="h-3 w-3" />}
            {dispatch.shift_time}
          </span>
          </div>
          <span className="text-sm font-semibold text-slate-700">
            {displayDate}
          </span>
        </SheetTitle>
      </SheetHeader>
    </div>
  );
}
