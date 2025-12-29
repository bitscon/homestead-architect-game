import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Star } from "lucide-react";
import { pricingTiers, createCheckoutSession } from "@/lib/stripe";
import { useState } from "react";

const Pricing = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const handleSubscribe = async (tierId: string, priceId: string, _planName: string) => {
    if (tierId === 'free') {
      // For free tier, redirect directly to registration with plan parameter
      window.location.href = 'https://myhome.homesteadarchitect.com/auth/register?plan=free';
      return;
    }

    // For paid plans, prompt for email
    const email = prompt('Please enter your email address to continue to checkout:');
    
    if (!email) {
      return; // User canceled
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      alert('Please enter a valid email address');
      return;
    }

    try {
      const session = await createCheckoutSession(
        priceId,
        email.trim(),
        tierId
      );
      
      if (session.url) {
        window.location.href = session.url;
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert('There was an error starting your subscription. Please try again.');
    }
  };

  return (
    <section id="pricing" className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Choose Your Plan
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Start planning your homestead today. Upgrade as you grow.
          </p>

          {/* Billing Cycle Toggle */}
          <div className="inline-flex items-center gap-4 p-1 bg-card border border-border rounded-lg">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                billingCycle === 'monthly'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                billingCycle === 'yearly'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Yearly
              <span className="ml-2 text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                Save 50%
              </span>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {pricingTiers.map((tier) => {
            const currentPrice = billingCycle === 'monthly' ? tier.monthlyPrice : tier.yearlyPrice;
            const currentPriceId = billingCycle === 'monthly' ? tier.monthlyPriceId : tier.yearlyPriceId;

            return (
              <Card
                key={tier.id}
                className={`relative p-6 hover:shadow-soft transition-shadow bg-card border-border ${
                  tier.popular ? 'ring-2 ring-primary/20 border-primary/20' : ''
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                      <Star className="h-3 w-3 fill-current" />
                      Most Popular
                    </div>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-foreground mb-2">{tier.name}</h3>
                  <div className="text-3xl font-bold text-primary mb-1">{currentPrice}</div>
                  <p className="text-sm text-muted-foreground">{tier.description}</p>
                </div>

                <ul className="space-y-3 mb-6">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  size="lg"
                  className={`w-full ${
                    tier.id === 'free'
                      ? 'bg-gradient-warm hover:opacity-90 transition-opacity shadow-soft'
                      : tier.popular
                        ? 'bg-gradient-primary hover:opacity-90 transition-opacity shadow-elevation'
                        : 'bg-primary hover:bg-primary/90'
                  }`}
                  onClick={() => handleSubscribe(tier.id, currentPriceId, tier.name)}
                >
                  {tier.id === 'free' ? 'Get Started Free' : `Start ${tier.name} Plan`}
                </Button>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground">
            All paid plans include a 14-day free trial. Cancel anytime.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
