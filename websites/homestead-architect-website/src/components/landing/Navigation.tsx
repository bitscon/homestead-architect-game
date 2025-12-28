import { Button } from "@/components/ui/button";
import { Sprout } from "lucide-react";

const Navigation = () => {
  return (
    <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Sprout className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-foreground">Homestead Architect</span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </a>
            <a href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              How It Works
            </a>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" href="https://mybarn.barn.workshop.home/auth/login">
              Login
            </Button>
            <Button className="bg-gradient-warm hover:opacity-90 transition-opacity shadow-soft" href="https://mybarn.barn.workshop.home/auth/register?plan=free">
              Get Started Free
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;