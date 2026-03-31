import React from 'react';
import { NOTE_TYPES, renderSimpleMarkupToHtml } from '@/lib/templateNotes';

function getGeneralNoteLayout(note) {
  const bullets = note.bullet_lines?.length > 0
    ? note.bullet_lines
    : note.note_text
      ? [note.note_text]
      : [];

  const titleLength = (note.title || '').trim().length;
  const bulletLengths = bullets.map((line) => String(line || '').trim().length);
  const totalTextLength = titleLength + bulletLengths.reduce((sum, len) => sum + len, 0);
  const longestBulletLength = Math.max(0, ...bulletLengths);
  const bulletCount = bullets.length;

  const shouldSpanWide = (
    totalTextLength > 220
    || bulletCount >= 5
    || longestBulletLength > 90
    || (Boolean(note.title) && bulletCount >= 3 && totalTextLength > 150)
  );

  return {
    bullets,
    shouldSpanWide,
  };
}

function getNoteColumnClass(displayWidth, autoShouldSpanWide = false, NOTE_DISPLAY_WIDTH) {
  if (displayWidth === NOTE_DISPLAY_WIDTH.FULL) return 'col-span-2';
  if (displayWidth === NOTE_DISPLAY_WIDTH.HALF) return 'col-span-1';
  return autoShouldSpanWide ? 'col-span-2 md:col-span-2' : 'col-span-2 md:col-span-1';
}

export default function DispatchDrawerTemplateNotesSection({ boxNotes, generalNotes, NOTE_DISPLAY_WIDTH }) {
  return (
    <>
      {boxNotes.length > 0 && (
        <div data-tour="dispatch-notes" className="space-y-1.5">
          <div className="rounded-md border border-slate-700/60 bg-slate-800/90 px-2.5 py-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-100">Box Notes</p>
          </div>
          <div className="grid grid-cols-2 gap-1.5 md:gap-2">
            {boxNotes.map((n) => (
              <div key={n.id} className={`rounded-lg border p-2.5 md:p-3 ${getNoteColumnClass(n.displayWidth, false, NOTE_DISPLAY_WIDTH)}`} style={{ borderColor: n.border_color, color: n.text_color }}>
                {n.title && <p className="text-sm font-semibold leading-snug mb-0.5">{n.title}</p>}
                <p
                  className="text-sm leading-snug"
                  dangerouslySetInnerHTML={{ __html: renderSimpleMarkupToHtml(n.box_content || n.note_text) }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {generalNotes.length > 0 && (
        <div data-tour="dispatch-notes" className="space-y-1.5">
          <div className="rounded-md border border-slate-700/60 bg-slate-800/90 px-2.5 py-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-100">General Notes</p>
          </div>
          <div className="grid grid-cols-2 gap-1.5 md:gap-2">
            {generalNotes.map((n) => {
              const { bullets, shouldSpanWide } = getGeneralNoteLayout(n);

              if (bullets.length === 0 && !n.title) return null;

              return (
                <div
                  key={n.id}
                  className={`rounded-lg border border-slate-200 bg-white/90 p-2.5 md:p-3 ${getNoteColumnClass(n.displayWidth, shouldSpanWide, NOTE_DISPLAY_WIDTH)}`}
                >
                  {n.title && <p className="text-sm text-slate-700 font-semibold leading-snug mb-0.5">{n.title}</p>}
                  <ul className="mt-0.5 space-y-0.5 list-disc ml-4">
                    {bullets.map((line, idx) => (
                      <li key={`${n.id}-${idx}`} className="text-sm text-slate-600 leading-snug">{line}</li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}

export { NOTE_TYPES };
