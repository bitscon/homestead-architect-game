import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Error = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="max-w-md w-full p-8">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Payment Cancelled
          </h1>
          <p className="text-muted-foreground mb-8">
            Your payment was cancelled or there was an issue processing your subscription.
            Don't worry, you haven't been charged.
          </p>

          <div className="space-y-4">
            <Button
              size="lg"
              className="bg-gradient-primary hover:opacity-90 transition-opacity shadow-elevation w-full"
              onClick={() => window.location.href = '/#pricing'}
            >
              Try Again
              <RefreshCw className="ml-2 h-4 w-4" />
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="w-full"
              onClick={() => window.location.href = '/'}
            >
              Return to Homepage
            </Button>
          </div>

          <div className="mt-6 text-sm text-muted-foreground">
            <p>Need help or have questions?</p>
            <a
              href="mailto:support@homesteadarchitect.com"
              className="text-primary hover:underline"
            >
              Contact our support team
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Error;