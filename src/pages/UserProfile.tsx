import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { StatCard } from "@/components/ui/StatCard";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertCircle, Loader2, User as UserIcon, CreditCard } from "lucide-react";
import { User } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";

interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  display_name: string | null;
  location: string | null;
  website_url: string | null;
  bio: string | null;
  subscription_status?: string | null;
  plan_type?: string | null;
  trial_start_date?: string | null;
  trial_end_date?: string | null;
  created_at?: string;
  updated_at?: string;
}

const profileSchema = z.object({
  display_name: z.string().trim().max(50, "Display name must be less than 50 characters").optional().or(z.literal("")),
  full_name: z.string().trim().min(1, "Full name is required").max(100, "Full name must be less than 100 characters"),
  location: z.string().trim().max(100, "Location must be less than 100 characters").optional().or(z.literal("")),
  website_url: z.string().trim().max(255, "Website URL must be less than 255 characters")
    .refine((val) => !val || val.match(/^https?:\/\/.+/i), "Must be a valid URL starting with http:// or https://")
    .optional().or(z.literal("")),
  bio: z.string().trim().max(500, "Bio must be less than 500 characters").optional().or(z.literal("")),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const UserProfile = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      display_name: "",
      full_name: "",
      location: "",
      website_url: "",
      bio: "",
    }
  });

  useEffect(() => {
    fetchUserAndProfile();
  }, []);

  const fetchUserAndProfile = async () => {
    try {
      setIsLoading(true);
      
      // Fetch current user
      const { data: { user: authUser }, error: userError } = await supabase.auth.getUser();
      
      if (userError) throw userError;
      if (!authUser) throw new Error("No user found");
      
      setUser(authUser);
      
      // Fetch profile
      const { data: profileData, error: profileError } = await (supabase as any)
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();
      
      if (profileError) throw profileError;
      
      setProfile(profileData);
      
      // Update form with profile data if exists
      if (profileData) {
        const fullName = [profileData.first_name, profileData.last_name].filter(Boolean).join(" ");
        reset({
          display_name: profileData.display_name || "",
          full_name: fullName || "",
          location: profileData.location || "",
          website_url: profileData.website_url || "",
          bio: profileData.bio || "",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = () => {
    if (profile?.display_name) {
      return profile.display_name[0].toUpperCase();
    }
    if (profile?.first_name) {
      return profile.first_name[0].toUpperCase();
    }
    return user?.email?.[0]?.toUpperCase() || 'U';
  };
  
  const getDisplayName = () => {
    if (profile?.display_name) return profile.display_name;
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name} ${profile.last_name}`;
    }
    if (profile?.first_name) return profile.first_name;
    return user?.email?.split('@')[0] || 'User';
  };

  const onSubmit = async (data: ProfileFormData) => {
    if (!user) return;
    
    try {
      setIsSaving(true);
      
      // Fetch existing profile first to preserve subscription and role fields
      const { data: existingProfile, error: fetchError } = await (supabase as any)
        .from('profiles')
        .select('subscription_status, plan_type, trial_start_date, trial_end_date')
        .eq('id', user.id)
        .maybeSingle();
      
      if (fetchError) throw fetchError;
      
      // Parse full name into first and last name
      const nameParts = data.full_name.trim().split(/\s+/);
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";
      
      // Build the profile data, only updating editable fields
      const profileData = {
        id: user.id,
        first_name: firstName,
        last_name: lastName,
        display_name: data.display_name?.trim() || null,
        location: data.location?.trim() || null,
        website_url: data.website_url?.trim() || null,
        bio: data.bio?.trim() || null,
        updated_at: new Date().toISOString(),
        // Preserve existing subscription fields if they exist
        ...(existingProfile && {
          subscription_status: existingProfile.subscription_status,
          plan_type: existingProfile.plan_type,
          trial_start_date: existingProfile.trial_start_date,
          trial_end_date: existingProfile.trial_end_date,
        }),
      };
      
      // Upsert profile (insert or update)
      const { error } = await (supabase as any)
        .from('profiles')
        .upsert(profileData, {
          onConflict: 'id'
        });
      
      if (error) throw error;
      
      toast({
        title: profile ? "Profile updated" : "Profile created",
        description: "Your profile has been saved successfully.",
      });
      
      // Refresh profile data
      await fetchUserAndProfile();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Signed out",
        description: "You've been successfully signed out.",
      });
      navigate('/login');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAccount = () => {
    // TODO: This should call a protected Supabase Edge Function to:
    // 1. Delete all user data from related tables
    // 2. Delete the user's profile
    // 3. Delete the auth user account
    // For now, just show a placeholder message
    toast({
      title: "Account deletion",
      description: "Account deletion feature coming soon.",
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <SectionHeader 
        title="Your Profile" 
        subtitle="Manage your account, profile, and subscription"
        icon={UserIcon}
        className="mb-6"
      />

      {/* Mobile-first responsive grid */}
      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        {/* Main content - takes 2 columns on desktop */}
        <div className="space-y-6">
          {/* Profile not found alert */}
          {!profile && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Complete your profile</strong> - Add your name to personalize your Homestead Architect experience.
              </AlertDescription>
            </Alert>
          )}

          {/* Profile Details Card */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Details</CardTitle>
              <CardDescription>
                Manage your public profile information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Avatar and Display Name Section */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pb-4 border-b">
                  <Avatar className="h-16 w-16 sm:h-20 sm:w-20">
                    <AvatarFallback className="text-xl sm:text-2xl bg-primary/10 text-primary">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg truncate">
                      {getDisplayName()}
                    </h3>
                    <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input
                      id="displayName"
                      {...register("display_name")}
                      placeholder="e.g., FarmersJohn or your preferred name"
                    />
                    {errors.display_name && (
                      <p className="text-sm text-destructive">{errors.display_name.message}</p>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      {...register("full_name")}
                      placeholder="e.g., John Smith"
                    />
                    {errors.full_name && (
                      <p className="text-sm text-destructive">{errors.full_name.message}</p>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      {...register("location")}
                      placeholder="e.g., Vermont, USA"
                    />
                    {errors.location && (
                      <p className="text-sm text-destructive">{errors.location.message}</p>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="websiteUrl">Website URL</Label>
                    <Input
                      id="websiteUrl"
                      {...register("website_url")}
                      type="url"
                      placeholder="https://your-website.com"
                    />
                    {errors.website_url && (
                      <p className="text-sm text-destructive">{errors.website_url.message}</p>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      {...register("bio")}
                      placeholder="Tell us about yourself and your homestead..."
                      rows={4}
                      className="resize-none"
                    />
                    {errors.bio && (
                      <p className="text-sm text-destructive">{errors.bio.message}</p>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                  </div>
                </div>

                <Button type="submit" disabled={isSaving} className="w-full sm:w-auto">
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Profile'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Account Card */}
          <Card>
            <CardHeader>
              <CardTitle>Account</CardTitle>
              <CardDescription>
                Your authentication details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="accountEmailDisplay">Email</Label>
                <Input
                  id="accountEmailDisplay"
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="bg-muted"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="userId">User ID</Label>
                <Input
                  id="userId"
                  type="text"
                  value={user?.id || ''}
                  disabled
                  className="bg-muted font-mono text-xs"
                />
              </div>

              {user?.created_at && (
                <div className="grid gap-2">
                  <Label htmlFor="accountCreated">Account Created</Label>
                  <Input
                    id="accountCreated"
                    type="text"
                    value={new Date(user.created_at).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                    disabled
                    className="bg-muted"
                  />
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                Email is managed by authentication and cannot be edited here.
              </p>
            </CardContent>
          </Card>

          {/* Subscription & Access Card */}
          <Card>
            <CardHeader>
              <CardTitle>Subscription & Access</CardTitle>
              <CardDescription>
                Manage your account and subscription details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Warning banner for expired or canceled subscription */}
              {(profile?.subscription_status === 'expired' || profile?.subscription_status === 'canceled') && (
                <Alert className="bg-yellow-50 border-yellow-200">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-800">
                    Your subscription is {profile.subscription_status}. Some features may be limited.
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-3">
                <div className="grid gap-2">
                  <Label>Subscription Status</Label>
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${
                      profile?.subscription_status === 'active' ? 'bg-green-500' :
                      profile?.subscription_status === 'trial' ? 'bg-blue-500' :
                      profile?.subscription_status === 'expired' ? 'bg-red-500' :
                      profile?.subscription_status === 'canceled' ? 'bg-orange-500' :
                      'bg-gray-400'
                    }`} />
                    <span className="text-sm font-medium capitalize">
                      {profile?.subscription_status || 'None'}
                    </span>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label>Plan Type</Label>
                  <p className="text-sm font-medium">
                    {profile?.plan_type || 'Not set'}
                  </p>
                </div>

                {/* Trial Window - only show if dates exist */}
                {(profile?.trial_start_date || profile?.trial_end_date) && (
                  <div className="grid gap-2 pt-2 border-t">
                    <Label>Trial Period</Label>
                    <div className="text-sm space-y-1">
                      {profile?.trial_start_date && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Started:</span>
                          <span className="font-medium">
                            {new Date(profile.trial_start_date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                      )}
                      {profile?.trial_end_date && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Ends:</span>
                          <span className="font-medium">
                            {new Date(profile.trial_end_date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
                <Button 
                  className="flex-1" 
                  variant="default"
                  onClick={() => navigate('/upgrade')}
                >
                  Upgrade Plan
                </Button>
                <Button 
                  className="flex-1" 
                  variant="outline"
                  onClick={() => {
                    toast({
                      title: "Refresh Status",
                      description: "This feature is coming soon.",
                    });
                  }}
                >
                  Refresh Status
                </Button>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Sidebar - takes 1 column on desktop */}
        <div className="space-y-6">
          {/* Subscription Stats */}
          <StatCard
            title="Current Plan"
            value={profile?.plan_type || 'Free'}
            icon={CreditCard}
            tone="blue"
            description="Access to basic homestead features"
          />

          {/* Quick Stats Card */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Member Since</span>
                <span className="text-sm font-medium">
                  {profile?.created_at
                    ? new Date(profile.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        year: 'numeric',
                      })
                    : 'Recently'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Last Login</span>
                <span className="text-sm font-medium">Today</span>
              </div>
            </CardContent>
          </Card>
          
          {/* Upgrade Card */}
          <Card>
            <CardHeader>
              <CardTitle>Upgrade</CardTitle>
              <CardDescription>
                Unlock more features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Upgrade to access advanced planning tools and unlimited storage
              </p>
              <Button className="w-full" variant="default" disabled>
                Upgrade Plan
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Security Section - Full width at bottom */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>
            Manage your account security and authentication
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Sign Out Button */}
          <div>
            <Button
              variant="outline"
              onClick={handleSignOut}
              className="w-full sm:w-auto"
            >
              Sign Out
            </Button>
          </div>

          {/* Divider */}
          <div className="border-t" />

          {/* Danger Zone */}
          <div className="border border-destructive/30 rounded-lg p-4 bg-destructive/5">
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-semibold text-destructive">Danger Zone</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Irreversible and destructive actions
                </p>
              </div>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full sm:w-auto">
                    Delete Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your account
                      and remove all your data from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleDeleteAccount} 
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete Account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserProfile;
