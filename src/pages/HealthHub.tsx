import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AnimalForm } from '@/features/health/AnimalForm';
import { MedicationForm } from '@/features/health/MedicationForm';
import {
  getAnimals,
  createAnimal,
  updateAnimal,
  deleteAnimal,
  Animal,
  AnimalInsert,
} from '@/features/animals/api';
import {
  getMedications,
  createMedication,
  updateMedication,
  deleteMedication,
  Medication,
  MedicationInsert,
} from '@/features/health/medicationsApi';
import { calculateDosage, formatDosage } from '@/features/health/dosageCalculator';
import { getProperties, Property } from '@/features/properties/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { TabHeader } from '@/components/ui/TabHeader';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Settings, Edit2, Trash2, Bird, Pill, Search, Calculator, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

export default function HealthHub() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [medicationFormOpen, setMedicationFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('animals');
  const [medicationSearch, setMedicationSearch] = useState('');
  
  // Dosage calculator state
  const [dosageAnimal, setDosageAnimal] = useState<string>('');
  const [dosageMedication, setDosageMedication] = useState<string>('');
  const [dosageWeight, setDosageWeight] = useState<string>('');
  const [calculatedDose, setCalculatedDose] = useState<number | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadData();
    }
  }, [user?.id]);

  const loadData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const [animalsData, propertiesData, medicationsData] = await Promise.all([
        getAnimals(user.id),
        getProperties(user.id),
        getMedications(user.id),
      ]);
      setAnimals(animalsData);
      setProperties(propertiesData);
      setMedications(medicationsData);
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

  const handleSubmit = async (data: AnimalInsert) => {
    if (!user?.id) return;

    try {
      if (selectedAnimal) {
        const updated = await updateAnimal(selectedAnimal.id, user.id, data);
        setAnimals(animals.map((a) => (a.id === updated.id ? updated : a)));
        toast({
          title: 'Success',
          description: 'Animal updated successfully',
        });
      } else {
        const newAnimal = await createAnimal(user.id, data);
        setAnimals([newAnimal, ...animals]);
        toast({
          title: 'Success',
          description: 'Animal added successfully',
        });
      }
      setSelectedAnimal(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${selectedAnimal ? 'update' : 'add'} animal`,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const handleMedicationSubmit = async (data: MedicationInsert) => {
    if (!user?.id) return;

    try {
      if (selectedMedication) {
        const updated = await updateMedication(selectedMedication.id, data);
        setMedications(medications.map((m) => (m.id === updated.id ? updated : m)));
        toast({
          title: 'Success',
          description: 'Medication updated successfully',
        });
      } else {
        const newMedication = await createMedication(user.id, data);
        setMedications([newMedication, ...medications]);
        toast({
          title: 'Success',
          description: 'Medication added successfully',
        });
      }
      setSelectedMedication(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${selectedMedication ? 'update' : 'add'} medication`,
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

  const handleMedicationDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this medication?')) return;

    try {
      await deleteMedication(id);
      setMedications(medications.filter((m) => m.id !== id));
      if (selectedMedication?.id === id) {
        setSelectedMedication(null);
      }
      toast({
        title: 'Success',
        description: 'Medication deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete medication',
        variant: 'destructive',
      });
    }
  };

  const filteredMedications = medications.filter((med) =>
    med.name.toLowerCase().includes(medicationSearch.toLowerCase()) ||
    med.target_animals.some(animal => animal.toLowerCase().includes(medicationSearch.toLowerCase()))
  );

  // Get filtered medications for dosage calculator based on selected animal type
  const selectedAnimalData = animals.find(a => a.id === dosageAnimal);
  const dosageMedicationsFiltered = selectedAnimalData
    ? medications.filter(med => 
        med.target_animals.some(target => 
          target.toLowerCase() === selectedAnimalData.type.toLowerCase()
        )
      )
    : medications;

  const selectedDosageMedication = medications.find(m => m.id === dosageMedication);
  
  // Calculate dosage when all inputs are ready
  useEffect(() => {
    if (dosageWeight && selectedDosageMedication?.dosage_per_lb) {
      const weight = parseFloat(dosageWeight);
      if (!isNaN(weight) && weight > 0) {
        const dose = calculateDosage(weight, selectedDosageMedication.dosage_per_lb);
        setCalculatedDose(dose);
      } else {
        setCalculatedDose(null);
      }
    } else {
      setCalculatedDose(null);
    }
  }, [dosageWeight, selectedDosageMedication]);

  // Auto-fill weight from animal record
  useEffect(() => {
    if (selectedAnimalData?.weight_lbs) {
      setDosageWeight(selectedAnimalData.weight_lbs.toString());
    } else {
      setDosageWeight('');
    }
  }, [dosageAnimal, selectedAnimalData]);

  const handleResetDosageCalculator = () => {
    setDosageAnimal('');
    setDosageMedication('');
    setDosageWeight('');
    setCalculatedDose(null);
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

          <TabsContent value="animals">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Animal Registry</CardTitle>
                  <Button
                    onClick={() => {
                      setSelectedAnimal(null);
                      setFormOpen(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Animal
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {animals.length === 0 ? (
                  <EmptyState
                    icon={Bird}
                    title="No animals yet"
                    description="Start building your animal registry by adding your first animal."
                    action={
                      <Button onClick={() => setFormOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Your First Animal
                      </Button>
                    }
                  />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Breed</TableHead>
                        <TableHead>Birth Date</TableHead>
                        <TableHead>Property</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {animals
                        .filter((animal) => 
                          selectedProperty === 'all' || animal.property_id === selectedProperty
                        )
                        .map((animal) => (
                          <TableRow key={animal.id}>
                            <TableCell className="font-medium">{animal.name}</TableCell>
                            <TableCell>{animal.type}</TableCell>
                            <TableCell>{animal.breed || '—'}</TableCell>
                            <TableCell>
                              {animal.birth_date 
                                ? format(new Date(animal.birth_date), 'MMM d, yyyy')
                                : '—'
                              }
                            </TableCell>
                            <TableCell>
                              {properties.find((p) => p.id === animal.property_id)?.name || '—'}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    setSelectedAnimal(animal);
                                    setFormOpen(true);
                                  }}
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDelete(animal.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            <AnimalForm
              open={formOpen}
              onOpenChange={(open) => {
                setFormOpen(open);
                if (!open) setSelectedAnimal(null);
              }}
              animal={selectedAnimal || undefined}
              properties={properties}
              onSubmit={handleSubmit}
            />
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left: Medication Guide */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Medication Guide</CardTitle>
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedMedication(null);
                        setMedicationFormOpen(true);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search medications..."
                      value={medicationSearch}
                      onChange={(e) => setMedicationSearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>

                  {/* Medication List */}
                  <div className="space-y-2">
                    {filteredMedications.length === 0 ? (
                      <EmptyState
                        icon={Pill}
                        title="No medications"
                        description="Add your first medication to get started."
                        className="py-8"
                      />
                    ) : (
                      filteredMedications.map((medication) => (
                        <div
                          key={medication.id}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors hover:bg-accent ${
                            selectedMedication?.id === medication.id ? 'bg-accent' : ''
                          }`}
                          onClick={() => setSelectedMedication(medication)}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm truncate">{medication.name}</h4>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {medication.target_animals.slice(0, 3).map((animal, idx) => (
                                  <Badge key={idx} variant="secondary" className="text-xs">
                                    {animal}
                                  </Badge>
                                ))}
                                {medication.target_animals.length > 3 && (
                                  <Badge variant="secondary" className="text-xs">
                                    +{medication.target_animals.length - 3}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedMedication(medication);
                                  setMedicationFormOpen(true);
                                }}
                              >
                                <Edit2 className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMedicationDelete(medication.id);
                                }}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Right: Medication Details */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Medication Details</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedMedication ? (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-2xl font-bold mb-2">{selectedMedication.name}</h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedMedication.target_animals.map((animal, idx) => (
                            <Badge key={idx} variant="secondary">
                              {animal}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="text-sm font-semibold text-muted-foreground mb-1">Dosage</h4>
                          <p className="text-lg">
                            {selectedMedication.dosage_per_lb 
                              ? `${selectedMedication.dosage_per_lb} ${selectedMedication.dosage_unit || ''} per lb`
                              : 'Not specified'
                            }
                          </p>
                        </div>

                        <div>
                          <h4 className="text-sm font-semibold text-muted-foreground mb-1">Administration Method</h4>
                          <p className="text-lg">{selectedMedication.administration_method || 'Not specified'}</p>
                        </div>

                        <div>
                          <h4 className="text-sm font-semibold text-muted-foreground mb-1">Meat Withdrawal Period</h4>
                          <p className="text-lg">
                            {selectedMedication.withdrawal_period_meat_days !== null
                              ? `${selectedMedication.withdrawal_period_meat_days} days`
                              : 'Not specified'
                            }
                          </p>
                        </div>

                        <div>
                          <h4 className="text-sm font-semibold text-muted-foreground mb-1">Milk Withdrawal Period</h4>
                          <p className="text-lg">
                            {selectedMedication.withdrawal_period_milk_days !== null
                              ? `${selectedMedication.withdrawal_period_milk_days} days`
                              : 'Not specified'
                            }
                          </p>
                        </div>
                      </div>

                      {selectedMedication.notes && (
                        <div>
                          <h4 className="text-sm font-semibold text-muted-foreground mb-1">Notes</h4>
                          <p className="text-sm whitespace-pre-wrap">{selectedMedication.notes}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <Pill className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                      <p>Select a medication to view details</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <MedicationForm
              open={medicationFormOpen}
              onOpenChange={(open) => {
                setMedicationFormOpen(open);
                if (!open) setSelectedMedication(null);
              }}
              medication={selectedMedication || undefined}
              onSubmit={handleMedicationSubmit}
            />
          </TabsContent>

          <TabsContent value="dosage">
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Dosage Calculator
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Step 1: Select Animal */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Step 1: Select Animal</label>
                  <Select value={dosageAnimal} onValueChange={setDosageAnimal}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose an animal" />
                    </SelectTrigger>
                    <SelectContent>
                      {animals.map((animal) => (
                        <SelectItem key={animal.id} value={animal.id}>
                          {animal.name} ({animal.type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Step 2: Select Medication */}
                {dosageAnimal && (
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Step 2: Select Medication</label>
                    <Select value={dosageMedication} onValueChange={setDosageMedication}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a medication" />
                      </SelectTrigger>
                      <SelectContent>
                        {dosageMedicationsFiltered.length === 0 ? (
                          <div className="p-2 text-sm text-muted-foreground text-center">
                            No medications available for this animal type
                          </div>
                        ) : (
                          dosageMedicationsFiltered.map((med) => (
                            <SelectItem key={med.id} value={med.id}>
                              {med.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    {selectedAnimalData && dosageMedicationsFiltered.length < medications.length && (
                      <p className="text-xs text-muted-foreground">
                        Filtered for {selectedAnimalData.type}
                      </p>
                    )}
                  </div>
                )}

                {/* Step 3: Enter Weight */}
                {dosageMedication && (
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">
                      Step 3: Animal Weight (lbs)
                      {selectedAnimalData?.weight_lbs && (
                        <span className="text-xs font-normal text-muted-foreground ml-2">
                          (Auto-filled from animal record)
                        </span>
                      )}
                    </label>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="Enter weight in pounds"
                      value={dosageWeight}
                      onChange={(e) => setDosageWeight(e.target.value)}
                    />
                  </div>
                )}

                {/* Calculation Result */}
                {calculatedDose !== null && selectedDosageMedication && (
                  <div className="space-y-4 pt-4 border-t">
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 text-center">
                      <p className="text-sm text-muted-foreground mb-2">Calculated Dosage</p>
                      <p className="text-4xl font-bold text-primary mb-1">
                        {formatDosage(calculatedDose, selectedDosageMedication.dosage_unit)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {selectedDosageMedication.name} for {selectedAnimalData?.name}
                      </p>
                      {selectedDosageMedication.administration_method && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Method: {selectedDosageMedication.administration_method}
                        </p>
                      )}
                    </div>

                    {/* Withdrawal Periods */}
                    {(selectedDosageMedication.withdrawal_period_meat_days !== null || 
                      selectedDosageMedication.withdrawal_period_milk_days !== null) && (
                      <div className="grid grid-cols-2 gap-4">
                        {selectedDosageMedication.withdrawal_period_meat_days !== null && (
                          <div className="text-center p-3 border rounded-lg">
                            <p className="text-xs text-muted-foreground mb-1">Meat Withdrawal</p>
                            <p className="text-lg font-semibold">
                              {selectedDosageMedication.withdrawal_period_meat_days} days
                            </p>
                          </div>
                        )}
                        {selectedDosageMedication.withdrawal_period_milk_days !== null && (
                          <div className="text-center p-3 border rounded-lg">
                            <p className="text-xs text-muted-foreground mb-1">Milk Withdrawal</p>
                            <p className="text-lg font-semibold">
                              {selectedDosageMedication.withdrawal_period_milk_days} days
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Disclaimer */}
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription className="text-xs">
                        <strong>Disclaimer:</strong> This calculator is for reference only. Always consult with a licensed veterinarian before administering any medication. Dosages may vary based on individual animal health, age, and condition. Follow all label instructions and observe proper withdrawal periods.
                      </AlertDescription>
                    </Alert>

                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={handleResetDosageCalculator}
                    >
                      Calculate Another Dosage
                    </Button>
                  </div>
                )}

                {/* Empty State */}
                {!dosageAnimal && animals.length === 0 && (
                  <EmptyState
                    icon={Calculator}
                    title="No animals yet"
                    description="Add animals to start calculating dosages."
                    className="py-8"
                  />
                )}
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
