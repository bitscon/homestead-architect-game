import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BookOpen, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { JournalEntryForm } from '@/features/journal/JournalEntryForm';
import { JournalEntryList } from '@/features/journal/JournalEntryList';
import {
  getJournalEntries,
  createJournalEntry,
  updateJournalEntry,
  deleteJournalEntry,
  type JournalEntry,
} from '@/features/journal/api';

const HomesteadJournal = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [showForm, setShowForm] = useState(false);

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['journal-entries', user?.id],
    queryFn: () => getJournalEntries(user!.id),
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) =>
      createJournalEntry({
        ...data,
        user_id: user!.id,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
      toast({
        title: 'Success',
        description: 'Journal entry created successfully',
      });
      setShowForm(false);
      setSelectedEntry(null);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateJournalEntry(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
      toast({
        title: 'Success',
        description: 'Journal entry updated successfully',
      });
      setSelectedEntry(null);
      setShowForm(false);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteJournalEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
      toast({
        title: 'Success',
        description: 'Journal entry deleted successfully',
      });
      setSelectedEntry(null);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (data: any) => {
    if (selectedEntry) {
      updateMutation.mutate({ id: selectedEntry.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (entry: JournalEntry) => {
    setSelectedEntry(entry);
    setShowForm(true);
  };

  const handleNewEntry = () => {
    setSelectedEntry(null);
    setShowForm(true);
  };

  const handleCancel = () => {
    setSelectedEntry(null);
    setShowForm(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">
            Homestead Journal
          </h1>
        </div>
        <Button onClick={handleNewEntry}>
          <Plus className="h-4 w-4 mr-2" />
          New Entry
        </Button>
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Journal Entries
          </h2>
          <JournalEntryList
            entries={entries}
            onEdit={handleEdit}
            onDelete={(id) => deleteMutation.mutate(id)}
            selectedEntry={selectedEntry}
          />
        </div>

        <div className="lg:sticky lg:top-24 h-fit">
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              {selectedEntry ? 'Edit Entry' : 'New Entry'}
            </h2>
            {showForm ? (
              <JournalEntryForm
                entry={selectedEntry}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
              />
            ) : (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  Select an entry to edit or create a new one
                </p>
                <Button onClick={handleNewEntry}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Entry
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HomesteadJournal;
