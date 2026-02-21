import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Trash2 } from 'lucide-react';

export default function DispatchForm({ dispatch, companies, onSave, onCancel, saving }) {
  const [form, setForm] = useState({
    company_id: '', date: '', shift_time: 'Day', client_name: '', job_number: '',
    start_time: '', start_location: '', instructions: 'Deliver material to / from',
    notes: '', toll_status: '', trucks_assigned: [],
    status: 'Confirmed', additional_assignments: [],
    amendment_history: [], canceled_reason: '',
  });

  useEffect(() => {
    if (dispatch) {
      setForm({
        company_id: dispatch.company_id || '',
        date: dispatch.date || '',
        shift_time: dispatch.shift_time || 'Day',
        client_name: dispatch.client_name || '',
        job_number: dispatch.job_number || '',
        start_time: dispatch.start_time || '',
        start_location: dispatch.start_location || '',
        instructions: dispatch.instructions || 'Deliver material to / from',
        notes: dispatch.notes || '',
        toll_status: dispatch.toll_status || '',
        trucks_assigned: dispatch.trucks_assigned || [],
        status: dispatch.status || 'Confirmed',
        additional_assignments: dispatch.additional_assignments || [],
        amendment_history: dispatch.amendment_history || [],
        canceled_reason: dispatch.canceled_reason || '',
      });
    }
  }, [dispatch]);

  const selectedCompany = companies.find(c => c.id === form.company_id);
  const availableTrucks = selectedCompany?.trucks || [];

  const toggleTruck = (t) => {
    setForm(prev => ({
      ...prev,
      trucks_assigned: prev.trucks_assigned.includes(t)
        ? prev.trucks_assigned.filter(x => x !== t)
        : [...prev.trucks_assigned, t]
    }));
  };

  const addAssignment = () => {
    setForm(prev => ({
      ...prev,
      additional_assignments: [...prev.additional_assignments, { start_time: '', start_location: '', instructions: '' }]
    }));
  };

  const updateAssignment = (idx, field, val) => {
    const arr = [...form.additional_assignments];
    arr[idx] = { ...arr[idx], [field]: val };
    setForm({ ...form, additional_assignments: arr });
  };

  const removeAssignment = (idx) => {
    setForm({ ...form, additional_assignments: form.additional_assignments.filter((_, i) => i !== idx) });
  };

  const handleSubmit = () => {
    if (!form.company_id || !form.date || !form.start_location || form.trucks_assigned.length === 0) return;

    // Track amendments
    let finalForm = { ...form };
    if (dispatch) {
      const changes = [];
      if (dispatch.status !== form.status) changes.push(`Status: ${dispatch.status} → ${form.status}`);
      if (dispatch.start_location !== form.start_location) changes.push(`Location changed`);
      if (dispatch.start_time !== form.start_time) changes.push(`Time changed`);
      if (JSON.stringify(dispatch.trucks_assigned) !== JSON.stringify(form.trucks_assigned)) changes.push(`Trucks changed`);
      if (changes.length > 0) {
        finalForm.amendment_history = [
          ...(finalForm.amendment_history || []),
          { amended_at: new Date().toISOString(), changes: changes.join('; ') }
        ];
      }
    }
    onSave(finalForm);
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label>Company *</Label>
          <Select value={form.company_id} onValueChange={v => setForm({ ...form, company_id: v, trucks_assigned: [] })}>
            <SelectTrigger><SelectValue placeholder="Select company" /></SelectTrigger>
            <SelectContent>
              {companies.filter(c => c.status === 'active').map(c => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Status</Label>
          <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {['Confirmed', 'Dispatched', 'Amended', 'Canceled', 'Completed'].map(s => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Date *</Label>
          <Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
        </div>
        <div>
          <Label>Shift</Label>
          <Select value={form.shift_time} onValueChange={v => setForm({ ...form, shift_time: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Day">Day</SelectItem>
              <SelectItem value="Night">Night</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Client Name</Label>
          <Input value={form.client_name} onChange={e => setForm({ ...form, client_name: e.target.value })} />
        </div>
        <div>
          <Label>Job Number</Label>
          <Input value={form.job_number} onChange={e => setForm({ ...form, job_number: e.target.value })} />
        </div>
        <div>
          <Label>Start Time</Label>
          <Input type="time" value={form.start_time} onChange={e => setForm({ ...form, start_time: e.target.value })} />
        </div>
        <div>
          <Label>Toll Status</Label>
          <Select value={form.toll_status} onValueChange={v => setForm({ ...form, toll_status: v })}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Authorized">Authorized</SelectItem>
              <SelectItem value="Unauthorized">Unauthorized</SelectItem>
              <SelectItem value="Included in Rate">Included in Rate</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label>Start Location *</Label>
        <Input value={form.start_location} onChange={e => setForm({ ...form, start_location: e.target.value })} />
      </div>
      <div>
        <Label>Instructions</Label>
        <Textarea value={form.instructions} onChange={e => setForm({ ...form, instructions: e.target.value })} rows={2} />
      </div>
      <div>
        <Label>Notes</Label>
        <Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} />
      </div>

      {form.status === 'Canceled' && (
        <div>
          <Label>Cancel Reason</Label>
          <Textarea value={form.canceled_reason} onChange={e => setForm({ ...form, canceled_reason: e.target.value })} rows={2} />
        </div>
      )}

      {/* Trucks */}
      <div>
        <Label>Trucks Assigned * {!form.company_id && <span className="text-xs text-slate-400 ml-1">(select company first)</span>}</Label>
        <div className="flex gap-2 flex-wrap mt-1">
          {availableTrucks.map(t => (
            <button
              key={t}
              onClick={() => toggleTruck(t)}
              disabled={!form.company_id}
              className={`px-3 py-1.5 rounded-lg border text-sm font-mono transition-colors ${
                form.trucks_assigned.includes(t)
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
              } disabled:opacity-40`}
            >
              {t}
            </button>
          ))}
          {form.company_id && availableTrucks.length === 0 && (
            <span className="text-xs text-slate-400">No trucks on this company</span>
          )}
        </div>
      </div>

      {/* Additional Assignments */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label>Additional Assignments</Label>
          <Button type="button" variant="outline" size="sm" onClick={addAssignment} className="text-xs">
            <Plus className="h-3 w-3 mr-1" />Add
          </Button>
        </div>
        {form.additional_assignments.map((a, i) => (
          <div key={i} className="flex gap-2 items-start mb-2 bg-slate-50 p-3 rounded-lg">
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
              <Input placeholder="Time" type="time" value={a.start_time} onChange={e => updateAssignment(i, 'start_time', e.target.value)} />
              <Input placeholder="Location" value={a.start_location} onChange={e => updateAssignment(i, 'start_location', e.target.value)} />
              <Input placeholder="Instructions" value={a.instructions} onChange={e => updateAssignment(i, 'instructions', e.target.value)} />
            </div>
            <Button variant="ghost" size="icon" onClick={() => removeAssignment(i)} className="h-8 w-8 text-red-500 shrink-0">
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
      </div>

      <div className="flex gap-3 pt-2">
        <Button variant="outline" onClick={onCancel} className="flex-1">Cancel</Button>
        <Button onClick={handleSubmit} disabled={saving} className="flex-1 bg-slate-900 hover:bg-slate-800">
          {saving ? 'Saving...' : dispatch ? 'Update Dispatch' : 'Create Dispatch'}
        </Button>
      </div>
    </div>
  );
}