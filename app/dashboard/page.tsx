"use client";

// import { useWebSocket } from '@/contexts/WebSocketContext';
import { useEffect, useState } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { supabase } from '@/utils/supabase';
import { useAuth } from '@/contexts/AuthContext';


import { useRouter } from 'next/navigation';
import { useSubscription } from '@/hooks/useSubscription';
// import { OnboardingTour } from '@/components/OnboardingTour';
import { useTrialStatus } from '@/hooks/useTrialStatus';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Users, 
  CreditCard, 
  Settings,
  PlusCircle,
  Clock,
  TrendingUp,
  Activity
} from 'lucide-react';

const AUTH_TIMEOUT = 15000; // 15 seconds

// Dashboard metrics data
const dashboardMetrics = [
  {
    title: "Total Users",
    value: "1,234",
    change: "+12.3%",
    icon: <Users className="h-6 w-6 text-primary" />,
    trend: "up"
  },
  {
    title: "Revenue",
    value: "$12.4k",
    change: "+8.2%",
    icon: <CreditCard className="h-6 w-6 text-primary" />,
    trend: "up"
  },
  {
    title: "Active Sessions",
    value: "432",
    change: "-3.1%",
    icon: <Activity className="h-6 w-6 text-primary" />,
    trend: "down"
  },
  {
    title: "Growth Rate",
    value: "18.2%",
    change: "+2.4%",
    icon: <TrendingUp className="h-6 w-6 text-primary" />,
    trend: "up"
  }
];

// Recent activity data
const recentActivity = [
  {
    id: 1,
    action: "New user signup",
    timestamp: "2 minutes ago",
    icon: <PlusCircle className="h-4 w-4" />
  },
  {
    id: 2,
    action: "Payment processed",
    timestamp: "15 minutes ago",
    icon: <CreditCard className="h-4 w-4" />
  },
  {
    id: 3,
    action: "Settings updated",
    timestamp: "1 hour ago",
    icon: <Settings className="h-4 w-4" />
  },
  {
    id: 4,
    action: "Session completed",
    timestamp: "2 hours ago",
    icon: <Clock className="h-4 w-4" />
  }
];

