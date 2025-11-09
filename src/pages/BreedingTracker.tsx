import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Heart, Plus, Calendar as CalendarIcon, Activity } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TabHeader } from '@/components/ui/TabHeader';
import { StatCard, EmptyState } from '@/components/ui';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar } from '@/components/ui/calendar';
import { useToast } from '@/hooks/use-toast';
import { BreedingForm } from '@/features/breeding/BreedingForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  getBreedingEvents,
  createBreedingEvent,
  updateBreedingEvent,
  deleteBreedingEvent,
  BreedingEvent,
} from '@/features/breeding/api';

const BreedingTracker = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showForm, setShowForm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<BreedingEvent | null>(null);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'heat_cycles', label: 'Heat Cycles' },
    { id: 'breeding_records', label: 'Breeding Records' },
    { id: 'gestation_timeline', label: 'Gestation Timeline' },
    { id: 'breeding_calendar', label: 'Breeding Calendar' },
  ];

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['breeding-events', user?.id],
    queryFn: () => getBreedingEvents(user!.id),
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) =>
      createBreedingEvent({
        ...data,
        user_id: user!.id,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['breeding-events'] });
      toast({
        title: 'Success',
        description: 'Breeding event created successfully',
      });
      setShowForm(false);
      setSelectedEvent(null);
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
      updateBreedingEvent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['breeding-events'] });
      toast({
        title: 'Success',
        description: 'Breeding event updated successfully',
      });
      setShowForm(false);
      setSelectedEvent(null);
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
    if (selectedEvent) {
      updateMutation.mutate({ id: selectedEvent.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleNewEvent = () => {
    setSelectedEvent(null);
    setShowForm(true);
  };

  // Derive statistics
  const pregnantCount = events.filter(
    e => e.event_type === 'pregnancy_confirmation' && !events.some(b => b.event_type === 'birth' && b.animal_id === e.animal_id && new Date(b.date) > new Date(e.date))
  ).length;

  const upcomingEvents = events.filter(
    e => e.expected_due_date && new Date(e.expected_due_date) > new Date()
  ).sort((a, b) => new Date(a.expected_due_date!).getTime() - new Date(b.expected_due_date!).getTime());

  const heatCycles = events.filter(e => e.event_type === 'heat_cycle');
  const breedingRecords = events.filter(e => e.event_type === 'breeding');
  const gestationEvents = events.filter(
    e => e.expected_due_date && (e.event_type === 'pregnancy_confirmation' || e.event_type === 'breeding')
  );

  const calendarDates = events
    .filter(e => e.expected_due_date || e.actual_birth_date)
    .map(e => ({
      date: new Date(e.expected_due_date || e.actual_birth_date!),
      event: e,
    }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-background min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-950/20 dark:to-rose-950/20 p-6 rounded-lg">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Husbandry Hub: Breeding Tracker
            </h1>
            <p className="text-muted-foreground">
              Comprehensive breeding management for your livestock.
            </p>
          </div>
          <Button onClick={handleNewEvent}>
            <Plus className="h-4 w-4 mr-2" />
            Add Event
          </Button>
        </div>

        {/* Tabs */}
        <TabHeader tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* Tab Content */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard
              title="Breeding Females"
              value={0}
              icon={Heart}
              tone="neutral"
            />
            <StatCard
              title="Pregnant"
              value={pregnantCount}
              icon={Activity}
              tone="amber"
            />
            <StatCard
              title="Lactating"
              value={0}
              icon={Heart}
              tone="green"
            />
            <StatCard
              title="Open"
              value={0}
              icon={Heart}
              tone="blue"
            />
          </div>

          {/* Active Pregnancies & Upcoming Events */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Active Pregnancies</CardTitle>
              </CardHeader>
              <CardContent>
                {pregnantCount > 0 ? (
                  <div className="space-y-2">
                    {events
                      .filter(e => e.event_type === 'pregnancy_confirmation' && !events.some(b => b.event_type === 'birth' && b.animal_id === e.animal_id))
                      .slice(0, 5)
                      .map(event => (
                        <div key={event.id} className="p-3 bg-muted/50 rounded-lg">
                          <div className="font-medium text-sm">Animal ID: {event.animal_id}</div>
                          <div className="text-xs text-muted-foreground">
                            Confirmed: {format(new Date(event.date), 'PP')}
                          </div>
                          {event.expected_due_date && (
                            <div className="text-xs text-muted-foreground">
                              Due: {format(new Date(event.expected_due_date), 'PP')}
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                ) : (
                  <EmptyState
                    title="No active pregnancies"
                    description="Pregnancy confirmations will appear here"
                    icon={Heart}
                  />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upcoming Events</CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingEvents.length > 0 ? (
                  <div className="space-y-2">
                    {upcomingEvents.slice(0, 5).map(event => (
                      <div key={event.id} className="p-3 bg-muted/50 rounded-lg">
                        <div className="font-medium text-sm">Animal ID: {event.animal_id}</div>
                        <div className="text-xs text-muted-foreground">
                          Due: {format(new Date(event.expected_due_date!), 'PP')}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title="No upcoming events"
                    description="Events with expected due dates will appear here"
                    icon={CalendarIcon}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'heat_cycles' && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Heat Cycles</CardTitle>
            <Button onClick={handleNewEvent}>
              <Plus className="h-4 w-4 mr-2" />
              Add Heat Cycle
            </Button>
          </CardHeader>
          <CardContent>
            {heatCycles.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Animal</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {heatCycles.map(event => (
                    <TableRow key={event.id}>
                      <TableCell className="font-medium">{event.animal_id}</TableCell>
                      <TableCell>{format(new Date(event.date), 'PP')}</TableCell>
                      <TableCell className="text-muted-foreground">{event.notes || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <EmptyState
                title="No heat cycles recorded"
                description="Add your first heat cycle to start tracking"
                icon={Heart}
                action={
                  <Button onClick={handleNewEvent}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Heat Cycle
                  </Button>
                }
              />
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'breeding_records' && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Breeding Records</CardTitle>
            <Button onClick={handleNewEvent}>
              <Plus className="h-4 w-4 mr-2" />
              Record Breeding
            </Button>
          </CardHeader>
          <CardContent>
            {breedingRecords.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Animal</TableHead>
                    <TableHead>Partner</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {breedingRecords.map(event => (
                    <TableRow key={event.id}>
                      <TableCell className="font-medium">{event.animal_id}</TableCell>
                      <TableCell>{event.partner_name || event.partner_animal_id || '-'}</TableCell>
                      <TableCell>{format(new Date(event.date), 'PP')}</TableCell>
                      <TableCell className="text-muted-foreground">{event.notes || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <EmptyState
                title="No breeding records"
                description="Record your first breeding event"
                icon={Heart}
                action={
                  <Button onClick={handleNewEvent}>
                    <Plus className="h-4 w-4 mr-2" />
                    Record Breeding
                  </Button>
                }
              />
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'gestation_timeline' && (
        <Card>
          <CardHeader>
            <CardTitle>Gestation Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            {gestationEvents.length > 0 ? (
              <div className="space-y-4">
                {gestationEvents.map(event => (
                  <div key={event.id} className="p-4 bg-muted/50 rounded-lg border-l-4 border-l-primary">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold">Animal ID: {event.animal_id}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          Expected Due: {event.expected_due_date ? format(new Date(event.expected_due_date), 'PPP') : 'Not set'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Status: {event.event_type === 'pregnancy_confirmation' ? 'Confirmed' : 'Breeding recorded'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No gestation events"
                description="Events with expected due dates will appear here"
                icon={CalendarIcon}
              />
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'breeding_calendar' && (
        <Card>
          <CardHeader>
            <CardTitle>Breeding Calendar</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Calendar
              mode="single"
              className="rounded-md border pointer-events-auto"
              modifiers={{
                eventDate: calendarDates.map(d => d.date),
              }}
              modifiersClassNames={{
                eventDate: 'bg-primary text-primary-foreground',
              }}
            />
          </CardContent>
        </Card>
      )}

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedEvent ? 'Edit Breeding Event' : 'New Breeding Event'}
            </DialogTitle>
          </DialogHeader>
          <BreedingForm
            event={selectedEvent}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setSelectedEvent(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BreedingTracker;
