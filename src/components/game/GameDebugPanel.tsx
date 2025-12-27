import { useEffect, useState } from 'react';
import { getUserStats } from '@/game/gameEngine';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bug } from 'lucide-react';

interface XPEvent {
  id: string;
  action: string;
  xp: number;
  created_at: string;
  metadata?: Record<string, unknown>;
}

export const GameDebugPanel = () => {
  const [stats, setStats] = useState({ totalXp: 0, level: 1 });
  const [events, setEvents] = useState<XPEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDebugData();
  }, []);

  const loadDebugData = async () => {
    try {
      setLoading(true);
      
      // Get user stats
      const userStats = await getUserStats();
      setStats(userStats);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch recent XP events
      const { data: eventsData, error } = await supabase
        .from('xp_events')
        .select('id, action, xp, created_at, metadata')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        console.error('[GameDebugPanel] Error fetching events:', error);
      } else {
        setEvents(eventsData || []);
      }
    } catch (error) {
      console.error('[GameDebugPanel] Error loading debug data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <Card className="border-dashed border-2 border-muted">
        <CardContent className="pt-6">
          <div className="text-sm text-muted-foreground">Loading debug data...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-dashed border-2 border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-mono flex items-center gap-2">
          <Bug className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          Gamification Debug (dev only)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats Summary */}
        <div className="flex gap-4 text-sm">
          <div>
            <span className="text-muted-foreground font-mono">Level:</span>{' '}
            <Badge variant="outline" className="font-mono">{stats.level}</Badge>
          </div>
          <div>
            <span className="text-muted-foreground font-mono">Total XP:</span>{' '}
            <Badge variant="outline" className="font-mono">{stats.totalXp}</Badge>
          </div>
        </div>

        {/* Recent Events */}
        <div>
          <div className="text-xs font-mono text-muted-foreground mb-2">
            Recent XP Events:
          </div>
          {events.length === 0 ? (
            <div className="text-xs text-muted-foreground italic">No events yet</div>
          ) : (
            <div className="space-y-2">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="text-xs font-mono bg-background/50 rounded p-2 border border-border/50"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-foreground font-medium">{event.action}</span>
                    <Badge variant="secondary" className="font-mono text-xs">
                      +{event.xp} XP
                    </Badge>
                  </div>
                  <div className="text-muted-foreground mt-1">
                    {formatDate(event.created_at)}
                  </div>
                  {event.metadata && Object.keys(event.metadata).length > 0 && (
                    <div className="text-muted-foreground mt-1 text-[10px]">
                      {JSON.stringify(event.metadata)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
