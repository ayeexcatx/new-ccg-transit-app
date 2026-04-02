import React from 'react';

export default function DriverProtocolContent({ contentHtml }) {
  if (!contentHtml) {
    return <p className="text-sm text-slate-500">No driver protocol has been published yet.</p>;
  }

  return (
    <div
      className="driver-protocol-content space-y-4 text-sm text-slate-700 [&_h1]:text-2xl [&_h1]:font-semibold [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:text-base [&_h3]:font-semibold [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-1"
      dangerouslySetInnerHTML={{ __html: contentHtml }}
    />
  );
}
