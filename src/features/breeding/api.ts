import type { PostgrestError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

export type BreedingEventType = 'heat_cycle' | 'breeding' | 'pregnancy_confirmation' | 'birth';

export interface BreedingEvent {
  id: string;
  user_id: string;
  animal_id: string;
  event_type: BreedingEventType;
  date: string;
  partner_animal_id?: string | null;
  partner_name?: string | null;
  expected_due_date?: string | null;
  actual_birth_date?: string | null;
  offspring_count?: number | null;
  notes?: string | null;
  property_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

const BREEDING_TABLE = 'breeding_events' as const;
const BREEDING_EVENT_TYPES: BreedingEventType[] = ['heat_cycle', 'breeding', 'pregnancy_confirmation', 'birth'];

const isMissingTableError = (error?: PostgrestError | null) =>
  Boolean(error?.code === 'PGRST205' || error?.message?.includes(`'${BREEDING_TABLE}'`));

const toStringValue = (value: unknown): string | undefined => {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return value.toString();
  if (value instanceof Date) return value.toISOString();
  return undefined;
};

const toNumberValue = (value: unknown): number | undefined => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? undefined : parsed;
  }
  return undefined;
};

const deriveEventType = (metadata: Record<string, unknown>, action?: string): BreedingEventType => {
  const rawType = toStringValue(metadata.event_type) || toStringValue(metadata.type) || action || '';
  const normalized = rawType.toLowerCase();

  if (normalized.includes('heat')) return 'heat_cycle';
  if (normalized.includes('preg')) return 'pregnancy_confirmation';
  if (normalized.includes('birth')) return 'birth';
  if (normalized.includes('breed')) return 'breeding';

  const feature = toStringValue(metadata.feature) || toStringValue(metadata.module) || '';
  if (feature.toLowerCase().includes('breeding')) return 'breeding';

  return 'breeding';
};

const mapXpEventToBreeding = (row: any): BreedingEvent => {
  const metadata = (row.metadata || {}) as Record<string, unknown>;
  return {
    id: row.id,
    user_id: row.user_id,
    animal_id: toStringValue(metadata.animal_id) || toStringValue(metadata.animalId) || 'unknown',
    event_type: deriveEventType(metadata, row.action),
    date: toStringValue(metadata.date) || row.created_at,
    partner_animal_id:
      toStringValue(metadata.partner_animal_id) || toStringValue(metadata.partnerAnimalId) || null,
    partner_name: toStringValue(metadata.partner_name) || null,
    expected_due_date: toStringValue(metadata.expected_due_date) || null,
    actual_birth_date: toStringValue(metadata.actual_birth_date) || null,
    offspring_count: toNumberValue(metadata.offspring_count) ?? null,
    notes: toStringValue(metadata.notes) || null,
    property_id: toStringValue(metadata.property_id) || null,
    created_at: row.created_at,
    updated_at: row.created_at,
  };
};

const isBreedingXpEvent = (row: any) => {
  const metadata = (row.metadata || {}) as Record<string, unknown>;
  const rawType = toStringValue(metadata.event_type) || toStringValue(metadata.type) || '';
  const feature = toStringValue(metadata.feature) || toStringValue(metadata.module) || '';
  const action = row.action?.toLowerCase() || '';

  return (
    BREEDING_EVENT_TYPES.some((type) => rawType.toLowerCase().includes(type.replace('_', ''))) ||
    feature.toLowerCase().includes('breeding') ||
    action.includes('breed')
  );
};

const fetchBreedingEventsFromXp = async (userId: string): Promise<BreedingEvent[]> => {
  const { data, error } = await supabase
    .from('xp_events')
    .select('id,user_id,action,metadata,created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[Breeding] xp_events fallback failed:', error);
    return [];
  }

  return (data || []).filter(isBreedingXpEvent).map(mapXpEventToBreeding);
};

const raiseMutationError = (error: PostgrestError | null): never => {
  if (isMissingTableError(error)) {
    throw new Error(
      'Breeding events table is not available in this environment. Create the `breeding_events` table or update the configuration before creating or editing breeding records.'
    );
  }

  throw error ?? new Error('Unknown Supabase error');
};

export const getBreedingEvents = async (userId: string): Promise<BreedingEvent[]> => {
  const { data, error } = await supabase
    .from(BREEDING_TABLE)
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (error) {
    if (isMissingTableError(error)) {
      console.warn('[Breeding] `breeding_events` table missing – falling back to xp_events.');
      return fetchBreedingEventsFromXp(userId);
    }
    throw error;
  }

  return data || [];
};

export const createBreedingEvent = async (event: Partial<BreedingEvent>): Promise<BreedingEvent> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User must be authenticated to create a breeding event');
  }

  const { data, error } = await supabase
    .from(BREEDING_TABLE)
    .insert([{ ...event, user_id: user.id }])
    .select()
    .single();

  if (error) {
    raiseMutationError(error);
  }

  return (data || {}) as BreedingEvent;
};

export const updateBreedingEvent = async (id: string, event: Partial<BreedingEvent>): Promise<BreedingEvent> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User must be authenticated to update a breeding event');
  }

  const { data, error } = await supabase
    .from(BREEDING_TABLE)
    .update(event)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    raiseMutationError(error);
  }

  return (data || {}) as BreedingEvent;
};

export const deleteBreedingEvent = async (id: string): Promise<void> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User must be authenticated to delete a breeding event');
  }

  const { error } = await supabase
    .from(BREEDING_TABLE)
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    raiseMutationError(error);
  }
};

export interface BreedingDashboardData {
  breedingFemales: number;
  pregnant: number;
  lactating: number;
  open: number;
}

export const getBreedingDashboardData = async (userId: string): Promise<BreedingDashboardData> => {
  try {
    const events = await getBreedingEvents(userId);

    if (!events.length) {
      return { breedingFemales: 0, pregnant: 0, lactating: 0, open: 0 };
    }

    const uniqueAnimals = new Set(events.map((event) => event.animal_id));
    const breedingFemales = uniqueAnimals.size;

    const pregnantAnimals = new Set<string>();
    events
      .filter((event) => event.event_type === 'pregnancy_confirmation')
      .forEach((pregEvent) => {
        const hasBirth = events.some(
          (event) =>
            event.event_type === 'birth' &&
            event.animal_id === pregEvent.animal_id &&
            new Date(event.date) > new Date(pregEvent.date)
        );
        if (!hasBirth) {
          pregnantAnimals.add(pregEvent.animal_id);
        }
      });

    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
    const lactatingAnimals = new Set(
      events
        .filter((event) => event.event_type === 'birth' && new Date(event.date) >= sixtyDaysAgo)
        .map((event) => event.animal_id)
    );

    const pregnant = pregnantAnimals.size;
    const lactating = lactatingAnimals.size;
    const open = Math.max(0, breedingFemales - pregnant - lactating);

    return { breedingFemales, pregnant, lactating, open };
  } catch (error) {
    console.error('Error fetching breeding dashboard data:', error);
    return { breedingFemales: 0, pregnant: 0, lactating: 0, open: 0 };
  }
};
