import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertCircle, Loader2, User as UserIcon, CreditCard, Camera } from "lucide-react";
import { User } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";
import { XPBar } from "@/components/game/XPBar";

interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  display_name: string | null;
  location: string | null;
  website_url: string | null;
  bio: string | null;
  avatar_url?: string | null;
  role?: string | null;
  subscription_status?: string | null;
  plan_type?: string | null;
  subscription_expires_at?: string | null;
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
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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
      
      // Fetch existing profile first to preserve non-editable fields
      const { data: existingProfile, error: fetchError } = await (supabase as any)
        .from('profiles')
        .select('role, subscription_status, plan_type, subscription_id, trial_start_date, trial_end_date')
        .eq('id', user.id)
        .maybeSingle();
      
      if (fetchError) throw fetchError;
      
      // Parse full name into first and last name
      const nameParts = data.full_name.trim().split(/\s+/);
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";
      
      // Build the profile data - only update editable fields
      const profileData = {
        id: user.id,
        // Editable fields from form
        first_name: firstName,
        last_name: lastName,
        display_name: data.display_name?.trim() || null,
        location: data.location?.trim() || null,
        website_url: data.website_url?.trim() || null,
        bio: data.bio?.trim() || null,
        // avatar_url would go here when we add avatar upload
        updated_at: new Date().toISOString(),
        // Preserve existing non-editable fields
        ...(existingProfile && {
          role: existingProfile.role,
          subscription_status: existingProfile.subscription_status,
          plan_type: existingProfile.plan_type,
          subscription_id: existingProfile.subscription_id,
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
        title: "Profile saved",
        description: "Your profile has been updated successfully.",
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

  const handleRefreshSubscription = async () => {
    // TODO: Call Supabase Edge Function to refresh subscription status
    toast({
      title: "Refreshing...",
      description: "Subscription status will be refreshed.",
    });
  };

  const getSubscriptionStatusDisplay = () => {
    const status = profile?.subscription_status?.toLowerCase();
    switch (status) {
      case 'active':
        return { text: 'Active', color: 'text-green-600 dark:text-green-400' };
      case 'expired':
        return { text: 'Expired', color: 'text-yellow-600 dark:text-yellow-400' };
      case 'canceled':
        return { text: 'Canceled', color: 'text-red-600 dark:text-red-400' };
      case 'trialing':
        return { text: 'Trial', color: 'text-blue-600 dark:text-blue-400' };
      default:
        return { text: 'Not set', color: 'text-muted-foreground' };
    }
  };

  const getPlanTypeDisplay = () => {
    const planType = profile?.plan_type?.toLowerCase();
    switch (planType) {
      case 'monthly':
        return 'Monthly';
      case 'yearly':
        return 'Yearly';
      case 'lifetime':
        return 'Lifetime';
      default:
        return 'Not set';
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 2MB.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploadingAvatar(true);

      // Delete old avatar if exists
      if (profile?.avatar_url) {
        const oldPath = `user-avatars/${user.id}`;
        await supabase.storage.from('avatars').remove([oldPath]);
      }

      // Upload new avatar
      const fileExt = file.name.split('.').pop();
      const filePath = `user-avatars/${user.id}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { 
          upsert: true,
          contentType: file.type 
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Fetch existing profile to preserve non-editable fields
      const { data: existingProfile, error: fetchError } = await (supabase as any)
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (fetchError) throw fetchError;

      // Update profile with new avatar URL
      const { error: updateError } = await (supabase as any)
        .from('profiles')
        .upsert({
          id: user.id,
          avatar_url: publicUrl,
          updated_at: new Date().toISOString(),
          // Preserve all existing fields
          ...(existingProfile && {
            first_name: existingProfile.first_name,
            last_name: existingProfile.last_name,
            display_name: existingProfile.display_name,
            location: existingProfile.location,
            website_url: existingProfile.website_url,
            bio: existingProfile.bio,
            role: existingProfile.role,
            subscription_status: existingProfile.subscription_status,
            plan_type: existingProfile.plan_type,
            subscription_id: existingProfile.subscription_id,
            trial_start_date: existingProfile.trial_start_date,
            trial_end_date: existingProfile.trial_end_date,
          }),
        }, {
          onConflict: 'id'
        });

      if (updateError) throw updateError;

      toast({
        title: "Avatar updated",
        description: "Your profile picture has been updated successfully.",
      });

      // Refresh profile data
      await fetchUserAndProfile();
    } catch (error) {
      console.error('Avatar upload error:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload avatar. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
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

      {/* XP Bar */}
      <div className="mb-6 max-w-2xl mx-auto lg:mx-0">
        <XPBar />
      </div>

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
                  <div className="relative">
                    <Avatar className="h-16 w-16 sm:h-20 sm:w-20">
                      {profile?.avatar_url && (
                        <AvatarImage src={profile.avatar_url} alt={getDisplayName()} />
                      )}
                      <AvatarFallback className="text-xl sm:text-2xl bg-primary/10 text-primary">
                        {getInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-background shadow-md"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingAvatar}
                    >
                      {isUploadingAvatar ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Camera className="h-4 w-4" />
                      )}
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg truncate">
                      {getDisplayName()}
                    </h3>
                    <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
                    <p className="text-xs text-muted-foreground mt-1">Click camera icon to change avatar</p>
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
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Subscription & Access
              </CardTitle>
              <CardDescription>
                Manage your subscription and plan
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Status */}
              <div className="space-y-1">
                <Label className="text-muted-foreground">Status</Label>
                <p className={`font-medium ${getSubscriptionStatusDisplay().color}`}>
                  {getSubscriptionStatusDisplay().text}
                </p>
              </div>

              {/* Plan Type */}
              <div className="space-y-1">
                <Label className="text-muted-foreground">Plan</Label>
                <p className="font-medium">{getPlanTypeDisplay()}</p>
              </div>

              {/* Expiration */}
              {profile?.subscription_expires_at && (
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Expires</Label>
                  <p className="font-medium">
                    {new Date(profile.subscription_expires_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              )}

              {/* Alert for expired/canceled */}
              {(profile?.subscription_status?.toLowerCase() === 'expired' || 
                profile?.subscription_status?.toLowerCase() === 'canceled') && (
                <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
                  <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                  <AlertDescription className="text-yellow-800 dark:text-yellow-300">
                    Your subscription needs attention. Please upgrade or renew.
                  </AlertDescription>
                </Alert>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 pt-2">
                <Button 
                  onClick={() => navigate('/upgrade')} 
                  className="w-full"
                  variant="default"
                >
                  Upgrade Plan
                </Button>
                <Button 
                  onClick={handleRefreshSubscription}
                  variant="outline"
                  className="w-full"
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
