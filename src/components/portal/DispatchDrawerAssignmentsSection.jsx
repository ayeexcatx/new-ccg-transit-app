import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock, FileText } from 'lucide-react';

const tollColors = {
  Authorized: 'bg-green-50 text-green-700',
  Unauthorized: 'bg-red-50 text-red-700',
  'Included in Rate': 'bg-purple-50 text-purple-700',
};

function AssignmentDetailBlock({ assignment, iconSize = 'h-4 w-4', textColor = 'text-slate-700' }) {
  return (
    <>
      {assignment.job_number && (
        <div className="space-y-0.5">
          <div className={`flex items-center gap-2 ${textColor}`}>
            <FileText className={`${iconSize} text-slate-400 shrink-0`} />
            <span className="font-bold">Job #</span>
            <Badge className="bg-black px-2 py-0.5 text-[11px] font-semibold text-white hover:bg-black">
              {assignment.job_number}
            </Badge>
          </div>
        </div>
      )}
      {assignment.start_time && (
        <div className={`flex items-center gap-2 ${textColor}`}>
          <Clock className={`${iconSize} text-slate-400 shrink-0`} />
          <span>{assignment.formatTimeToAmPm(assignment.start_time)}</span>
        </div>
      )}
      {assignment.start_location && (
        <div>
          <p className="text-xs font-semibold text-slate-400 mb-0.5">Start Location:</p>
          <p className={`text-sm ${assignment.contentTextClass || 'text-slate-600'} whitespace-pre-wrap ${assignment.contentExtraClass || ''}`}>{assignment.start_location}</p>
        </div>
      )}
      {assignment.instructions && (
        <div>
          <p className="text-xs font-semibold text-slate-400 mb-0.5">Instructions:</p>
          <p className={`text-sm ${assignment.contentTextClass || 'text-slate-600'} whitespace-pre-wrap ${assignment.contentExtraClass || ''}`}>{assignment.instructions}</p>
        </div>
      )}
      {assignment.notes && (
        <div>
          <p className="text-xs font-semibold text-slate-400 mb-0.5">Notes</p>
          <p className={`text-sm ${assignment.contentTextClass || 'text-slate-600'} whitespace-pre-wrap ${assignment.contentExtraClass || ''}`}>{assignment.notes}</p>
        </div>
      )}
      {assignment.toll_status && (
        <Badge className={`${tollColors[assignment.toll_status]} text-xs font-medium`}>
          Toll: {assignment.toll_status}
        </Badge>
      )}
    </>
  );
}

export default function DispatchDrawerAssignmentsSection({ dispatch, hasAdditional, formatTimeToAmPm }) {
  if (!(hasAdditional || dispatch.instructions || dispatch.notes || dispatch.toll_status || dispatch.start_time || dispatch.start_location)) {
    return null;
  }

  const primary = { ...dispatch, formatTimeToAmPm, contentTextClass: 'text-slate-700', contentExtraClass: 'leading-relaxed' };

  return (
    <>
      <div data-tour="dispatch-assignment-details" className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-3">
        <p className="text-xs text-slate-500 uppercase tracking-wide">
          {(dispatch.additional_assignments || []).length > 0 ? 'Assignment 1' : 'Assignment'}
        </p>
        {hasAdditional && (
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <FileText className="h-4 w-4 text-slate-400 shrink-0" />
              <span className="font-bold">Job #</span>
              {dispatch.job_number && (
                <Badge className="bg-black px-2 py-0.5 text-[11px] font-semibold text-white hover:bg-black">
                  {dispatch.job_number}
                </Badge>
              )}
            </div>
          </div>
        )}
        <AssignmentDetailBlock assignment={{ ...primary, job_number: undefined }} />
      </div>

      {(dispatch.additional_assignments || []).length > 0 && (
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Additional Assignments</p>
          <div className="space-y-3">
            {dispatch.additional_assignments.map((assignment, i) => {
              const entry = { ...assignment, formatTimeToAmPm, contentTextClass: 'text-slate-600', contentExtraClass: '' };
              return (
                <div key={i} className={`rounded-lg border border-slate-200 p-3 text-sm ${i % 2 === 0 ? 'bg-slate-50' : 'bg-blue-50/40'}`}>
                  <p className="text-xs font-semibold text-slate-500 mb-2">Assignment {i + 2}</p>
                  <div className="space-y-1.5">
                    <AssignmentDetailBlock assignment={entry} iconSize="h-3.5 w-3.5" textColor="text-slate-700" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
