import { Animal } from './api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Calendar } from 'lucide-react';
import { format, differenceInYears, differenceInMonths } from 'date-fns';

interface AnimalListProps {
  animals: Animal[];
  selectedId?: string;
  onSelect: (animal: Animal) => void;
  onDelete: (id: string) => void;
}

function calculateAge(birthDate: string | null): string {
  if (!birthDate) return 'Unknown';
  
  const birth = new Date(birthDate);
  const years = differenceInYears(new Date(), birth);
  
  if (years > 0) {
    return `${years} year${years > 1 ? 's' : ''}`;
  }
  
  const months = differenceInMonths(new Date(), birth);
  return `${months} month${months > 1 ? 's' : ''}`;
}

export function AnimalList({ animals, selectedId, onSelect, onDelete }: AnimalListProps) {
  if (animals.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No animals yet. Add your first animal to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {animals.map((animal) => (
        <Card
          key={animal.id}
          className={`cursor-pointer transition-all hover:shadow-soft ${
            selectedId === animal.id ? 'ring-2 ring-primary' : ''
          }`}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1" onClick={() => onSelect(animal)}>
                <div className="flex items-start gap-2 mb-2">
                  <h3 className="font-semibold text-foreground flex-1">{animal.name}</h3>
                  <Badge variant="outline">{animal.type}</Badge>
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  {animal.breed && <p>Breed: {animal.breed}</p>}
                  {animal.gender && <p>Gender: {animal.gender}</p>}
                  {animal.birth_date && (
                    <p className="inline-flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Age: {calculateAge(animal.birth_date)}
                    </p>
                  )}
                  {animal.weight_lbs && <p>Weight: {animal.weight_lbs} lbs</p>}
                  {animal.breeding_status && (
                    <Badge className="mt-1" variant="secondary">
                      {animal.breeding_status}
                    </Badge>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(animal.id);
                }}
                className="text-destructive hover:text-destructive ml-2"
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
