import { useState, useEffect } from 'react';
import { ArrowLeft, Search, CalendarIcon } from 'lucide-react';
import { getCropOptions, CropOption } from '@/features/crops/cropsApi';
import { PlantingCalendar } from '@/features/crops/PlantingCalendar';
import { 
  getRotationPlans, 
  createRotationPlan, 
  updateRotationPlan, 
  deleteRotationPlan,
  type RotationPlan 
} from '@/features/crops/rotationApi';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { EmptyState } from '@/components/ui/EmptyState';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { awardXP } from '@/game/gameEngine';

interface Crop {
  id: string;
  name: string;
  category: string;
  sunRequirement: string;
  waterRequirement: string;
  daysToMaturity: number;
  description?: string;
  plantingDepth?: string;
  spacing?: string;
  companions?: string[];
  zones?: string;
}

// Mock crop data
const mockCrops: Crop[] = [
  {
    id: '1',
    name: 'Tomato',
    category: 'Vegetables',
    sunRequirement: 'Full Sun',
    waterRequirement: 'Moderate',
    daysToMaturity: 75,
    description: 'Classic garden vegetable, great for fresh eating and preserving.',
    plantingDepth: '1/4 inch',
    spacing: '24-36 inches',
    companions: ['Basil', 'Carrots', 'Onions'],
    zones: '3-10',
  },
  {
    id: '2',
    name: 'Lettuce',
    category: 'Vegetables',
    sunRequirement: 'Partial Shade',
    waterRequirement: 'High',
    daysToMaturity: 45,
    description: 'Quick-growing salad green, perfect for succession planting.',
    plantingDepth: '1/4 inch',
    spacing: '6-12 inches',
    companions: ['Carrots', 'Radishes', 'Strawberries'],
    zones: '4-9',
  },
  {
    id: '3',
    name: 'Basil',
    category: 'Herbs',
    sunRequirement: 'Full Sun',
    waterRequirement: 'Moderate',
    daysToMaturity: 60,
    description: 'Aromatic herb, excellent companion plant for tomatoes.',
    plantingDepth: '1/4 inch',
    spacing: '12 inches',
    companions: ['Tomatoes', 'Peppers'],
    zones: '4-10',
  },
  {
    id: '4',
    name: 'Carrot',
    category: 'Vegetables',
    sunRequirement: 'Full Sun',
    waterRequirement: 'Moderate',
    daysToMaturity: 70,
    description: 'Root vegetable that stores well and grows best in loose soil.',
    plantingDepth: '1/4 inch',
    spacing: '3 inches',
    companions: ['Onions', 'Lettuce', 'Tomatoes'],
    zones: '3-10',
  },
  {
    id: '5',
    name: 'Cucumber',
    category: 'Vegetables',
    sunRequirement: 'Full Sun',
    waterRequirement: 'High',
    daysToMaturity: 55,
    description: 'Vining plant that produces refreshing fruits throughout summer.',
    plantingDepth: '1 inch',
    spacing: '36 inches',
    companions: ['Beans', 'Corn', 'Radishes'],
    zones: '4-11',
  },
  {
    id: '6',
    name: 'Strawberry',
    category: 'Fruits',
    sunRequirement: 'Full Sun',
    waterRequirement: 'Moderate',
    daysToMaturity: 120,
    description: 'Perennial fruit that produces sweet berries year after year.',
    plantingDepth: 'Crown level',
    spacing: '12 inches',
    companions: ['Lettuce', 'Spinach', 'Beans'],
    zones: '4-9',
  },
  {
    id: '7',
    name: 'Pepper',
    category: 'Vegetables',
    sunRequirement: 'Full Sun',
    waterRequirement: 'Moderate',
    daysToMaturity: 80,
    description: 'Heat-loving plant that produces sweet or hot peppers.',
    plantingDepth: '1/4 inch',
    spacing: '18-24 inches',
    companions: ['Basil', 'Onions', 'Tomatoes'],
    zones: '3-11',
  },
  {
    id: '8',
    name: 'Cilantro',
    category: 'Herbs',
    sunRequirement: 'Partial Shade',
    waterRequirement: 'Moderate',
    daysToMaturity: 45,
    description: 'Fast-growing herb used in many cuisines worldwide.',
    plantingDepth: '1/4 inch',
    spacing: '6 inches',
    companions: ['Tomatoes', 'Peppers', 'Beans'],
    zones: '3-11',
  },
];

