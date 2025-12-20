import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sprout, Grid3x3, Building, MapPin } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import heroImage from "@/assets/hero-homestead.jpg";

const Index = () => {
  const { session, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && session) {
      navigate('/dashboard', { replace: true });
    }
  }, [session, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Only show landing page if user is NOT logged in
  if (session) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
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
              <a href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                How It Works
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" asChild>
                <Link to="/auth/login">Login</Link>
              </Button>
              <Button className="bg-gradient-primary hover:opacity-90 transition-opacity shadow-soft" asChild>
                <Link to="/auth/register">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                Design Your Dream Homestead
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
                Plan the perfect property layout with intuitive tools. Create sustainable spaces for gardens, livestock, orchards, and buildings that work in harmony with nature.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-gradient-primary hover:opacity-90 transition-opacity shadow-elevation text-base" asChild>
                  <Link to="/auth/register">Start Planning</Link>
                </Button>
                <Button size="lg" variant="outline" className="border-2 text-base" asChild>
                  <Link to="/auth/login">Sign In</Link>
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-video rounded-2xl overflow-hidden shadow-elevation border border-border">
                <img 
                  src={heroImage} 
                  alt="Beautiful homestead property aerial view" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-primary rounded-full blur-3xl opacity-20" />
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-gradient-warm rounded-full blur-3xl opacity-20" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything You Need to Plan
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful tools designed specifically for homestead planning and sustainable property design.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 hover:shadow-soft transition-shadow bg-card border-border">
              <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center mb-4">
                <Grid3x3 className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Layout Planning</h3>
              <p className="text-muted-foreground">
                Create detailed property layouts with drag-and-drop simplicity. Design zones for different purposes.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-soft transition-shadow bg-card border-border">
              <div className="w-12 h-12 rounded-lg bg-gradient-warm flex items-center justify-center mb-4">
                <Sprout className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Garden Design</h3>
              <p className="text-muted-foreground">
                Plan vegetable gardens, orchards, and permaculture zones. Track sun patterns and water flow.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-soft transition-shadow bg-card border-border">
              <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center mb-4">
                <Building className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Structure Placement</h3>
              <p className="text-muted-foreground">
                Position barns, coops, sheds, and greenhouses optimally. Consider access and functionality.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-soft transition-shadow bg-card border-border">
              <div className="w-12 h-12 rounded-lg bg-gradient-warm flex items-center justify-center mb-4">
                <MapPin className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Site Analysis</h3>
              <p className="text-muted-foreground">
                Analyze topography, soil conditions, and microclimates. Make informed planning decisions.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Simple Planning Process
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From blank canvas to detailed homestead plan in just a few steps.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-primary text-white text-2xl font-bold flex items-center justify-center mx-auto mb-4 shadow-soft">
                1
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Define Your Property</h3>
              <p className="text-muted-foreground">
                Set your property boundaries, dimensions, and basic topography.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-primary text-white text-2xl font-bold flex items-center justify-center mx-auto mb-4 shadow-soft">
                2
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Add Elements</h3>
              <p className="text-muted-foreground">
                Place buildings, gardens, water features, and infrastructure exactly where you want them.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-primary text-white text-2xl font-bold flex items-center justify-center mx-auto mb-4 shadow-soft">
                3
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Refine & Share</h3>
              <p className="text-muted-foreground">
                Adjust your design, get feedback, and export your plan for implementation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE0YzAtMS4xLS45LTItMi0yaC00Yy0xLjEgMC0yIC45LTIgMnY0YzAgMS4xLjkgMiAyIDJoNGMxLjEgMCAyLS45IDItMnYtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Design Your Homestead?
            </h2>
            <p className="text-lg mb-8 opacity-90">
              Start planning your sustainable property today. No credit card required.
            </p>
            <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90 transition-colors shadow-elevation" asChild>
              <Link to="/auth/register">Start Planning Free</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-card border-t border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Sprout className="h-5 w-5 text-primary" />
              <span className="font-semibold text-foreground">Homestead Architect</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 Homestead Architect. Building sustainable futures.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
