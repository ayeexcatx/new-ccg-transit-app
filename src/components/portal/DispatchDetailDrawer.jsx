import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  CheckCircle2, Clock, MapPin, Truck, Sun, Moon,
  FileText, AlertTriangle
} from 'lucide-react';
import { format } from 'date-fns';
import { statusBadgeColors } from './statusConfig';

const tollColors = {
  Authorized: 'bg-green-50 text-green-700',
  Unauthorized: 'bg-red-50 text-red-700',
  'Included in Rate': 'bg-purple-50 text-purple-700',
};

export default function DispatchDetailDrawer({
  dispatch, session, confirmations, timeEntries, templateNotes,
  onConfirm, onTimeEntry, companyName, open, onClose
}) {
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  if (!dispatch) return null;

  const myTrucks = (session.allowed_trucks || []).filter(t =>
    (dispatch.trucks_assigned || []).includes(t)
  );
  const isOwner = session.code_type === 'CompanyOwner';
  const currentConfType = dispatch.status;

  const isTruckConfirmedForCurrent = (truck) =>
    confirmations.some(c =>
      c.dispatch_id === dispatch.id &&
      c.truck_number === truck &&
      c.confirmation_type === currentConfType
    );

  const getTruckCurrentConfirmation = (truck) =>
    confirmations.find(c =>
      c.dispatch_id === dispatch.id &&
      c.truck_number === truck &&
      c.confirmation_type === currentConfType
    );

  const getTruckPriorConfirmations = (truck) =>
    confirmations
      .filter(c =>
        c.dispatch_id === dispatch.id &&
        c.truck_number === truck &&
        c.confirmation_type !== currentConfType
      )
      .sort((a, b) => new Date(b.confirmed_at || 0) - new Date(a.confirmed_at || 0));

  const singleTruck = session.code_type === 'Truck' ? myTrucks[0] : null;
  const existingEntry = timeEntries.find(te =>
    te.dispatch_id === dispatch.id && te.truck_number === singleTruck
  );

  const handleConfirmTruck = (truck) => {
    onConfirm(dispatch, truck, currentConfType);
  };

  const handleTimeEntry = (truck) => {
    if (!truck) return;
    onTimeEntry(dispatch, truck, startTime, endTime);
    setStartTime('');
    setEndTime('');
  };

  return (
    <Sheet open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto p-0">
        {/* Top bar */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-5 py-4 z-10">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2 flex-wrap text-base">
              <Badge className={`${statusColors[dispatch.status]} border text-xs font-medium`}>
                {dispatch.status}
              </Badge>
              {dispatch.toll_status && (
                <Badge className={`${tollColors[dispatch.toll_status]} text-xs font-medium`}>
                  {dispatch.toll_status}
                </Badge>
              )}
              <span className="text-xs text-slate-400 flex items-center gap-1 font-normal">
                {dispatch.shift_time === 'Day' ? <Sun className="h-3 w-3" /> : <Moon className="h-3 w-3" />}
                {dispatch.shift_time}
              </span>
              <span className="ml-auto text-xs text-slate-500 font-normal">
                {dispatch.date && format(new Date(dispatch.date), 'MMM d, yyyy')}
              </span>
            </SheetTitle>
          </SheetHeader>
        </div>

        <div className="px-5 py-5 space-y-6">

          {/* Main info */}
          {dispatch.status === 'Confirmed' ? (
            <div>
              <h2 className="font-semibold text-slate-900 text-lg">Confirmed Dispatch</h2>
              <p className="text-sm text-slate-500 mt-1 italic">Full dispatch details will be provided soon.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {dispatch.client_name && (
                <h2 className="font-semibold text-slate-900 text-lg">{dispatch.client_name}</h2>
              )}
              {companyName && (
                <p className="text-xs text-slate-400">{companyName}</p>
              )}

              <div className="grid grid-cols-1 gap-3 text-sm">
                {dispatch.job_number && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <FileText className="h-4 w-4 text-slate-400 shrink-0" />
                    <span>Job #{dispatch.job_number}</span>
                  </div>
                )}
                {dispatch.start_time && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <Clock className="h-4 w-4 text-slate-400 shrink-0" />
                    <span>{dispatch.start_time}</span>
                  </div>
                )}
                {dispatch.start_location && (
                  <div className="flex items-start gap-2 text-slate-600">
                    <MapPin className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                    <span className="whitespace-pre-wrap">{dispatch.start_location}</span>
                  </div>
                )}
              </div>

              {/* Trucks */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <Truck className="h-3.5 w-3.5 text-slate-400" />
                {myTrucks.map(t => (
                  <Badge key={t} variant="outline" className="text-xs border-slate-900 text-slate-900 font-medium">
                    {t}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {dispatch.status !== 'Confirmed' && (
            <>
              {dispatch.instructions && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Instructions</p>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{dispatch.instructions}</p>
                </div>
              )}

              {dispatch.notes && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Notes</p>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{dispatch.notes}</p>
                </div>
              )}

              {(dispatch.additional_assignments || []).length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Additional Assignments</p>
                  <div className="space-y-2">
                    {dispatch.additional_assignments.map((a, i) => (
                      <div key={i} className="bg-slate-50 rounded-lg border border-slate-200 p-3 text-sm">
                        <div className="flex items-center gap-2 text-slate-600 mb-1">
                          <Clock className="h-3.5 w-3.5 text-slate-400" />{a.start_time}
                          <MapPin className="h-3.5 w-3.5 text-slate-400 ml-2" />{a.start_location}
                        </div>
                        {a.instructions && <p className="text-xs text-slate-500 whitespace-pre-wrap mt-1">{a.instructions}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {templateNotes?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">General Notes</p>
                  <div className="space-y-1">
                    {templateNotes.map(n => (
                      <p key={n.id} className="text-sm text-slate-600">• {n.note_text}</p>
                    ))}
                  </div>
                </div>
              )}

              {dispatch.canceled_reason && (
                <div className="flex items-start gap-2 bg-red-50 rounded-lg p-4">
                  <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-red-700 mb-0.5">Cancellation Reason</p>
                    <p className="text-sm text-red-600">{dispatch.canceled_reason}</p>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Actions */}
          {dispatch.status !== 'Canceled' && (
            <div className="space-y-4 pt-2 border-t border-slate-100">

              {/* CompanyOwner confirm */}
              {isOwner && myTrucks.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                    Confirm Receipt — <span className="text-slate-700">{currentConfType}</span>
                  </p>
                  <div className="space-y-2">
                    {myTrucks.map(truck => {
                      const confirmed = isTruckConfirmedForCurrent(truck);
                      const conf = getTruckCurrentConfirmation(truck);
                      const priorConfs = getTruckPriorConfirmations(truck);
                      return (
                        <div key={truck} className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                          <div className="flex items-center justify-between px-3 py-2">
                            <div className="flex items-center gap-2">
                              <Truck className="h-3.5 w-3.5 text-slate-400" />
                              <span className="text-sm font-mono font-medium">{truck}</span>
                            </div>
                            {confirmed ? (
                              <div className="flex items-center gap-1.5 text-emerald-600">
                                <CheckCircle2 className="h-4 w-4" />
                                <span className="text-xs font-medium">Confirmed</span>
                                {conf?.confirmed_at && (
                                  <span className="text-xs text-slate-400 ml-1">
                                    {format(new Date(conf.confirmed_at), 'MMM d, h:mm a')}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <Button
                                size="sm"
                                className="bg-slate-900 hover:bg-slate-800 h-7 text-xs"
                                onClick={() => handleConfirmTruck(truck)}
                              >
                                <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                                Confirm Receipt
                              </Button>
                            )}
                          </div>
                          {priorConfs.length > 0 && (
                            <div className="border-t border-slate-100 px-3 py-2 bg-slate-50">
                              <p className="text-xs text-slate-400 mb-1">Prior confirmations:</p>
                              {priorConfs.map((c, i) => (
                                <div key={i} className="flex items-center gap-2 text-xs text-slate-500">
                                  <CheckCircle2 className="h-3 w-3 text-slate-400" />
                                  <span className="font-medium">{c.confirmation_type}</span>
                                  {c.confirmed_at && (
                                    <span className="text-slate-400">{format(new Date(c.confirmed_at), 'MMM d, h:mm a')}</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Time Entry (Truck only) */}
              {session.code_type === 'Truck' && singleTruck && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Log Time</p>
                  {existingEntry && (
                    <p className="text-xs text-slate-500 mb-2">
                      Logged: {existingEntry.start_time || '—'} → {existingEntry.end_time || '—'}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <Input
                      type="time"
                      value={startTime}
                      onChange={e => setStartTime(e.target.value)}
                      className="bg-white text-sm"
                    />
                    <Input
                      type="time"
                      value={endTime}
                      onChange={e => setEndTime(e.target.value)}
                      className="bg-white text-sm"
                    />
                    <Button
                      variant="outline"
                      onClick={() => handleTimeEntry(singleTruck)}
                      disabled={!startTime && !endTime}
                      className="shrink-0"
                    >
                      <Clock className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}