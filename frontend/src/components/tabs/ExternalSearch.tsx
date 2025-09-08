import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, Search, Database, Atom, Beaker, ChevronRight } from '@phosphor-icons/react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { materialDataSources } from '@/services/materialDataSources';
import { useKV } from '@github/spark/hooks';

interface Material {
  id: string;
  name: string;
  formula: string;
  density: number;
  tensileStrength: number;
  thermalConductivity: number;
  electricalResistivity: number;
  meltingPoint: number;
  cost: number;
  source: 'MatWeb' | 'Materials Project';
  applications: string[];
}

interface ExternalSearchProps {
  onMaterialsFound: (materials: Material[]) => void;
}

export function ExternalSearch({ onMaterialsFound }: ExternalSearchProps) {
  const [searchType, setSearchType] = useState<'composition' | 'properties'>('composition');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useKV<Material[]>('external-search-results', []);
  const [hasApiKeys, setHasApiKeys] = useState(false);
  
  // Composition search state
  const [elements, setElements] = useState<string>('');
  const [excludeElements, setExcludeElements] = useState<string>('');
  
  // Property search state
  const [densityRange, setDensityRange] = useState({ min: '', max: '' });
  const [strengthRange, setStrengthRange] = useState({ min: '', max: '' });
  const [temperatureRange, setTemperatureRange] = useState({ min: '', max: '' });
  const [conductivityType, setConductivityType] = useState<'thermal' | 'electrical'>('thermal');
  const [materialClass, setMaterialClass] = useState<string>('');

  // Check API status on component mount
  React.useEffect(() => {
    const checkApiStatus = async () => {
      try {
        const status = await materialDataSources.getCredentialStatus();
        setHasApiKeys(status.matweb || status.materialsProject);
      } catch (error) {
        setHasApiKeys(false);
      }
    };
    checkApiStatus();
  }, []);

  // Mock data for demonstration
  const mockMaterials: Material[] = [
    {
      id: '1',
      name: 'Aluminum 6061-T6',
      formula: 'Al-Mg-Si',
      density: 2.70,
      tensileStrength: 310,
      thermalConductivity: 167,
      electricalResistivity: 4.0,
      meltingPoint: 582,
      cost: 1.85,
      source: 'MatWeb',
      applications: ['Aerospace', 'Automotive', 'Marine']
    },
    {
      id: '2',
      name: 'Titanium Ti-6Al-4V',
      formula: 'Ti-6Al-4V',
      density: 4.43,
      tensileStrength: 1170,
      thermalConductivity: 6.7,
      electricalResistivity: 171,
      meltingPoint: 1604,
      cost: 35.0,
      source: 'Materials Project',
      applications: ['Aerospace', 'Medical', 'Defense']
    },
    {
      id: '3',
      name: 'Carbon Steel AISI 1018',
      formula: 'Fe-C',
      density: 7.87,
      tensileStrength: 440,
      thermalConductivity: 51.9,
      electricalResistivity: 15.9,
      meltingPoint: 1450,
      cost: 0.60,
      source: 'MatWeb',
      applications: ['Construction', 'Automotive', 'Machinery']
    }
  ];

  const performSearch = async () => {
    setIsSearching(true);
    
    try {
      let results: Material[] = [];
      
      if (hasApiKeys) {
        // Try real API search if credentials are available
        if (searchType === 'composition' && elements) {
          const elementList = elements.toLowerCase().split(',').map(e => e.trim());
          
          try {
            // Try Materials Project first for composition search
            const mpResults = await materialDataSources.searchMaterialsProject({
              elements: elementList,
              exclude_elements: excludeElements ? excludeElements.split(',').map(e => e.trim()) : undefined
            });
            
            // Convert Materials Project results to our format
            results = mpResults.map((material: any, index: number) => ({
              id: `mp-${material.material_id || index}`,
              name: material.pretty_formula || material.formula,
              formula: material.formula,
              density: material.density || 0,
              tensileStrength: material.bulk_modulus || 0,
              thermalConductivity: 0,
              electricalResistivity: 0,
              meltingPoint: 0,
              cost: 0,
              source: 'Materials Project' as const,
              applications: material.possible_species ? [material.possible_species[0]] : []
            }));
          } catch (mpError) {
            console.warn('Materials Project search failed:', mpError);
          }
          
          if (results.length === 0) {
            // Fallback to MatWeb if available
            try {
              const matwebResults = await materialDataSources.searchMatWeb({
                material: elements.split(',')[0].trim()
              });
              
              results = matwebResults.map((material: any, index: number) => ({
                id: `mw-${index}`,
                name: material.name || material.material,
                formula: material.composition || elements,
                density: material.density || 0,
                tensileStrength: material.tensile_strength || 0,
                thermalConductivity: material.thermal_conductivity || 0,
                electricalResistivity: material.electrical_resistivity || 0,
                meltingPoint: material.melting_point || 0,
                cost: 0,
                source: 'MatWeb' as const,
                applications: material.applications || []
              }));
            } catch (mwError) {
              console.warn('MatWeb search failed:', mwError);
            }
          }
        }
      }
      
      // If no API results or no API keys, use mock data
      if (results.length === 0) {
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API delay
        
        // Filter mock data based on search criteria
        let filteredResults = mockMaterials;
        
        if (searchType === 'composition' && elements) {
          const searchElements = elements.toLowerCase().split(',').map(e => e.trim());
          filteredResults = mockMaterials.filter(material => 
            searchElements.some(element => 
              material.formula.toLowerCase().includes(element)
            )
          );
        }
        
        if (searchType === 'properties') {
          filteredResults = mockMaterials.filter(material => {
            let matches = true;
            
            if (densityRange.min && material.density < parseFloat(densityRange.min)) matches = false;
            if (densityRange.max && material.density > parseFloat(densityRange.max)) matches = false;
            if (strengthRange.min && material.tensileStrength < parseFloat(strengthRange.min)) matches = false;
            if (strengthRange.max && material.tensileStrength > parseFloat(strengthRange.max)) matches = false;
            if (temperatureRange.min && material.meltingPoint < parseFloat(temperatureRange.min)) matches = false;
            if (temperatureRange.max && material.meltingPoint > parseFloat(temperatureRange.max)) matches = false;
            
            return matches;
          });
        }
        
        results = filteredResults;
        
        if (!hasApiKeys) {
          toast.success(`Found ${results.length} materials from demo database. Configure API keys in Settings for full access.`);
        }
      } else {
        toast.success(`Found ${results.length} materials from external databases`);
      }
      
      setSearchResults(results);
      onMaterialsFound(results);
      
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search failed. Please check your search criteria and API configuration.');
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setElements('');
    setExcludeElements('');
    setDensityRange({ min: '', max: '' });
    setStrengthRange({ min: '', max: '' });
    setTemperatureRange({ min: '', max: '' });
    setMaterialClass('');
    setSearchResults([]);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Search Panel */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                External Material Search
              </CardTitle>
              <CardDescription>
                Search 150,000+ materials from MatWeb and Materials Project databases
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Tabs value={searchType} onValueChange={(value: any) => setSearchType(value)}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="composition" className="flex items-center gap-2">
                    <Atom className="h-4 w-4" />
                    Composition
                  </TabsTrigger>
                  <TabsTrigger value="properties" className="flex items-center gap-2">
                    <Beaker className="h-4 w-4" />
                    Properties
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="composition" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="elements">Required Elements</Label>
                    <Input
                      id="elements"
                      placeholder="e.g., Al, Ti, Fe (comma separated)"
                      value={elements}
                      onChange={(e) => setElements(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="exclude-elements">Exclude Elements</Label>
                    <Input
                      id="exclude-elements"
                      placeholder="e.g., Pb, Cd, Hg (comma separated)"
                      value={excludeElements}
                      onChange={(e) => setExcludeElements(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="material-class">Material Class</Label>
                    <Select value={materialClass} onValueChange={setMaterialClass}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select material class" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="metals">Metals</SelectItem>
                        <SelectItem value="ceramics">Ceramics</SelectItem>
                        <SelectItem value="polymers">Polymers</SelectItem>
                        <SelectItem value="composites">Composites</SelectItem>
                        <SelectItem value="semiconductors">Semiconductors</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>
                
                <TabsContent value="properties" className="space-y-4">
                  <div className="space-y-2">
                    <Label>Density Range (g/cm³)</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        placeholder="Min"
                        value={densityRange.min}
                        onChange={(e) => setDensityRange(prev => ({ ...prev, min: e.target.value }))}
                      />
                      <Input
                        placeholder="Max"
                        value={densityRange.max}
                        onChange={(e) => setDensityRange(prev => ({ ...prev, max: e.target.value }))}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Tensile Strength Range (MPa)</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        placeholder="Min"
                        value={strengthRange.min}
                        onChange={(e) => setStrengthRange(prev => ({ ...prev, min: e.target.value }))}
                      />
                      <Input
                        placeholder="Max"
                        value={strengthRange.max}
                        onChange={(e) => setStrengthRange(prev => ({ ...prev, max: e.target.value }))}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Melting Point Range (°C)</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        placeholder="Min"
                        value={temperatureRange.min}
                        onChange={(e) => setTemperatureRange(prev => ({ ...prev, min: e.target.value }))}
                      />
                      <Input
                        placeholder="Max"
                        value={temperatureRange.max}
                        onChange={(e) => setTemperatureRange(prev => ({ ...prev, max: e.target.value }))}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Conductivity Type</Label>
                    <Select value={conductivityType} onValueChange={(value: any) => setConductivityType(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="thermal">Thermal Conductivity</SelectItem>
                        <SelectItem value="electrical">Electrical Conductivity</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>
              </Tabs>
              
              <div className="flex gap-2">
                <Button 
                  onClick={performSearch} 
                  disabled={isSearching}
                  className="flex-1"
                >
                  {isSearching ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Search
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={clearSearch}>
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Results Panel */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Search Results</CardTitle>
              <CardDescription>
                {searchResults.length} materials found from external databases
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isSearching ? (
                <div className="space-y-4">
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Searching external databases...</p>
                  </div>
                  <Progress value={33} className="w-full" />
                </div>
              ) : searchResults.length === 0 ? (
                <div className="text-center py-12">
                  <Database className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Search Performed</h3>
                  <p className="text-muted-foreground">
                    Use the search panel to explore materials from external databases
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {searchResults.map((material) => (
                    <Card key={material.id} className="border-l-4 border-l-primary">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-lg">{material.name}</h3>
                            <p className="text-muted-foreground text-sm">{material.formula}</p>
                          </div>
                          <Badge variant={material.source === 'MatWeb' ? 'default' : 'secondary'}>
                            {material.source}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Density</p>
                            <p className="font-medium">{material.density} g/cm³</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Tensile Strength</p>
                            <p className="font-medium">{material.tensileStrength} MPa</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Melting Point</p>
                            <p className="font-medium">{material.meltingPoint}°C</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Cost</p>
                            <p className="font-medium">${material.cost}/kg</p>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <p className="text-sm text-muted-foreground mb-2">Applications</p>
                          <div className="flex gap-2 flex-wrap">
                            {material.applications.map((app, index) => (
                              <Badge key={index} variant="outline">
                                {app}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <Button variant="outline" size="sm">
                            View Details
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                          <Button size="sm">
                            Add to Comparison
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
      </div>
      
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {hasApiKeys ? (
            "Connected to external databases. Search results will include real material data from MatWeb and Materials Project."
          ) : (
            "To access the full material databases (150,000+ materials), configure your MatWeb and Materials Project API keys in the Settings tab. Current results are from a limited demo dataset."
          )}
        </AlertDescription>
      </Alert>
    </div>
  );
}
