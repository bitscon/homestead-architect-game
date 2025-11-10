import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AnimalForm } from '@/features/animals/AnimalForm';
import { AnimalList } from '@/features/animals/AnimalList';
import {
  getAnimals,
  createAnimal,
  updateAnimal,
  deleteAnimal,
  Animal,
  AnimalInsert,
} from '@/features/animals/api';
import { getProperties, Property } from '@/features/properties/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { TabHeader } from '@/components/ui/TabHeader';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Plus, Settings } from 'lucide-react';

export default function HealthHub() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('animals');

  useEffect(() => {
    if (user?.id) {
      loadData();
    }
  }, [user?.id]);

  const loadData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const [animalsData, propertiesData] = await Promise.all([
        getAnimals(user.id),
        getProperties(user.id),
      ]);
      setAnimals(animalsData);
      setProperties(propertiesData);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data: AnimalInsert) => {
    if (!user?.id) return;

    try {
      const newAnimal = await createAnimal(user.id, data);
      setAnimals([newAnimal, ...animals]);
      setIsCreating(false);
      setSelectedAnimal(newAnimal);
      toast({
        title: 'Success',
        description: 'Animal added successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add animal',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const handleUpdate = async (data: AnimalInsert) => {
    if (!user?.id || !selectedAnimal) return;

    try {
      const updated = await updateAnimal(selectedAnimal.id, user.id, data);
      setAnimals(animals.map((a) => (a.id === updated.id ? updated : a)));
      setSelectedAnimal(updated);
      toast({
        title: 'Success',
        description: 'Animal updated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update animal',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const handleDelete = async (id: string) => {
    if (!user?.id) return;

    if (!confirm('Are you sure you want to delete this animal?')) return;

    try {
      await deleteAnimal(id, user.id);
      setAnimals(animals.filter((a) => a.id !== id));
      if (selectedAnimal?.id === id) {
        setSelectedAnimal(null);
      }
      toast({
        title: 'Success',
        description: 'Animal deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete animal',
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

  const tabs = [
    { id: 'animals', label: 'Animals' },
    { id: 'family-tree', label: 'Family Tree' },
    { id: 'grooming', label: 'Grooming' },
    { id: 'medications', label: 'Medications' },
    { id: 'dosage', label: 'Dosage' },
    { id: 'library', label: 'Library' },
    { id: 'care', label: 'Care' },
  ];

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: 'hsl(var(--health-hub-bg))' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Health Hub</h1>
              <p className="text-muted-foreground mt-1">Manage your animals' health and medications</p>
            </div>
            <div className="flex items-center gap-3">
              <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select property" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Properties</SelectItem>
                  {properties.map((property) => (
                    <SelectItem key={property.id} value={property.id}>
                      {property.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Manage Types
              </Button>
            </div>
          </div>

          {/* Tab Header */}
          <TabHeader tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">

          <TabsContent value="animals" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Animal List */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Animals</CardTitle>
                    <Button
                      size="sm"
                      onClick={() => {
                        setIsCreating(true);
                        setSelectedAnimal(null);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <AnimalList
                    animals={animals}
                    selectedId={selectedAnimal?.id}
                    onSelect={(animal) => {
                      setSelectedAnimal(animal);
                      setIsCreating(false);
                    }}
                    onDelete={handleDelete}
                  />
                </CardContent>
              </Card>

              {/* Animal Form */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>
                    {isCreating ? 'Add Animal' : selectedAnimal ? 'Edit Animal' : 'Animal Details'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isCreating || selectedAnimal ? (
                    <AnimalForm
                      animal={selectedAnimal || undefined}
                      properties={properties}
                      onSubmit={isCreating ? handleCreate : handleUpdate}
                      onCancel={() => {
                        setIsCreating(false);
                        setSelectedAnimal(null);
                      }}
                    />
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <p>Select an animal to view details or add a new one.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="family-tree">
            <Card>
              <CardHeader>
                <CardTitle>Family Tree</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <p>Family tree visualization coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="grooming">
            <Card>
              <CardHeader>
                <CardTitle>Grooming</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <p>Grooming schedule coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="medications">
            <Card>
              <CardHeader>
                <CardTitle>Medications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <p>Medication tracking coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dosage">
            <Card>
              <CardHeader>
                <CardTitle>Dosage Calculator</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <p>Dosage calculator coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="library">
            <Card>
              <CardHeader>
                <CardTitle>Health Library</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <p>Health resources coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="care">
            <Card>
              <CardHeader>
                <CardTitle>Care Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <p>Care schedule coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
