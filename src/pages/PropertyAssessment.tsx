import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { PropertyForm } from '@/features/properties/PropertyForm';
import { PropertyList } from '@/features/properties/PropertyList';
import {
  getProperties,
  createProperty,
  updateProperty,
  deleteProperty,
  Property,
  PropertyInsert,
} from '@/features/properties/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function PropertyAssessment() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadProperties();
    }
  }, [user?.id]);

  const loadProperties = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const data = await getProperties(user.id);
      setProperties(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load properties',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data: PropertyInsert) => {
    if (!user?.id) return;

    try {
      const newProperty = await createProperty(user.id, data);
      setProperties([newProperty, ...properties]);
      setIsCreating(false);
      setSelectedProperty(newProperty);
      toast({
        title: 'Success',
        description: 'Property created successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create property',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const handleUpdate = async (data: PropertyInsert) => {
    if (!user?.id || !selectedProperty) return;

    try {
      const updated = await updateProperty(selectedProperty.id, user.id, data);
      setProperties(properties.map((p) => (p.id === updated.id ? updated : p)));
      setSelectedProperty(updated);
      toast({
        title: 'Success',
        description: 'Property updated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update property',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const handleDelete = async (id: string) => {
    if (!user?.id) return;

    if (!confirm('Are you sure you want to delete this property?')) return;

    try {
      await deleteProperty(id, user.id);
      setProperties(properties.filter((p) => p.id !== id));
      if (selectedProperty?.id === id) {
        setSelectedProperty(null);
      }
      toast({
        title: 'Success',
        description: 'Property deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete property',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Property Assessment</h1>
          <p className="text-muted-foreground mt-1">Manage your homestead properties</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Property List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Properties</CardTitle>
                <Button
                  size="sm"
                  onClick={() => {
                    setIsCreating(true);
                    setSelectedProperty(null);
                  }}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  New
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <PropertyList
                properties={properties}
                selectedId={selectedProperty?.id}
                onSelect={(property) => {
                  setSelectedProperty(property);
                  setIsCreating(false);
                }}
                onDelete={handleDelete}
              />
            </CardContent>
          </Card>

          {/* Property Form/Details */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>
                {isCreating ? 'Create Property' : selectedProperty ? 'Edit Property' : 'Property Details'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isCreating || selectedProperty ? (
                <PropertyForm
                  property={selectedProperty || undefined}
                  onSubmit={isCreating ? handleCreate : handleUpdate}
                  onCancel={() => {
                    setIsCreating(false);
                    setSelectedProperty(null);
                  }}
                />
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <p>Select a property to view details or create a new one.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