const categories = ['All', 'Vegetables', 'Herbs', 'Fruits'];

const CropPlanner = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null);
  
  // Rotation Plan form state
  const [rotationPlans, setRotationPlans] = useState<RotationPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [planName, setPlanName] = useState('');
  const [plotName, setPlotName] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [season, setSeason] = useState('');
  const [selectedCropForPlan, setSelectedCropForPlan] = useState('');
  const [plantDate, setPlantDate] = useState<Date | undefined>();
  const [harvestDate, setHarvestDate] = useState<Date | undefined>();
  const [notes, setNotes] = useState('');
  
  // Crop options for rotation form (fetched from DB or fallback)
  const [cropOptions, setCropOptions] = useState<CropOption[]>([]);

  // Load crop options and rotation plans on mount
  useEffect(() => {
    const loadCropOptions = async () => {
      const options = await getCropOptions();
      setCropOptions(options);
    };
    loadCropOptions();
  }, []);

  useEffect(() => {
    if (user?.id) {
      loadRotationPlans();
    }
  }, [user?.id]);

  const loadRotationPlans = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const plans = await getRotationPlans(user.id);
      setRotationPlans(plans);
    } catch (error) {
      console.error('Failed to load rotation plans:', error);
      toast.error('Failed to load rotation plans');
    } finally {
      setLoading(false);
    }
  };

  const filteredCrops = mockCrops.filter((crop) => {
    const matchesSearch = crop.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || crop.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getSunColor = (requirement: string) => {
    if (requirement === 'Full Sun') return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400';
    if (requirement === 'Partial Shade') return 'bg-orange-500/10 text-orange-700 dark:text-orange-400';
    return 'bg-blue-500/10 text-blue-700 dark:text-blue-400';
  };

  const getWaterColor = (requirement: string) => {
    if (requirement === 'High') return 'bg-blue-600/10 text-blue-700 dark:text-blue-400';
    if (requirement === 'Moderate') return 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400';
    return 'bg-gray-500/10 text-gray-700 dark:text-gray-400';
  };

  const handleSaveRotation = async () => {
    if (!user?.id) {
      toast.error('You must be logged in to save rotation plans');
      return;
    }

    if (!planName || !plotName || !season || !selectedCropForPlan) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSaving(true);
      const newPlan = await createRotationPlan({
        name: planName,
        plot_name: plotName,
        year,
        season,
        crop_name: selectedCropForPlan,
        plant_date: plantDate ? format(plantDate, 'yyyy-MM-dd') : null,
        harvest_date: harvestDate ? format(harvestDate, 'yyyy-MM-dd') : null,
        notes: notes || null,
      });

      // Award XP for crop rotation creation
      awardXP('crop_rotation_created', 15, { planId: newPlan.id }).catch((err) => {
        console.error('[CropPlanner] Failed to award XP:', err);
      });

      toast.success('Rotation plan created successfully');
      await loadRotationPlans();
      
      // Reset form
      setPlanName('');
      setPlotName('');
      setYear(new Date().getFullYear());
      setSeason('');
      setSelectedCropForPlan('');
      setPlantDate(undefined);
      setHarvestDate(undefined);
      setNotes('');
    } catch (error) {
      console.error('[CropPlanner] Failed to save rotation plan:', error);
      toast.error('Failed to save rotation plan');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelRotation = () => {
    setPlanName('');
    setPlotName('');
    setYear(new Date().getFullYear());
    setSeason('');
    setSelectedCropForPlan('');
    setPlantDate(undefined);
    setHarvestDate(undefined);
    setNotes('');
  };

  const handleDeleteRotation = async (id: string) => {
    if (!confirm('Are you sure you want to delete this rotation plan?')) return;

    try {
      await deleteRotationPlan(id);
      toast.success('Rotation plan deleted successfully');
      await loadRotationPlans();
    } catch (error) {
      console.error('[CropPlanner] Failed to delete rotation plan:', error);
      toast.error('Failed to delete rotation plan');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/dashboard">
          <button className="p-2 hover:bg-accent rounded-lg transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Crop Planner</h1>
          <p className="text-muted-foreground">Plan your crops, rotations, and planting schedule.</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="database" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="database">Crop Database</TabsTrigger>
          <TabsTrigger value="rotation">Rotation Plans</TabsTrigger>
          <TabsTrigger value="calendar">Planting Calendar</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        {/* Crop Database Tab */}
        <TabsContent value="database" className="space-y-4">
          <div className="grid lg:grid-cols-[1fr,400px] gap-6">
            {/* Left Side - Search & Crop List */}
            <div className="space-y-4">
              {/* Search & Filter */}
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search crops..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Crop Grid */}
              <div className="grid md:grid-cols-2 gap-4">
                {filteredCrops.map((crop) => (
                  <Card
                    key={crop.id}
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      selectedCrop?.id === crop.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedCrop(crop)}
                  >
                    <CardHeader>
                      <CardTitle className="text-lg">{crop.name}</CardTitle>
                      <Badge variant="outline" className="w-fit">
                        {crop.category}
                      </Badge>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Sun:</span>
                        <Badge className={getSunColor(crop.sunRequirement)}>
                          {crop.sunRequirement}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Water:</span>
                        <Badge className={getWaterColor(crop.waterRequirement)}>
                          {crop.waterRequirement}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Days to maturity:</span>
                        <span className="font-semibold">{crop.daysToMaturity} days</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Right Side - Crop Details */}
            <Card className="h-fit lg:sticky lg:top-6">
              <CardHeader>
                <CardTitle>Crop Details</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedCrop ? (
                  <ScrollArea className="h-[600px] pr-4">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-2xl font-bold mb-2">{selectedCrop.name}</h3>
                        <Badge variant="outline">{selectedCrop.category}</Badge>
                      </div>

                      {selectedCrop.description && (
                        <div>
                          <h4 className="font-semibold mb-1">Description</h4>
                          <p className="text-sm text-muted-foreground">{selectedCrop.description}</p>
                        </div>
                      )}

                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Sun Requirement:</span>
                          <Badge className={getSunColor(selectedCrop.sunRequirement)}>
                            {selectedCrop.sunRequirement}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Water Requirement:</span>
                          <Badge className={getWaterColor(selectedCrop.waterRequirement)}>
                            {selectedCrop.waterRequirement}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Days to Maturity:</span>
                          <span className="font-semibold">{selectedCrop.daysToMaturity} days</span>
                        </div>
                      </div>

                      {selectedCrop.plantingDepth && (
                        <div>
                          <h4 className="font-semibold mb-1">Planting Depth</h4>
                          <p className="text-sm text-muted-foreground">{selectedCrop.plantingDepth}</p>
                        </div>
                      )}

                      {selectedCrop.spacing && (
                        <div>
                          <h4 className="font-semibold mb-1">Spacing</h4>
                          <p className="text-sm text-muted-foreground">{selectedCrop.spacing}</p>
                        </div>
                      )}

                      {selectedCrop.zones && (
                        <div>
                          <h4 className="font-semibold mb-1">Hardiness Zones</h4>
                          <p className="text-sm text-muted-foreground">{selectedCrop.zones}</p>
                        </div>
                      )}

                      {selectedCrop.companions && selectedCrop.companions.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-2">Companion Plants</h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedCrop.companions.map((companion) => (
                              <Badge key={companion} variant="secondary">
                                {companion}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="h-[400px] flex items-center justify-center">
                    <p className="text-muted-foreground text-center">
                      Select a crop to view details
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Rotation Plans Tab */}
        <TabsContent value="rotation" className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Crop Rotation Plans</h2>
            
            {/* New Rotation Plan Form */}
            <Card>
              <CardHeader>
                <CardTitle>New Rotation Plan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="planName">Plan Name *</Label>
                    <Input
                      id="planName"
                      value={planName}
                      onChange={(e) => setPlanName(e.target.value)}
                      placeholder="e.g., Spring Garden 2024"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="plotName">Plot/Area Name *</Label>
                    <Input
                      id="plotName"
                      value={plotName}
                      onChange={(e) => setPlotName(e.target.value)}
                      placeholder="e.g., North Field"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="year">Year</Label>
                    <Input
                      id="year"
                      type="number"
                      value={year}
                      onChange={(e) => setYear(parseInt(e.target.value))}
                      min={2020}
                      max={2050}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="season">Season *</Label>
                    <Select value={season} onValueChange={setSeason}>
                      <SelectTrigger id="season">
                        <SelectValue placeholder="Select season" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Spring">Spring</SelectItem>
                        <SelectItem value="Summer">Summer</SelectItem>
                        <SelectItem value="Fall">Fall</SelectItem>
                        <SelectItem value="Winter">Winter</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="crop">Crop *</Label>
                    <Select value={selectedCropForPlan} onValueChange={setSelectedCropForPlan}>
                      <SelectTrigger id="crop">
                        <SelectValue placeholder="Select crop" />
                      </SelectTrigger>
                      <SelectContent className="bg-background z-50">
                        {cropOptions.map((crop) => (
                          <SelectItem key={crop.id} value={crop.name}>
                            {crop.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Plant Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !plantDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {plantDate ? format(plantDate, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={plantDate}
                          onSelect={setPlantDate}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label>Expected Harvest Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !harvestDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {harvestDate ? format(harvestDate, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={harvestDate}
                          onSelect={setHarvestDate}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any additional notes about this rotation plan..."
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={handleCancelRotation} disabled={saving}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSaveRotation}
                    disabled={saving || !planName || !plotName || !season || !selectedCropForPlan}
                  >
                    {saving ? 'Saving...' : 'Save Rotation'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Your Rotation Plans */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Your Rotation Plans</CardTitle>
              </CardHeader>
              <CardContent>
                {rotationPlans.length === 0 ? (
                  <EmptyState
                    title="No rotation plans yet"
                    description="Create your first rotation plan to start managing your crop cycles."
                  />
                ) : (
                  <div className="space-y-4">
                    {rotationPlans.map((plan) => (
                      <Card key={plan.id} className="border-l-4 border-l-primary">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-lg">{plan.name}</CardTitle>
                              <p className="text-sm text-muted-foreground mt-1">
                                {plan.plot_name} • {plan.season} {plan.year}
                              </p>
                            </div>
                            <Badge variant="outline">{plan.crop_name}</Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            {plan.plant_date && (
                              <div>
                                <span className="text-muted-foreground">Plant Date:</span>
                                <p className="font-medium">{format(new Date(plan.plant_date), "PP")}</p>
                              </div>
                            )}
                            {plan.harvest_date && (
                              <div>
                                <span className="text-muted-foreground">Harvest Date:</span>
                                <p className="font-medium">{format(new Date(plan.harvest_date), "PP")}</p>
                              </div>
                            )}
                          </div>
                          {plan.notes && (
                            <div className="pt-2">
                              <span className="text-sm text-muted-foreground">Notes:</span>
                              <p className="text-sm mt-1">{plan.notes}</p>
                            </div>
                          )}
                          <div className="pt-2 flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteRotation(plan.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Planting Calendar Tab */}
        <TabsContent value="calendar" className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Planting Calendar</h2>
            
            {/* Filters */}
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="calendarSeason">Filter by Season</Label>
                    <Select defaultValue="all">
                      <SelectTrigger id="calendarSeason">
                        <SelectValue placeholder="All seasons" />
                      </SelectTrigger>
                      <SelectContent className="bg-background z-50">
                        <SelectItem value="all">All Seasons</SelectItem>
                        <SelectItem value="Spring">Spring</SelectItem>
                        <SelectItem value="Summer">Summer</SelectItem>
                        <SelectItem value="Fall">Fall</SelectItem>
                        <SelectItem value="Winter">Winter</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="calendarProperty">Filter by Property</Label>
                    <Select defaultValue="all">
                      <SelectTrigger id="calendarProperty">
                        <SelectValue placeholder="All properties" />
                      </SelectTrigger>
                      <SelectContent className="bg-background z-50">
                        <SelectItem value="all">All Properties</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Calendar */}
            {rotationPlans.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <EmptyState
                    title="No rotation plans to display"
                    description="Create rotation plans with planting dates to see them on the calendar."
                  />
                </CardContent>
              </Card>
            ) : (
              <PlantingCalendar plans={rotationPlans} />
            )}
          </div>
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations">
          <Card>
            <CardHeader>
              <CardTitle>Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Get personalized crop recommendations based on your climate, soil, and preferences.
                This feature is coming soon!
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CropPlanner;
