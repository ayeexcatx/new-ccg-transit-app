import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  CheckCircle2, Clock, MapPin, Truck, Sun, Moon,
  FileText, AlertTriangle, ChevronDown, ChevronUp
} from 'lucide-react';
import { format } from 'date-fns';

const statusColors = {
  Confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
  Dispatched: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Amended: 'bg-amber-50 text-amber-700 border-amber-200',
  Canceled: 'bg-red-50 text-red-700 border-red-200',
  Completed: 'bg-slate-100 text-slate-600 border-slate-200',
};

const tollColors = {
  Authorized: 'bg-green-50 text-green-700',
  Unauthorized: 'bg-red-50 text-red-700',
  'Included in Rate': 'bg-purple-50 text-purple-700',
};

export default function DispatchCard({
  dispatch, session, confirmations, timeEntries, templateNotes,
  onConfirm, onTimeEntry, companyName
}) {
  const [expanded, setExpanded] = useState(false);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [selectedTruck, setSelectedTruck] = useState(
    session.code_type === 'Truck' ? session.allowed_trucks?.[0] : ''
  );

  const myTrucks = (session.allowed_trucks || []).filter(t =>
    (dispatch.trucks_assigned || []).includes(t)
  );

  const truckConfirmations = confirmations.filter(c =>
    c.dispatch_id === dispatch.id && myTrucks.includes(c.truck_number)
  );

  const truckTimeEntries = timeEntries.filter(te =>
    te.dispatch_id === dispatch.id && myTrucks.includes(te.truck_number)
  );

  const handleConfirm = () => {
    const truck = session.code_type === 'Truck' ? myTrucks[0] : selectedTruck;
    if (!truck) return;
    onConfirm(dispatch, truck);
  };

  const handleTimeEntry = () => {
    const truck = session.code_type === 'Truck' ? myTrucks[0] : selectedTruck;
    if (!truck) return;
    onTimeEntry(dispatch, truck, startTime, endTime);
    setStartTime('');
    setEndTime('');
  };

  const existingEntry = truckTimeEntries.find(te =>
    te.truck_number === (session.code_type === 'Truck' ? myTrucks[0] : selectedTruck)
  );

  return (
    <Card className="overflow-hidden border-slate-200 hover:border-slate-300 transition-colors">
      <CardContent className="p-0">
        {/* Header */}
        <div className="p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={`${statusColors[dispatch.status]} border text-xs font-medium`}>
                {dispatch.status}
              </Badge>
              {dispatch.toll_status && (
                <Badge className={`${tollColors[dispatch.toll_status]} text-xs font-medium`}>
                  {dispatch.toll_status}
                </Badge>
              )}
              <span className="text-xs text-slate-400 flex items-center gap-1">
                {dispatch.shift_time === 'Day' ? <Sun className="h-3 w-3" /> : <Moon className="h-3 w-3" />}
                {dispatch.shift_time}
              </span>
            </div>
            <span className="text-xs text-slate-500 whitespace-nowrap">
              {dispatch.date && format(new Date(dispatch.date), 'MMM d, yyyy')}
            </span>
          </div>

          <div className="space-y-2">
            {dispatch.client_name && (
              <h3 className="font-semibold text-slate-900">{dispatch.client_name}</h3>
            )}
            {companyName && (
              <p className="text-xs text-slate-400">{companyName}</p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              {dispatch.job_number && (
                <div className="flex items-center gap-2 text-slate-600">
                  <FileText className="h-3.5 w-3.5 text-slate-400" />
                  Job #{dispatch.job_number}
                </div>
              )}
              {dispatch.start_time && (
                <div className="flex items-center gap-2 text-slate-600">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  {dispatch.start_time}
                </div>
              )}
              <div className="flex items-center gap-2 text-slate-600 sm:col-span-2">
                <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                {dispatch.start_location}
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap mt-2">
              <Truck className="h-3.5 w-3.5 text-slate-400" />
              {(dispatch.trucks_assigned || []).map(t => (
                <Badge key={t} variant="outline" className={`text-xs ${myTrucks.includes(t) ? 'border-slate-900 text-slate-900 font-medium' : 'text-slate-500'}`}>
                  {t}
                </Badge>
              ))}
            </div>
          </div>

          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-3 flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 transition-colors"
          >
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            {expanded ? 'Less details' : 'More details'}
          </button>
        </div>

        {/* Expanded */}
        {expanded && (
          <div className="border-t border-slate-100 p-4 sm:p-5 space-y-4 bg-slate-50/50">
            {dispatch.instructions && (
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">Instructions</p>
                <p className="text-sm text-slate-700">{dispatch.instructions}</p>
              </div>
            )}
            {dispatch.notes && (
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">Notes</p>
                <p className="text-sm text-slate-700">{dispatch.notes}</p>
              </div>
            )}

            {(dispatch.additional_assignments || []).length > 0 && (
              <div>
                <p className="text-xs font-medium text-slate-500 mb-2">Additional Assignments</p>
                <div className="space-y-2">
                  {dispatch.additional_assignments.map((a, i) => (
                    <div key={i} className="bg-white rounded-lg border border-slate-200 p-3 text-sm">
                      <div className="flex items-center gap-2 text-slate-600 mb-1">
                        <Clock className="h-3 w-3 text-slate-400" />{a.start_time}
                        <MapPin className="h-3 w-3 text-slate-400 ml-2" />{a.start_location}
                      </div>
                      {a.instructions && <p className="text-xs text-slate-500">{a.instructions}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {templateNotes?.length > 0 && (
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">General Notes</p>
                <div className="space-y-1">
                  {templateNotes.map(n => (
                    <p key={n.id} className="text-xs text-slate-600">• {n.note_text}</p>
                  ))}
                </div>
              </div>
            )}

            {dispatch.canceled_reason && (
              <div className="flex items-start gap-2 bg-red-50 rounded-lg p-3">
                <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-red-700">Canceled</p>
                  <p className="text-sm text-red-600">{dispatch.canceled_reason}</p>
                </div>
              </div>
            )}

            {/* Actions */}
            {dispatch.status !== 'Completed' && dispatch.status !== 'Canceled' && (
              <div className="space-y-3 pt-2">
                {session.code_type === 'CompanyOwner' && myTrucks.length > 1 && (
                  <Select value={selectedTruck} onValueChange={setSelectedTruck}>
                    <SelectTrigger className="w-full bg-white">
                      <SelectValue placeholder="Select truck" />
                    </SelectTrigger>
                    <SelectContent>
                      {myTrucks.map(t => (
                        <SelectItem key={t} value={t}>Truck {t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {/* Confirm */}
                {truckConfirmations.length === 0 && (
                  <Button
                    onClick={handleConfirm}
                    className="w-full bg-slate-900 hover:bg-slate-800"
                    disabled={session.code_type === 'CompanyOwner' && !selectedTruck}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Confirm Receipt
                  </Button>
                )}
                {truckConfirmations.length > 0 && (
                  <div className="text-center text-xs text-emerald-600 flex items-center justify-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Confirmed by truck {truckConfirmations.map(c => c.truck_number).join(', ')}
                  </div>
                )}

                {/* Time Entry */}
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-2">Log Time</p>
                  {existingEntry && (
                    <p className="text-xs text-slate-500 mb-2">
                      Current: {existingEntry.start_time || '—'} → {existingEntry.end_time || '—'}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <Input
                      type="time"
                      value={startTime}
                      onChange={e => setStartTime(e.target.value)}
                      placeholder="Start"
                      className="bg-white text-sm"
                    />
                    <Input
                      type="time"
                      value={endTime}
                      onChange={e => setEndTime(e.target.value)}
                      placeholder="End"
                      className="bg-white text-sm"
                    />
                    <Button
                      variant="outline"
                      onClick={handleTimeEntry}
                      disabled={!startTime && !endTime}
                      className="shrink-0"
                    >
                      <Clock className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}