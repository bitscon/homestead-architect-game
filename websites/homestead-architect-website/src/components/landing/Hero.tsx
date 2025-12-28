import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-homestead.jpg";

const Hero = () => {
  return (
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
              <Button size="lg" className="bg-gradient-warm hover:opacity-90 transition-opacity shadow-soft text-base" href="https://mybarn.barn.workshop.home/auth/register?plan=free">
                Get Started Free
              </Button>
              <Button size="lg" className="bg-gradient-primary hover:opacity-90 transition-opacity shadow-elevation text-base" href="#pricing">
                View Plans
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
  );
};

export default Hero;