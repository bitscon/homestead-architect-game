import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Trophy, Medal, Award, Settings, Shield, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import {
  getLeaderboard,
  getUserPrivacySettings,
  updateUserPrivacySettings,
  getUserRank,
  LeaderboardEntry,
  UserPrivacySettings,
} from '@/game/leaderboardApi';
import { useAuth } from '@/contexts/AuthContext';

export const Leaderboard = () => {
  const { user, profile } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [privacySettings, setPrivacySettings] = useState<UserPrivacySettings | null>(null);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form state for privacy settings
  const [showOnLeaderboard, setShowOnLeaderboard] = useState(false);
  const [displayName, setDisplayName] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [leaderboardData, settings, rank] = await Promise.all([
        getLeaderboard(),
        getUserPrivacySettings(),
        getUserRank(),
      ]);
      
      setLeaderboard(leaderboardData);
      setPrivacySettings(settings);
      setUserRank(rank);

      // Initialize form state
      if (settings) {
        setShowOnLeaderboard(settings.show_on_leaderboard);
        setDisplayName(settings.display_name);
      } else {
        setDisplayName(profile?.first_name || user?.email?.split('@')[0] || 'Homesteader');
      }
    } catch (error) {
      console.error('[Leaderboard] Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setIsSaving(true);
      const success = await updateUserPrivacySettings(showOnLeaderboard, displayName);
      
      if (success) {
        toast.success('Privacy settings updated');
        setIsSettingsOpen(false);
        loadData(); // Refresh leaderboard
      } else {
        toast.error('Failed to update settings');
      }
    } catch (error) {
      console.error('[Leaderboard] Error saving settings:', error);
      toast.error('Failed to update settings');
    } finally {
      setIsSaving(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2: return <Medal className="h-5 w-5 text-gray-400" />;
      case 3: return <Award className="h-5 w-5 text-orange-500" />;
      default: return <span className="text-sm font-medium text-muted-foreground w-5 text-center">{rank}</span>;
    }
  };

  const getRankBgClass = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      case 2: return 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700';
      case 3: return 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800';
      default: return 'bg-card border-border';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              Community Leaderboard
            </CardTitle>
            <CardDescription>
              Top homesteaders by XP earned
            </CardDescription>
          </div>
          <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Privacy
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Leaderboard Privacy Settings
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="show-leaderboard" className="flex items-center gap-2">
                      {showOnLeaderboard ? (
                        <Eye className="h-4 w-4 text-green-600" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      )}
                      Show on Leaderboard
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Allow others to see your rank and XP on the community leaderboard
                    </p>
                  </div>
                  <Switch
                    id="show-leaderboard"
                    checked={showOnLeaderboard}
                    onCheckedChange={setShowOnLeaderboard}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="display-name">Display Name</Label>
                  <Input
                    id="display-name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter your display name"
                    disabled={!showOnLeaderboard}
                  />
                  <p className="text-xs text-muted-foreground">
                    This is the name others will see on the leaderboard
                  </p>
                </div>

                <Button 
                  onClick={handleSaveSettings} 
                  disabled={isSaving}
                  className="w-full"
                >
                  {isSaving ? 'Saving...' : 'Save Settings'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {/* User's current standing */}
        {userRank && (
          <div className="mb-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Your Rank</span>
              <Badge variant="outline" className="font-mono">
                #{userRank}
              </Badge>
            </div>
            {!privacySettings?.show_on_leaderboard && (
              <p className="text-xs text-muted-foreground mt-1">
                Enable visibility in settings to appear on the leaderboard
              </p>
            )}
          </div>
        )}

        {/* Leaderboard list */}
        {leaderboard.length === 0 ? (
          <div className="text-center py-8">
            <Trophy className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              No one has joined the leaderboard yet.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Be the first to opt in and showcase your progress!
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {leaderboard.map((entry) => (
              <div
                key={entry.user_id}
                className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${getRankBgClass(entry.rank)}`}
              >
                <div className="flex items-center gap-3">
                  {getRankIcon(entry.rank)}
                  <div>
                    <p className="font-medium text-sm">{entry.display_name}</p>
                    <p className="text-xs text-muted-foreground">Level {entry.level}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-sm">{entry.total_xp.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">XP</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
