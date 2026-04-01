import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, KeyRound, Menu, Pencil, Phone, Trash2, TriangleAlert, UserRound } from 'lucide-react';
import { formatPhoneNumber, getDriverSmsState } from '@/lib/sms';
import DriverSmsStatus from '@/components/drivers/DriverSmsStatus';

function DriverActionButtons({ desktop = false, onEdit, onDelete, onRequestCode, requestLabel, requestDisabled }) {
  if (desktop) {
    return (
      <>
        <Button variant="ghost" size="icon" onClick={onEdit} className="h-8 w-8"><Pencil className="h-3.5 w-3.5" /></Button>
        <Button variant="ghost" size="icon" onClick={onDelete} className="h-8 w-8 text-red-500 hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /></Button>
        <Button variant="outline" size="sm" onClick={onRequestCode} disabled={requestDisabled} className="text-xs bg-red-600 text-white hover:bg-red-700"><KeyRound className="h-3.5 w-3.5 mr-1" />{requestLabel}</Button>
      </>
    );
  }

  return (
    <>
      <Button variant="ghost" size="icon" onClick={onEdit} className="h-9 w-9 rounded-full"><Pencil className="h-4 w-4" /></Button>
      <Button variant="ghost" size="icon" onClick={onDelete} className="h-9 w-9 rounded-full text-red-500 hover:text-red-600"><Trash2 className="h-4 w-4" /></Button>
      <Button variant="outline" size="sm" onClick={onRequestCode} disabled={requestDisabled} className="h-9 rounded-full border-red-200 bg-red-600 px-3 text-xs font-medium text-white shadow-sm hover:bg-red-700"><KeyRound className="mr-1 h-3.5 w-3.5" />{requestLabel}</Button>
    </>
  );
}

function DriverSmsGuidance({ ownerSmsEnabled, desktop = false }) {
  if (ownerSmsEnabled) {
    if (desktop) {
      return (
        <p className="mt-2 pr-6 text-xs leading-5 text-red-600">
          Please have your driver opt in to SMS notifications by clicking the menu button <Menu className="mx-0.5 inline h-3.5 w-3.5 align-text-bottom" /> then going to Profile and enabling SMS notifications.
        </p>
      );
    }

    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs leading-5 text-red-700">
        <div className="flex items-start gap-2">
          <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <p>
            Please have your driver opt in to SMS notifications by clicking the menu button <Menu className="mx-0.5 inline h-3.5 w-3.5 align-text-bottom" /> then going to Profile and enabling SMS notifications.
          </p>
        </div>
      </div>
    );
  }

  return <p className={desktop ? 'text-xs text-slate-500 mt-2' : 'text-xs text-slate-500'}>This driver will not receive notifications on their phone. They will only see pending notifications when they open the app.</p>;
}

export default function DriverCard({ driver, onEdit, onDelete, onRequestCode, requestDisabled }) {
  const status = driver.status || (driver.active_flag === false ? 'Inactive' : 'Active');
  const accessCodeStatus = driver.access_code_status || 'Not Requested';
  const requestLabel = accessCodeStatus === 'Pending' ? 'Pending' : accessCodeStatus === 'Created' ? 'Created' : 'Request Code';
  const smsState = getDriverSmsState(driver);

  return (
    <Card className="overflow-hidden border-slate-200 shadow-sm shadow-slate-200/70 sm:shadow-none">
      <CardContent className="p-3.5 sm:p-4">
        <div className="space-y-3 sm:hidden">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-base font-semibold text-slate-900">{driver.driver_name || 'Unnamed driver'}</p>
                <Badge variant={status === 'Active' ? 'default' : 'secondary'} className="shrink-0">{status}</Badge>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <DriverActionButtons
                onEdit={onEdit}
                onDelete={onDelete}
                onRequestCode={onRequestCode}
                requestLabel={requestLabel}
                requestDisabled={requestDisabled}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            <Badge variant={smsState.effective ? 'default' : 'secondary'} className="text-[11px]">{smsState.effective ? <><Check className="mr-1 h-3 w-3" />SMS Active</> : 'SMS Not Active'}</Badge>
          </div>

          {driver.phone && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Phone className="h-4 w-4 text-slate-400" />
              <span>{formatPhoneNumber(driver.phone)}</span>
            </div>
          )}

          {driver.notes && <p className="text-sm text-slate-500">{driver.notes}</p>}

          <DriverSmsStatus driver={driver} />
          <DriverSmsGuidance ownerSmsEnabled={driver.owner_sms_enabled} />
        </div>

        <div className="hidden items-start justify-between gap-3 sm:flex">
          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <UserRound className="h-4 w-4 text-slate-500" />
              <p className="font-medium text-slate-900">{driver.driver_name || 'Unnamed driver'}</p>
              <Badge variant={status === 'Active' ? 'default' : 'secondary'}>{status}</Badge>
              <Badge variant={smsState.effective ? 'default' : 'secondary'} className="text-[11px]">{smsState.effective ? <><Check className="h-3 w-3 mr-1" />SMS Active</> : 'SMS Not Active'}</Badge>
            </div>
            {driver.phone && <p className="text-sm text-slate-600">Phone: {driver.phone}</p>}
            {driver.notes && <p className="text-sm text-slate-500">{driver.notes}</p>}
            <DriverSmsStatus driver={driver} desktop />
            <DriverSmsGuidance ownerSmsEnabled={driver.owner_sms_enabled} desktop />
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <DriverActionButtons
              desktop
              onEdit={onEdit}
              onDelete={onDelete}
              onRequestCode={onRequestCode}
              requestLabel={requestLabel}
              requestDisabled={requestDisabled}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
