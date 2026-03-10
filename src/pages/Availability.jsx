import React from 'react';
import { useSession } from '@/components/session/SessionContext';
import { Card, CardContent } from '@/components/ui/card';
import AvailabilityManager from '@/components/availability/AvailabilityManager';

export default function Availability() {
  const { session } = useSession();

  if (session?.code_type !== 'CompanyOwner') {
    return (
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold text-slate-900">Availability</h2>
          <p className="text-sm text-slate-500 mt-2">Only company owners can access this page.</p>
        </CardContent>
      </Card>
    );
  }

  return <AvailabilityManager companyId={session.company_id} />;
}
