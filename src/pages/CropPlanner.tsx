import { useState } from 'react';
import { ArrowLeft, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null);

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
        <TabsContent value="rotation">
          <Card>
            <CardHeader>
              <CardTitle>Rotation Plans</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Plan your crop rotation schedules to maintain soil health and prevent disease.
                This feature is coming soon!
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Planting Calendar Tab */}
        <TabsContent value="calendar">
          <Card>
            <CardHeader>
              <CardTitle>Planting Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                View optimal planting times based on your location and frost dates.
                This feature is coming soon!
              </p>
            </CardContent>
          </Card>
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
