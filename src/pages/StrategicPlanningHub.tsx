import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { MapPin, Sprout } from "lucide-react";

export default function StrategicPlanningHub() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-accent/10">
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Strategic Planning Hub
            </h1>
            <p className="text-lg text-muted-foreground">
              Plan, assess, and strategically manage your homestead's future
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => navigate("/property-assessment")}
              variant="outline"
              className="gap-2"
            >
              <MapPin className="h-4 w-4" />
              Assess Property
            </Button>
            <Button
              onClick={() => navigate("/crop-planner")}
              className="gap-2"
            >
              <Sprout className="h-4 w-4" />
              Plan Crops
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
