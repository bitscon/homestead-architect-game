import { Card } from "@/components/ui/card";
import { Sprout, Grid3x3, Building, MapPin } from "lucide-react";

const Features = () => {
  return (
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
  );
};

export default Features;