import { Property } from './api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface PropertyListProps {
  properties: Property[];
  selectedId?: string;
  onSelect: (property: Property) => void;
  onDelete: (id: string) => void;
}

export function PropertyList({ properties, selectedId, onSelect, onDelete }: PropertyListProps) {
  if (properties.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No properties yet. Create your first property to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {properties.map((property) => (
        <Card
          key={property.id}
          className={`cursor-pointer transition-all hover:shadow-soft ${
            selectedId === property.id ? 'ring-2 ring-primary' : ''
          }`}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1" onClick={() => onSelect(property)}>
                <h3 className="font-semibold text-foreground mb-1">{property.name}</h3>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>{property.size_acres} acres</p>
                  <p>{property.location}</p>
                  {property.climate_zone && <p className="text-xs">Zone: {property.climate_zone}</p>}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(property.id);
                }}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
