import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BellRing } from 'lucide-react';

export default function AvailabilityRequestPrompt({ onGoToAvailability, onDismiss }) {
  return (
    <Card className="border-amber-200 bg-amber-50/70">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <BellRing className="h-5 w-5 text-amber-700 mt-0.5" />
          <div className="flex-1 min-w-0 space-y-2">
            <div>
              <p className="text-sm font-semibold text-amber-900">CCG requested your availability.</p>
              <p className="text-sm text-amber-800">Please update your availability.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={onGoToAvailability}>Go to Availability</Button>
              <Button size="sm" variant="outline" onClick={onDismiss}>Later</Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
