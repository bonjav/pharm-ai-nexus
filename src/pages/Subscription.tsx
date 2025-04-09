
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Check, Loader2, Users, Package, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string | null;
  price: number;
  interval: string;
  features: string[] | null;
  product_limit: string | null;
  employee_limit: string | null;
  available_roles: string[] | null;
}

interface UserSubscription {
  id: string;
  status: 'active' | 'canceled' | 'expired' | 'trial';
  plan_id: string;
  current_period_end: string;
}

const fetchSubscriptionPlans = async () => {
  const { data, error } = await supabase
    .from('subscription_plans')
    .select('*');

  if (error) throw error;
  return data as unknown as SubscriptionPlan[];
};

const fetchUserSubscription = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data as UserSubscription | null;
};

const Subscription = () => {
  const { user } = useAuth();
  const [processingPlanId, setProcessingPlanId] = useState<string | null>(null);

  const { data: plans, isLoading: plansLoading, error: plansError } = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: fetchSubscriptionPlans
  });

  const { data: userSubscription, isLoading: subscriptionLoading, refetch: refetchSubscription } = useQuery({
    queryKey: ['user-subscription', user?.id],
    queryFn: () => user?.id ? fetchUserSubscription(user.id) : Promise.resolve(null),
    enabled: !!user?.id,
  });

  const handleSubscribe = async (plan: SubscriptionPlan) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to subscribe to a plan",
        variant: "destructive",
      });
      return;
    }

    setProcessingPlanId(plan.id);

    try {
      // In a real implementation, this would redirect to a payment processor
      // For demo purposes, we'll directly create a subscription
      const currentDate = new Date();
      const endDate = new Date(currentDate);
      endDate.setMonth(endDate.getMonth() + 1); // 1 month subscription
      
      const { error } = await supabase
        .from('user_subscriptions')
        .insert({
          user_id: user.id,
          plan_id: plan.id,
          status: 'active',
          current_period_start: currentDate.toISOString(),
          current_period_end: endDate.toISOString()
        });

      if (error) throw error;

      toast({
        title: "Subscription successful!",
        description: `You are now subscribed to the ${plan.name} plan.`,
      });
      
      refetchSubscription();
    } catch (error: any) {
      toast({
        title: "Subscription failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setProcessingPlanId(null);
    }
  };

  const isSubscribed = !!userSubscription;
  const currentPlanId = userSubscription?.plan_id;

  if (plansLoading || subscriptionLoading) {
    return (
      <Layout title="Subscription Plans">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-pharma-primary" />
        </div>
      </Layout>
    );
  }

  if (plansError) {
    return (
      <Layout title="Subscription Plans">
        <div className="bg-red-50 p-4 rounded-md text-red-700">
          Error loading subscription plans. Please try again later.
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Subscription Plans">
      <div className="max-w-5xl mx-auto">
        {isSubscribed && (
          <Card className="mb-8 border-pharma-primary/30 bg-pharma-primary/5">
            <CardHeader>
              <CardTitle>Current Subscription</CardTitle>
              <CardDescription>
                You are currently subscribed to the{" "}
                <span className="font-medium">
                  {plans?.find(p => p.id === currentPlanId)?.name || "Unknown"}
                </span>{" "}
                plan.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Status: <span className="capitalize font-medium">{userSubscription.status}</span>
              </p>
              <p className="mt-2">
                Your subscription will {userSubscription.status === 'active' ? 'renew' : 'expire'} on{" "}
                {new Date(userSubscription.current_period_end).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 md:grid-cols-3">
          {plans?.map((plan) => (
            <Card key={plan.id} className="flex flex-col">
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="mb-4">
                  <span className="text-3xl font-bold">${plan.price}</span>
                  <span className="text-muted-foreground">/{plan.interval}</span>
                </div>

                <div className="mb-4 space-y-2">
                  <div className="flex items-center">
                    <Package className="h-4 w-4 mr-2 text-pharma-primary" />
                    <span><strong>Products:</strong> {plan.product_limit || 'N/A'}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2 text-pharma-primary" />
                    <span><strong>Employees:</strong> {plan.employee_limit || 'N/A'}</span>
                  </div>
                  <div className="flex items-start">
                    <Shield className="h-4 w-4 mr-2 text-pharma-primary mt-1" />
                    <div>
                      <strong>Available Roles:</strong>
                      <ul className="list-disc pl-5 mt-1 text-sm">
                        {plan.available_roles?.map((role, idx) => (
                          <li key={idx}>{role}</li>
                        )) || <li>Basic roles</li>}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2">Features:</h4>
                  <ul className="space-y-2">
                    {Array.isArray(plan.features) ? plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <Check className="h-4 w-4 mr-2 text-pharma-primary" />
                        {feature}
                      </li>
                    )) : <li>Standard features</li>}
                  </ul>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  onClick={() => handleSubscribe(plan)}
                  disabled={processingPlanId === plan.id || (isSubscribed && currentPlanId === plan.id)}
                >
                  {processingPlanId === plan.id ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : isSubscribed && currentPlanId === plan.id ? (
                    "Current Plan"
                  ) : (
                    "Subscribe"
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Subscription;
