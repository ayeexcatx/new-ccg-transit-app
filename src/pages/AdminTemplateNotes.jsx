import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { StickyNote, Plus, Pencil, Trash2 } from 'lucide-react';

export default function AdminTemplateNotes() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ note_text: '', active_flag: true, priority: 0 });

  const { data: notes = [], isLoading } = useQuery({
    queryKey: ['template-notes-admin'],
    queryFn: () => base44.entities.DispatchTemplateNotes.list(),
  });

  const saveMutation = useMutation({
    mutationFn: (data) => editing
      ? base44.entities.DispatchTemplateNotes.update(editing.id, data)
      : base44.entities.DispatchTemplateNotes.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['template-notes-admin'] });
      setOpen(false);
      setEditing(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.DispatchTemplateNotes.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['template-notes-admin'] }),
  });

  const openNew = () => {
    setEditing(null);
    setForm({ note_text: '', active_flag: true, priority: 0 });
    setOpen(true);
  };

  const openEdit = (note) => {
    setEditing(note);
    setForm({
      note_text: note.note_text || '',
      active_flag: note.active_flag !== false,
      priority: note.priority || 0,
    });
    setOpen(true);
  };

  const sortedNotes = [...notes].sort((a, b) => (a.priority || 0) - (b.priority || 0));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Template Notes</h2>
          <p className="text-sm text-slate-500">Appended to dispatch details</p>
        </div>
        <Button onClick={openNew} className="bg-slate-900 hover:bg-slate-800">
          <Plus className="h-4 w-4 mr-2" />Add Note
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin h-6 w-6 border-2 border-slate-300 border-t-slate-700 rounded-full" />
        </div>
      ) : sortedNotes.length === 0 ? (
        <div className="text-center py-16 text-slate-500 text-sm">No template notes yet</div>
      ) : (
        <div className="grid gap-3">
          {sortedNotes.map(n => (
            <Card key={n.id} className={`hover:shadow-sm transition-shadow ${n.active_flag === false ? 'opacity-50' : ''}`}>
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
                      <StickyNote className="h-4 w-4 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-700">{n.note_text}</p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant={n.active_flag !== false ? 'default' : 'secondary'} className="text-xs">
                          {n.active_flag !== false ? 'Active' : 'Inactive'}
                        </Badge>
                        <Badge variant="outline" className="text-xs">Priority: {n.priority || 0}</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(n)} className="h-8 w-8">
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(n.id)} className="h-8 w-8 text-red-500 hover:text-red-600">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Note' : 'New Note'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Note Text *</Label>
              <Textarea value={form.note_text} onChange={e => setForm({ ...form, note_text: e.target.value })} rows={3} />
            </div>
            <div>
              <Label>Priority (lower = shown first)</Label>
              <Input type="number" value={form.priority} onChange={e => setForm({ ...form, priority: parseInt(e.target.value) || 0 })} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Active</Label>
              <Switch checked={form.active_flag} onCheckedChange={v => setForm({ ...form, active_flag: v })} />
            </div>
            <Button
              onClick={() => { if (form.note_text.trim()) saveMutation.mutate(form); }}
              disabled={saveMutation.isPending}
              className="w-full bg-slate-900 hover:bg-slate-800"
            >
              {saveMutation.isPending ? 'Saving...' : 'Save Note'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}