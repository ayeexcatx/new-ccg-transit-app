import React, { useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from '@/components/session/SessionContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { UserRound, Plus, Pencil, KeyRound, Trash2, Check } from 'lucide-react';

const defaultForm = {
  driver_name: '',
  phone: '',
  sms_enabled: false,
  notes: '',
  status: 'Active',
};

const formatPhoneNumber = (value) => {
  const rawDigits = String(value || '').replace(/\D/g, '');
  const digits = rawDigits.length === 11 && rawDigits.startsWith('1')
    ? rawDigits.slice(1)
    : rawDigits.slice(0, 10);

  if (!digits) return '';
  if (digits.length < 4) return `(${digits}`;
  if (digits.length < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
};

export default function Drivers() {
  const { session } = useSession();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [errors, setErrors] = useState({});
  const [driverToDelete, setDriverToDelete] = useState(null);

  const { data: drivers = [], isLoading } = useQuery({
    queryKey: ['drivers', session?.company_id],
    queryFn: () => base44.entities.Driver.filter({ company_id: session.company_id }, '-created_date', 200),
    enabled: !!session?.company_id,
  });

  const sortedDrivers = useMemo(
    () => [...drivers].sort((a, b) => (a.driver_name || '').localeCompare(b.driver_name || '')),
    [drivers],
  );

  const saveMutation = useMutation({
    mutationFn: (payload) => {
      if (editing) return base44.entities.Driver.update(editing.id, payload);
      return base44.entities.Driver.create({
        ...payload,
        company_id: session.company_id,
        access_code_status: 'Not Requested',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers', session?.company_id] });
      setOpen(false);
      setEditing(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Driver.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers', session?.company_id] });
      queryClient.invalidateQueries({ queryKey: ['drivers-all'] });
      setDriverToDelete(null);
    },
  });

  const requestCodeMutation = useMutation({
    mutationFn: (driver) => base44.entities.Driver.update(driver.id, {
      access_code_status: 'Pending',
      requested_by_access_code_id: session?.id,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers', session?.company_id] });
      queryClient.invalidateQueries({ queryKey: ['drivers-all'] });
    },
  });

  const openCreate = () => {
    setEditing(null);
    setForm(defaultForm);
    setErrors({});
    setOpen(true);
  };

  const openEdit = (driver) => {
    setEditing(driver);
    setForm({
      driver_name: driver.driver_name || '',
      phone: formatPhoneNumber(driver.phone || ''),
      sms_enabled: driver.sms_enabled === true,
      notes: driver.notes || '',
      status: driver.status || 'Active',
    });
    setErrors({});
    setOpen(true);
  };

  const handleSave = () => {
    const nextErrors = {};
    if (!form.driver_name.trim()) nextErrors.driver_name = 'Driver name is required.';
    if (!form.phone.trim()) nextErrors.phone = 'Phone number is required.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    saveMutation.mutate({
      driver_name: form.driver_name.trim(),
      phone: form.phone.trim(),
      sms_enabled: form.sms_enabled === true,
      notes: form.notes,
      status: form.status,
      active_flag: form.status === 'Active',
    });
  };

  if (session?.code_type !== 'CompanyOwner') {
    return <div className="text-sm text-slate-500">Driver management is only available to company owners.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Drivers</h2>
          <p className="text-sm text-slate-500">Manage drivers for your company</p>
        </div>
        <Button onClick={openCreate} className="bg-slate-900 hover:bg-slate-800">
          <Plus className="h-4 w-4 mr-1" />Add Driver
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin h-6 w-6 border-2 border-slate-300 border-t-slate-700 rounded-full" />
        </div>
      ) : sortedDrivers.length === 0 ? (
        <div className="text-center py-12 text-sm text-slate-500">No drivers added yet.</div>
      ) : (
        <div className="grid gap-3">
          {sortedDrivers.map((driver) => {
            const status = driver.status || (driver.active_flag === false ? 'Inactive' : 'Active');
            const accessCodeStatus = driver.access_code_status || 'Not Requested';
            const canRequestCode = accessCodeStatus === 'Not Requested';
            const requestLabel = accessCodeStatus === 'Pending'
              ? 'Pending'
              : accessCodeStatus === 'Created'
                ? 'Created'
                : 'Request Code';
            return (
              <Card key={driver.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <UserRound className="h-4 w-4 text-slate-500" />
                        <p className="font-medium text-slate-900">{driver.driver_name || 'Unnamed driver'}</p>
                        <Badge variant={status === 'Active' ? 'default' : 'secondary'}>{status}</Badge>
                        <Badge variant="outline">{driver.access_code_status || 'Not Requested'}</Badge>
                      </div>
                      {driver.phone && <p className="text-sm text-slate-600 flex items-center gap-2 flex-wrap">Phone: {driver.phone}<Badge variant={driver.sms_enabled ? 'default' : 'secondary'} className="text-[11px]">{driver.sms_enabled ? <><Check className="h-3 w-3 mr-1" />SMS On</> : 'SMS Off'}</Badge></p>}
                      {driver.notes && <p className="text-sm text-slate-500">{driver.notes}</p>}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(driver)} className="h-8 w-8">
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDriverToDelete(driver)} className="h-8 w-8 text-red-500 hover:text-red-600">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => requestCodeMutation.mutate(driver)}
                        disabled={requestCodeMutation.isPending || !canRequestCode}
                        className="text-xs"
                      >
                        <KeyRound className="h-3.5 w-3.5 mr-1" />
                        {requestLabel}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Card className="border-slate-200 bg-slate-50/60">
        <CardContent className="p-5 space-y-6">
          <section className="space-y-2">
            <h3 className="text-lg font-semibold text-slate-900">Driver Portal</h3>
            <p className="text-sm leading-6 text-slate-700">
              A driver portal <span className="font-medium">ONLY</span> has the ability to view driver-specific announcements, dispatches that they are
              assigned to (normal dispatch details only), and have the ability to report incidents. <span className="font-medium">They do not</span> have the ability to view or see 
              ANYTHING else, including the confirmation logs, other drivers, or even other trucks assigned to the same dispatch.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-lg font-semibold text-slate-900">Assigning Drivers</h3>
            <ul className="list-disc pl-5 space-y-2 text-sm leading-6 text-slate-700">
              <li>
                A driver can only see a dispatch and receive notifications <span className="font-medium">IF</span> and <span className="font-medium">WHEN</span> you assign them to a 
                truck number on a dispatch.
              </li>
              <li>
                When you  <span className="font-medium">select a driver</span> on a dispatch, a copy of the dispatch and a notification will be sent to the
                driver. {' '}
                <span className="font-medium text-emerald-600">&ldquo;You have received a new dispatch&rdquo;</span>
              </li>
              <li>
                Do not select a driver <span className="font-medium">until</span> you are ready to share the dispatch with them.
                </li> 
              <li>
                Any changes made  <span className="font-medium">by the dispatcher</span> (CCG) after a driver is assigned will also be received by the driver as long
                as they remain assigned. ( <span className="text-amber-600">Amendments</span>,{' '}
                <span className="text-red-600">Cancellations</span> )
              </li>
              <li>
                If you <span className="font-medium">remove a driver</span> from the dispatch assignment, they will
                immediately receive a <span className="font-medium text-red-600">cancellation</span> notification.
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="text-lg font-semibold text-slate-900">Changing Drivers / Trucks</h3>
            <ul className="list-disc pl-5 space-y-2 text-sm leading-6 text-slate-700">
              <li>
                If you have a driver assigned and you <span className="font-medium">switch the driver</span> in the
                dropdown menu, the driver you removed will immediately receive a{' '}
                <span className="text-red-600">cancellation</span> notification, and the driver you added will
                immediately receive a <span className="text-emerald-600">new dispatch</span> notification.
              </li>
            </ul>
            <p className="pl-5 text-sm text-slate-500 italic leading-6">
              Example: Switch Driver 1 to Driver 2<br />
              Driver 1 = cancellation notification<br />
              Driver 2 = new dispatch notification
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm leading-6 text-slate-700">
              <li>
                If you <span className="font-medium">switch a truck</span> that currently has a driver assigned, the
                driver assignment will <span className="font-medium">RESET</span> and the driver will receive a <span className="text-red-600">cancellation</span> notification.
                They will no longer be able to view the dispatch.
              </li>
              </ul>
            <p className="pl-5 text-sm text-slate-500 italic leading-6">
              Example: Truck 1 (which has Driver 1 assigned) is switched to Truck 2 which is not dispatched:<br />
              The driver assignment is RESET (driver removed), so Driver 1 will receive a cancellation
              notification. Reassign them to Truck 2 to send them a new dispatch notification, or choose a new driver to send the new dispatch to them.
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm leading-6 text-slate-700">
            <li>
                If you <span className="font-medium">swap trucks</span> that currently have drivers assigned, the
                driver assignments will <span className="font-medium">RESET</span> and the drivers will both receive a <span className="text-red-600">cancellation</span> notification.
                They will no longer be able to view the dispatches until you reassign them. When you reassign them, they will receive a new dispatch notification.
              </li>
            </ul>
            <p className="pl-5 text-sm text-slate-500 italic leading-6">
              Example: Truck 1 has Driver 1 assigned AND is switched to Truck 2 that has Driver 2 assigned:<br />
              Both trucks will have their drivers RESET (drivers removed), so both drivers will receive a cancellation
              notification. Reassign them to send the new dispatch.
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm leading-6 text-slate-700">
              <li>
                Please make sure to double-check all the selections and changes you make, and that you <span className="font-medium">reassign</span> the drivers to the correct dispatch
                if you <span className="font-medium">switch trucks</span>.
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="text-lg font-semibold text-slate-900">Passive Driver Notifications</h3>
            <ul className="list-disc pl-5 space-y-2 text-sm leading-6 text-slate-700">
              <li>
                If you <span className="font-medium">select a driver and do nothing else</span>, they will receive
                notifications and dispatch updates the same way you receive them, except they will only receive the
                ones pertaining to the dispatch they are <span className="font-medium">assigned</span> to.
              </li>
              <li>
              What you see on your screen is exactly how things stand. If you have your driver selected to a dispatch, your driver can also see that dispatch. <br />
              If you have <span className="font-medium">'No Driver Selected'</span> on your dispatch, then your driver cannot see that dispatch. 
              </li>
            </ul>
          </section>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Driver' : 'Add Driver'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Driver Name *</Label>
              <Input
                value={form.driver_name}
                onChange={(e) => {
                  const value = e.target.value;
                  setForm((prev) => ({ ...prev, driver_name: value }));
                  if (errors.driver_name && value.trim()) setErrors((prev) => ({ ...prev, driver_name: '' }));
                }}
                placeholder="Driver name"
              />
              {errors.driver_name && <p className="mt-1 text-xs text-red-600">{errors.driver_name}</p>}
            </div>
            <div>
              <Label>Phone Number *</Label>
              <Input
                value={form.phone}
                onChange={(e) => {
                  const value = formatPhoneNumber(e.target.value);
                  setForm((prev) => ({ ...prev, phone: value }));
                  if (errors.phone && value.trim()) setErrors((prev) => ({ ...prev, phone: '' }));
                }}
                placeholder="Phone number"
              />
              {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <Label>Receive SMS notifications</Label>
                <p className="text-xs text-slate-500">Enable SMS opt-in for this driver.</p>
              </div>
              <Switch
                checked={form.sms_enabled === true}
                onCheckedChange={(checked) => setForm((prev) => ({ ...prev, sms_enabled: checked }))}
              />
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="Notes"
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <Label>Active</Label>
                <p className="text-xs text-slate-500">Inactive drivers remain in records but cannot be treated as active.</p>
              </div>
              <Switch
                checked={form.status === 'Active'}
                onCheckedChange={(checked) => setForm((prev) => ({ ...prev, status: checked ? 'Active' : 'Inactive' }))}
              />
            </div>
            <Button onClick={handleSave} disabled={saveMutation.isPending} className="w-full bg-slate-900 hover:bg-slate-800">
              {saveMutation.isPending ? 'Saving...' : 'Save Driver'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!driverToDelete} onOpenChange={(openState) => !openState && setDriverToDelete(null)}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Driver</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to delete this driver?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => driverToDelete && deleteMutation.mutate(driverToDelete.id)} disabled={deleteMutation.isPending}>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
