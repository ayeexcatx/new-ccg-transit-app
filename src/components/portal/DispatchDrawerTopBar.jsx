import React from 'react';
import { SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Moon, Sun } from 'lucide-react';
import DispatchDrawerTutorial from '@/components/tutorial/DispatchDrawerTutorial';
import { statusBadgeColors } from './statusConfig';

export default function DispatchDrawerTopBar({ dispatch, displayDate, isOwner, open, onBack }) {
  return (
    <div className="sticky top-0 bg-white border-b border-slate-200 px-5 py-4 z-10">
      <div className="flex items-center justify-between gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="mb-2 -ml-2 h-8 px-2 text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <DispatchDrawerTutorial isOwner={isOwner} drawerOpen={open} />
      </div>
      <SheetHeader>
        <SheetTitle className="flex items-center gap-2 flex-wrap text-base">
          <Badge className={`${statusBadgeColors[dispatch.status]} border text-xs font-medium`}>
            {dispatch.status}
          </Badge>
          <span className="text-xs text-slate-400 flex items-center gap-1 font-normal">
            {dispatch.shift_time === 'Day Shift' ? <Sun className="h-3 w-3" /> : <Moon className="h-3 w-3" />}
            {dispatch.shift_time}
          </span>
          <span className="ml-auto text-xs text-slate-500 font-normal">
            {displayDate}
          </span>
        </SheetTitle>
      </SheetHeader>
    </div>
  );
}