export default function Dashboard() {

  
  // const { isConnected } = useWebSocket();
  // const [fullResponse, setFullResponse] = useState('');
  const { user, isSubscriber, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const { subscription, isLoading: isSubLoading, fetchSubscription } = useSubscription();
  const [hasCheckedSubscription, setHasCheckedSubscription] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  interface PropertyData {
    id: string;
    title: string;
    description: string;
  }

  const [recentProperties, setRecentProperties] = useState<PropertyData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isInTrial, isLoading: isTrialLoading } = useTrialStatus();
  const [authTimeout, setAuthTimeout] = useState(false);

  // Add new states for dashboard functionality
  // const [repositories, setRepositories] = useState([]);
  // const [feedbackSources, setFeedbackSources] = useState([]);
  // const [recentFeedback, setRecentFeedback] = useState([]);
  // const [pendingPRs, setPendingPRs] = useState([]);

  // First check - Subscription and trial check
  useEffect(() => {
    if (isSubLoading || isTrialLoading) return;
    
    const hasValidSubscription = ['active', 'trialing'].includes(subscription?.status || '');
    
    console.log('Access check isInTrial:', {
      hasSubscription: !!subscription,
      status: subscription?.status,
      isInTrial: isInTrial,
      validUntil: subscription?.current_period_end
    });

    // Only redirect if there's no valid subscription AND no valid trial
    if (!hasValidSubscription && !isInTrial) {
      console.log('No valid subscription or trial, redirecting');
      router.replace('/profile');
    }
  }, [subscription, isSubLoading, isTrialLoading, router, isInTrial]);

  // Second check - Auth check
  useEffect(() => {
    if (isAuthLoading || isTrialLoading) return;

    console.log('Access check:', {
      isSubscriber,
      hasCheckedSubscription,
      isInTrial: isInTrial,
      authLoading: isAuthLoading,
    });

    if (!hasCheckedSubscription) {
      setHasCheckedSubscription(true);
      
      // Allow access for both subscribers and trial users
      if (!user || (!isSubscriber && !isInTrial && !isAuthLoading)) {
        console.log('No valid subscription or trial, redirecting');
        router.replace('/profile');
      }
    }
  }, [isSubscriber, isAuthLoading, hasCheckedSubscription, router, user, subscription, isTrialLoading, isInTrial]);

  // Add refresh effect
  useEffect(() => {
    const refreshSubscription = async () => {
      await fetchSubscription();
      setHasCheckedSubscription(true);
    };
    
    if (user?.id) {
      refreshSubscription();
    }
  }, [user?.id, fetchSubscription]);

  useEffect(() => {
    if (user?.id) {
      // Check if user has completed onboarding
      const checkOnboarding = async () => {
        const { data } = await supabase
          .from('user_preferences')
          .select('has_completed_onboarding')
          .eq('user_id', user.id)
          .single();
        
        setHasCompletedOnboarding(!!data?.has_completed_onboarding);
        console.log('hasCompletedOnboarding: ', hasCompletedOnboarding)
      };
      
      checkOnboarding();
    }
  }, [user?.id, hasCompletedOnboarding]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!user && (isAuthLoading || isTrialLoading)) {
        setAuthTimeout(true);
      }
    }, AUTH_TIMEOUT);
    
    return () => clearTimeout(timer);
  }, [user, isAuthLoading, isTrialLoading]);

  // useEffect(() => {
  //   if (!hasCompletedOnboarding) {
  //     router.push('/onboarding');
  //   }
  // }, [hasCompletedOnboarding, router]);

  // Fetch recent properties
  const fetchRecentProperties = async () => {
    try {
      
      // Get recent properties, ordered by created_at
      const { data: propertiesData, error } = await supabase
        .from('properties')
        .select('id, title, description')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      
      if (!propertiesData || propertiesData.length === 0) {
        setRecentProperties([]);
      } else {
        const validProperties = propertiesData.filter((property: any) => {
          return (
            property.id &&
            property.title &&
            // property.price !== null &&
            property.description !== null 
          );
        }) as PropertyData[];

        setRecentProperties(validProperties);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentProperties();
  }, []);

  // Update the loading check
  if (!user && (isAuthLoading || isTrialLoading) && !hasCheckedSubscription) {
    console.log('user: ', user)
    console.log('isAuthLoading: ', isAuthLoading)
    console.log('hasCheckedSubscription: ', hasCheckedSubscription)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground mb-4 mx-auto"></div>
          <p className="text-foreground">
            {authTimeout ? 
              "Taking longer than usual? Try refreshing the page 😊." :
              "Verifying access..."}
          </p>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120]">
      {/* Dashboard Header */}
      <div className="bg-white dark:bg-neutral-dark border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Dashboard Overview
            </h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-600 dark:text-slate-300">
                {isInTrial ? "Trial Period" : "Premium Plan"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {dashboardMetrics.map((metric, index) => (
            <motion.div
              key={metric.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-neutral-dark rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700"
            >
              <div className="flex items-center justify-between">
                <div className="p-2 bg-primary/10 dark:bg-primary-light/10 rounded-lg">
                  {metric.icon}
                </div>
                <span className={`text-sm font-medium ${
                  metric.trend === 'up' ? 'text-green-500' : 'text-red-500'
                }`}>
                  {metric.change}
                </span>
              </div>
              <h3 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">
                {metric.value}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {metric.title}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Activity Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart Section */}
          <div className="lg:col-span-2 bg-white dark:bg-neutral-dark rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Analytics Overview
              </h3>
              <BarChart3 className="h-5 w-5 text-slate-400" />
            </div>
            <div className="h-64 flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
              <p className="text-slate-400 dark:text-slate-500">
                Chart Placeholder
              </p>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white dark:bg-neutral-dark rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
              Recent Activity
            </h3>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center space-x-3 text-sm"
                >
                  <div className="p-2 bg-primary/10 dark:bg-primary-light/10 rounded-lg">
                    {activity.icon}
                  </div>
                  <div>
                    <p className="text-slate-900 dark:text-white">
                      {activity.action}
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 text-xs">
                      {activity.timestamp}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Recent Properties */}
          <div className="bg-white dark:bg-neutral-dark rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
              Recent Properties
            </h3>
            {isLoading ? (
              <div className="flex items-center justify-center p-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground"></div>
              </div>
            ) : recentProperties.length === 0 ? (
              <p className="text-slate-500 dark:text-slate-400 p-4">
                No properties found
              </p>
            ) : (
              <div className="space-y-4">
                {recentProperties.map((property) => (
                  <motion.div
                    key={property.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center space-x-3 text-sm"
                  >
                    <div className="p-2 bg-primary/10 dark:bg-primary-light/10 rounded-lg">
                      <PlusCircle className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-slate-900 dark:text-white font-medium">
                        {property.title}
                      </p>
                      <div className="flex items-center space-x-2 text-xs">
                        <span className="text-slate-500 dark:text-slate-400">
                          {/* {property.beds} beds
                        </span>
                        <span className="text-slate-500 dark:text-slate-400">
                          {property.baths} baths
                        </span>
                        <span className="text-slate-500 dark:text-slate-400">
                          {property.sqft} sqft */}
                        </span>
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
                        ${property.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
