import React from 'react';
import { Clock, FileText } from 'lucide-react';

function DetailTextRow({ label, value, valueClassName = '' }) {
  if (!value) return null;
  return (
    <div className="rounded-lg border border-slate-200/80 bg-white/80 px-3 py-2.5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-600">{label}</p>
      <p className={`mt-1 whitespace-pre-wrap text-sm leading-relaxed text-slate-700 ${valueClassName}`}>{value}</p>
    </div>
  );
}

function AssignmentDetailBlock({ assignment, iconSize = 'h-4 w-4', textColor = 'text-slate-700' }) {
  return (
    <>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {assignment.job_number && (
          <div className="rounded-lg border border-slate-200/80 bg-slate-50/70 px-3 py-2">
            <div className="flex items-center gap-2">
              <FileText className={`${iconSize} shrink-0 text-slate-400`} />
              <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-600">Job #</span>
            </div>
            <p className="mt-1 text-sm font-medium leading-relaxed text-slate-700">{assignment.job_number}</p>
          </div>
        )}
        {assignment.start_time && (
          <div className={`flex items-center gap-2 rounded-lg border border-slate-200/80 bg-white px-3 py-2 text-sm ${textColor}`}>
            <Clock className={`${iconSize} text-slate-400 shrink-0`} />
            <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-600">Start Time</span>
            <span className="font-medium text-slate-700">{assignment.formatTimeToAmPm(assignment.start_time)}</span>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <DetailTextRow
          label="Start Location"
          value={assignment.start_location}
          valueClassName={`${assignment.contentTextClass || 'text-slate-600'} ${assignment.contentExtraClass || ''}`}
        />
        <DetailTextRow
          label="Instructions"
          value={assignment.instructions}
          valueClassName={`${assignment.contentTextClass || 'text-slate-600'} ${assignment.contentExtraClass || ''}`}
        />
        <DetailTextRow
          label="Notes"
          value={assignment.notes}
          valueClassName={`${assignment.contentTextClass || 'text-slate-600'} ${assignment.contentExtraClass || ''}`}
        />
        <DetailTextRow
          label="Tolls"
          value={assignment.toll_status}
          valueClassName={`${assignment.contentTextClass || 'text-slate-600'} ${assignment.contentExtraClass || ''}`}
        />
      </div>
    </>
  );
}

export default function DispatchDrawerAssignmentsSection({ dispatch, hasAdditional, formatTimeToAmPm }) {
  if (!(hasAdditional || dispatch.instructions || dispatch.notes || dispatch.toll_status || dispatch.start_time || dispatch.start_location)) {
    return null;
  }

  const primary = { ...dispatch, formatTimeToAmPm, contentTextClass: 'text-slate-700', contentExtraClass: 'leading-relaxed' };

  return (
    <section className="space-y-3">
      <div data-tour="dispatch-assignment-details" className="rounded-2xl border border-slate-200/80 bg-gradient-to-b from-white to-slate-50/70 p-3.5 sm:p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-500">
          {(dispatch.additional_assignments || []).length > 0 ? 'Assignment 1' : 'Assignment'}
        </p>
        <div className="mt-2.5 space-y-3">
          <AssignmentDetailBlock assignment={primary} />
        </div>
      </div>

      {(dispatch.additional_assignments || []).length > 0 && (
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-500">Additional Assignments</p>
          <div className="space-y-2.5">
            {dispatch.additional_assignments.map((assignment, i) => {
              const entry = { ...assignment, formatTimeToAmPm, contentTextClass: 'text-slate-600', contentExtraClass: '' };
              return (
                <div key={i} className={`rounded-xl border border-slate-200/80 p-3 text-sm ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/55'}`}>
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-500">Assignment {i + 2}</p>
                  <div className="space-y-3">
                    <AssignmentDetailBlock assignment={entry} iconSize="h-3.5 w-3.5" textColor="text-slate-700" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
