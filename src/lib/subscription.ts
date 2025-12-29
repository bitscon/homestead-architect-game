// =====================================================
// Subscription Helper Utilities
// =====================================================
// Frontend utilities for checking user subscription status
// and gating features based on plan

import { supabase } from '@/integrations/supabase/client';

export type Plan = 'free' | 'basic' | 'pro';
export type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'canceled' | 'incomplete' | 'unpaid';

export interface UserSubscription {
  id: string;
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  stripe_price_id: string | null;
  plan: Plan;
  status: SubscriptionStatus;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserEntitlements {
  user_id: string;
  can_access_dashboard: boolean;
  max_properties: number;
  max_animals: number;
  max_crops: number;
  can_export_data: boolean;
  can_use_analytics: boolean;
  updated_at: string;
}

// =====================================================
// Get Current User's Subscription
// =====================================================
export async function getUserSubscription(): Promise<UserSubscription | null> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return null;
  }
  
  const { data, error } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .single();
  
  if (error) {
    console.error('Error fetching subscription:', error);
    return null;
  }
  
  return data as UserSubscription;
}

// =====================================================
// Get Current User's Entitlements
// =====================================================
export async function getUserEntitlements(): Promise<UserEntitlements | null> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return null;
  }
  
  const { data, error } = await supabase
    .from('user_entitlements')
    .select('*')
    .eq('user_id', user.id)
    .single();
  
  if (error) {
    console.error('Error fetching entitlements:', error);
    return null;
  }
  
  return data as UserEntitlements;
}

// =====================================================
// Check if User Has Active Subscription
// =====================================================
export async function hasActiveSubscription(): Promise<boolean> {
  const subscription = await getUserSubscription();
  
  if (!subscription) {
    return false;
  }
  
  return subscription.status === 'active' || subscription.status === 'trialing';
}

// =====================================================
// Check if User Has Specific Plan
// =====================================================
export async function hasPlan(requiredPlan: Plan): Promise<boolean> {
  const subscription = await getUserSubscription();
  
  if (!subscription) {
    return requiredPlan === 'free';
  }
  
  const planHierarchy: Record<Plan, number> = {
    free: 0,
    basic: 1,
    pro: 2
  };
  
  return planHierarchy[subscription.plan] >= planHierarchy[requiredPlan];
}

// =====================================================
// Check if User Can Access Feature
// =====================================================
export async function canAccessFeature(feature: keyof UserEntitlements): Promise<boolean> {
  const entitlements = await getUserEntitlements();
  
  if (!entitlements) {
    return false;
  }
  
  return Boolean(entitlements[feature]);
}

// =====================================================
// Check if User is Within Resource Limit
// =====================================================
export async function isWithinLimit(
  resourceType: 'properties' | 'animals' | 'crops',
  currentCount: number
): Promise<boolean> {
  const entitlements = await getUserEntitlements();
  
  if (!entitlements) {
    return false;
  }
  
  const limitKey = `max_${resourceType}` as keyof UserEntitlements;
  const limit = entitlements[limitKey];
  
  if (typeof limit !== 'number') {
    return false;
  }
  
  return currentCount < limit;
}

// =====================================================
// Get Subscription Status Display
// =====================================================
export function getStatusDisplay(status: SubscriptionStatus): {
  label: string;
  color: string;
  description: string;
} {
  const statusMap: Record<SubscriptionStatus, { label: string; color: string; description: string }> = {
    trialing: {
      label: 'Trial',
      color: 'blue',
      description: 'Your trial is active'
    },
    active: {
      label: 'Active',
      color: 'green',
      description: 'Your subscription is active'
    },
    past_due: {
      label: 'Past Due',
      color: 'yellow',
      description: 'Payment failed - please update your payment method'
    },
    canceled: {
      label: 'Canceled',
      color: 'gray',
      description: 'Your subscription has been canceled'
    },
    incomplete: {
      label: 'Incomplete',
      color: 'orange',
      description: 'Payment is pending'
    },
    unpaid: {
      label: 'Unpaid',
      color: 'red',
      description: 'Payment failed - subscription will be canceled soon'
    }
  };
  
  return statusMap[status] || {
    label: 'Unknown',
    color: 'gray',
    description: 'Status unknown'
  };
}

// =====================================================
// Get Plan Display Info
// =====================================================
export function getPlanDisplay(plan: Plan): {
  name: string;
  color: string;
  features: string[];
} {
  const planMap: Record<Plan, { name: string; color: string; features: string[] }> = {
    free: {
      name: 'Free',
      color: 'gray',
      features: [
        'Up to 2 properties',
        'Up to 10 animals',
        'Up to 10 crops',
        'Basic features'
      ]
    },
    basic: {
      name: 'Basic',
      color: 'blue',
      features: [
        'Up to 10 properties',
        'Up to 50 animals',
        'Up to 50 crops',
        'Analytics dashboard',
        'Email support'
      ]
    },
    pro: {
      name: 'Pro',
      color: 'purple',
      features: [
        'Unlimited properties',
        'Unlimited animals',
        'Unlimited crops',
        'Advanced analytics',
        'Data export',
        'Priority support'
      ]
    }
  };
  
  return planMap[plan];
}

// =====================================================
// Calculate Days Until Period End
// =====================================================
export function daysUntilPeriodEnd(subscription: UserSubscription | null): number | null {
  if (!subscription || !subscription.current_period_end) {
    return null;
  }
  
  const endDate = new Date(subscription.current_period_end);
  const now = new Date();
  const diffTime = endDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}
