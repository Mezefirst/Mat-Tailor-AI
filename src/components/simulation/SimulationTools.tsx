// Simulation Tools Component - Advanced Material Property Prediction Interface
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, Lightbulb, Play, Download, Share2, BarChart3 } from '@phosphor-icons/react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useKV } from '@github/spark/hooks';
import { 
  materialSimulator, 
  SimulationRequest, 
  SimulationResults, 
  SimulationConditions,
  CustomMaterialInput,
  ElementComposition 
} from '@/services/simulation';
import { MATERIALS_DATABASE, Material } from '@/data/materials';

interface SimulationToolsProps {
  selectedMaterial?: Material | null;
  onSimulationComplete?: (results: SimulationResults) => void;
}

export function SimulationTools({ selectedMaterial, onSimulationComplete }: SimulationToolsProps) {
  const [simulationHistory, setSimulationHistory] = useKV('simulation-history', []);
  const [currentSimulation, setCurrentSimulation] = useState<SimulationResults | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationType, setSimulationType] = useState<'mechanical' | 'thermal' | 'electrical' | 'chemical' | 'comprehensive'>('comprehensive');
  
  // Simulation conditions
  const [temperature, setTemperature] = useState(25);
  const [pressure, setPressure] = useState(0.1);
  const [humidity, setHumidity] = useState(50);
  const [strain, setStrain] = useState(0);
  const [frequency, setFrequency] = useState(0);
  const [environment, setEnvironment] = useState<'air' | 'vacuum' | 'seawater' | 'acidic' | 'basic'>('air');
  const [loadingType, setLoadingType] = useState<'tensile' | 'compressive' | 'shear' | 'cyclic' | 'impact'>('tensile');
  
  // Custom material creation
  const [isCustomMaterial, setIsCustomMaterial] = useState(false);
  const [customMaterialName, setCustomMaterialName] = useState('');
  const [materialStructure, setMaterialStructure] = useState<'crystalline' | 'amorphous' | 'composite' | 'layered'>('crystalline');
  const [processingMethod, setProcessingMethod] = useState<'casting' | 'forging' | 'machining' | 'additive' | 'sintering'>('casting');
  const [composition, setComposition] = useState<ElementComposition[]>([
    { element: 'Fe', percentage: 80, role: 'matrix' },
    { element: 'C', percentage: 0.5, role: 'alloying' }
  ]);
  
  const runSimulation = async () => {
    if (!selectedMaterial && !isCustomMaterial) {
      toast.error('Please select a material or create a custom material');
      return;
    }

    setIsSimulating(true);
    
    try {
      const conditions: SimulationConditions = {
        temperature,
        pressure,
        humidity: humidity > 0 ? humidity : undefined,
        strain: strain > 0 ? strain : undefined,
        frequency: frequency > 0 ? frequency : undefined,
        environment,
        loadingType
      };

      const request: SimulationRequest = {
        simulationType,
        conditions
      };

      if (isCustomMaterial) {
        request.customMaterial = {
          name: customMaterialName,
          composition: composition.filter(c => c.percentage > 0),
          structure: materialStructure,
          processingMethod
        };
      } else {
        request.materialId = selectedMaterial?.id;
      }

      const results = await materialSimulator.simulateMaterial(request);
      
      setCurrentSimulation(results);
      onSimulationComplete?.(results);
      
      // Save to history
      const historyEntry = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        materialName: isCustomMaterial ? customMaterialName : selectedMaterial?.name || 'Unknown',
        simulationType,
        conditions,
        results
      };
      
      setSimulationHistory(prev => [historyEntry, ...prev.slice(0, 9)]); // Keep last 10
      
      toast.success('Simulation completed successfully');
    } catch (error) {
      toast.error('Simulation failed: ' + (error as Error).message);
    } finally {
      setIsSimulating(false);
    }
  };

  const addCompositionElement = () => {
    setComposition(prev => [...prev, { element: 'Al', percentage: 0, role: 'alloying' }]);
  };

  const removeCompositionElement = (index: number) => {
    setComposition(prev => prev.filter((_, i) => i !== index));
  };

  const updateCompositionElement = (index: number, field: keyof ElementComposition, value: any) => {
    setComposition(prev => prev.map((comp, i) => 
      i === index ? { ...comp, [field]: value } : comp
    ));
  };

  const totalComposition = composition.reduce((sum, comp) => sum + comp.percentage, 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Material Property Simulation Tools
          </CardTitle>
          <CardDescription>
            Advanced AI-powered simulation engine for predicting material properties under various conditions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="setup" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="setup">Setup</TabsTrigger>
              <TabsTrigger value="conditions">Conditions</TabsTrigger>
              <TabsTrigger value="custom">Custom Material</TabsTrigger>
              <TabsTrigger value="results">Results</TabsTrigger>
            </TabsList>

            <TabsContent value="setup" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Material Selection</Label>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={!isCustomMaterial ? "default" : "outline"}
                      onClick={() => setIsCustomMaterial(false)}
                      size="sm"
                    >
                      Database Material
                    </Button>
                    <Button
                      variant={isCustomMaterial ? "default" : "outline"}
                      onClick={() => setIsCustomMaterial(true)}
                      size="sm"
                    >
                      Custom Material
                    </Button>
                  </div>
                  {!isCustomMaterial && selectedMaterial && (
                    <Card className="p-3 bg-muted">
                      <div className="text-sm font-medium">{selectedMaterial.name}</div>
                      <div className="text-xs text-muted-foreground">{selectedMaterial.category} • {selectedMaterial.subcategory}</div>
                    </Card>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="simulation-type">Simulation Type</Label>
                  <Select value={simulationType} onValueChange={(value: any) => setSimulationType(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select simulation type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="comprehensive">Comprehensive Analysis</SelectItem>
                      <SelectItem value="mechanical">Mechanical Properties</SelectItem>
                      <SelectItem value="thermal">Thermal Properties</SelectItem>
                      <SelectItem value="electrical">Electrical Properties</SelectItem>
                      <SelectItem value="chemical">Chemical Properties</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  {simulationType === 'comprehensive' 
                    ? 'Complete property analysis with ML-enhanced predictions'
                    : `Focused analysis of ${simulationType} properties`
                  }
                </div>
                <Button onClick={runSimulation} disabled={isSimulating} className="flex items-center gap-2">
                  <Play className="h-4 w-4" />
                  {isSimulating ? 'Simulating...' : 'Run Simulation'}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="conditions" className="space-y-4">
              <div className="mb-4">
                <h4 className="font-medium mb-2">Environmental Conditions</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Adjust temperature and pressure to see how they affect material properties in real-time.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="temperature" className="flex items-center gap-2">
                    <Thermometer className="h-4 w-4" />
                    Temperature (°C)
                  </Label>
                  <Input
                    id="temperature"
                    type="number"
                    value={temperature}
                    onChange={(e) => setTemperature(Number(e.target.value))}
                    placeholder="25"
                  />
                  <div className="text-xs text-muted-foreground">
                    Range: -273°C to 2000°C
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pressure" className="flex items-center gap-2">
                    <Lightning className="h-4 w-4" />
                    Pressure (MPa)
                  </Label>
                  <Input
                    id="pressure"
                    type="number"
                    step="0.1"
                    value={pressure}
                    onChange={(e) => setPressure(Number(e.target.value))}
                    placeholder="0.1"
                  />
                  <div className="text-xs text-muted-foreground">
                    0.1 = atmospheric, 1000+ = extreme pressure
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="humidity">Humidity (%)</Label>
                  <Input
                    id="humidity"
                    type="number"
                    value={humidity}
                    onChange={(e) => setHumidity(Number(e.target.value))}
                    placeholder="50"
                  />
                  <div className="text-xs text-muted-foreground">
                    Affects electrical and chemical properties
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="strain">Applied Strain (%)</Label>
                  <Input
                    id="strain"
                    type="number"
                    step="0.1"
                    value={strain}
                    onChange={(e) => setStrain(Number(e.target.value))}
                    placeholder="0"
                  />
                  <div className="text-xs text-muted-foreground">
                    Mechanical deformation level
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="frequency">Frequency (Hz)</Label>
                  <Input
                    id="frequency"
                    type="number"
                    value={frequency}
                    onChange={(e) => setFrequency(Number(e.target.value))}
                    placeholder="0"
                  />
                  <div className="text-xs text-muted-foreground">
                    For fatigue analysis
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Environment</Label>
                  <Select value={environment} onValueChange={(value: any) => setEnvironment(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="air">Air (Standard)</SelectItem>
                      <SelectItem value="vacuum">Vacuum</SelectItem>
                      <SelectItem value="seawater">Seawater</SelectItem>
                      <SelectItem value="acidic">Acidic</SelectItem>
                      <SelectItem value="basic">Basic/Alkaline</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Loading Type</Label>
                  <Select value={loadingType} onValueChange={(value: any) => setLoadingType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tensile">Tensile</SelectItem>
                      <SelectItem value="compressive">Compressive</SelectItem>
                      <SelectItem value="shear">Shear</SelectItem>
                      <SelectItem value="cyclic">Cyclic/Fatigue</SelectItem>
                      <SelectItem value="impact">Impact</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Alert>
                <Lightbulb className="h-4 w-4" />
                <AlertDescription>
                  <strong>Temperature & Pressure Effects:</strong> Higher temperatures generally reduce strength but may increase ductility. 
                  Pressure typically strengthens materials through compression. Extreme conditions reduce prediction confidence.
                </AlertDescription>
              </Alert>
              
              <div className="bg-muted p-4 rounded-lg">
                <h5 className="font-medium mb-2">Quick Presets</h5>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setTemperature(25);
                      setPressure(0.1);
                      setEnvironment('air');
                    }}
                  >
                    Room Conditions
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setTemperature(500);
                      setPressure(0.1);
                      setEnvironment('air');
                    }}
                  >
                    High Temperature
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setTemperature(25);
                      setPressure(100);
                      setEnvironment('air');
                    }}
                  >
                    High Pressure
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setTemperature(-50);
                      setPressure(0.1);
                      setEnvironment('air');
                    }}
                  >
                    Cryogenic
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="custom" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="custom-name">Material Name</Label>
                  <Input
                    id="custom-name"
                    value={customMaterialName}
                    onChange={(e) => setCustomMaterialName(e.target.value)}
                    placeholder="e.g., Custom Steel Alloy"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Structure Type</Label>
                  <Select value={materialStructure} onValueChange={(value: any) => setMaterialStructure(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="crystalline">Crystalline</SelectItem>
                      <SelectItem value="amorphous">Amorphous</SelectItem>
                      <SelectItem value="composite">Composite</SelectItem>
                      <SelectItem value="layered">Layered</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Processing Method</Label>
                  <Select value={processingMethod} onValueChange={(value: any) => setProcessingMethod(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="casting">Casting</SelectItem>
                      <SelectItem value="forging">Forging</SelectItem>
                      <SelectItem value="machining">Machining</SelectItem>
                      <SelectItem value="additive">Additive Manufacturing</SelectItem>
                      <SelectItem value="sintering">Sintering</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Element Composition</Label>
                  <div className="flex items-center gap-2">
                    <Badge variant={totalComposition === 100 ? "default" : "destructive"}>
                      Total: {totalComposition.toFixed(1)}%
                    </Badge>
                    <Button onClick={addCompositionElement} size="sm" variant="outline">
                      Add Element
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  {composition.map((comp, index) => (
                    <div key={index} className="grid grid-cols-4 gap-2 items-center">
                      <Select
                        value={comp.element}
                        onValueChange={(value) => updateCompositionElement(index, 'element', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Fe">Iron (Fe)</SelectItem>
                          <SelectItem value="Al">Aluminum (Al)</SelectItem>
                          <SelectItem value="Cu">Copper (Cu)</SelectItem>
                          <SelectItem value="Ti">Titanium (Ti)</SelectItem>
                          <SelectItem value="Ni">Nickel (Ni)</SelectItem>
                          <SelectItem value="Cr">Chromium (Cr)</SelectItem>
                          <SelectItem value="C">Carbon (C)</SelectItem>
                          <SelectItem value="Si">Silicon (Si)</SelectItem>
                          <SelectItem value="Mg">Magnesium (Mg)</SelectItem>
                          <SelectItem value="Zn">Zinc (Zn)</SelectItem>
                          <SelectItem value="Mn">Manganese (Mn)</SelectItem>
                          <SelectItem value="Mo">Molybdenum (Mo)</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Input
                        type="number"
                        step="0.1"
                        value={comp.percentage}
                        onChange={(e) => updateCompositionElement(index, 'percentage', Number(e.target.value))}
                        placeholder="%"
                      />
                      
                      <Select
                        value={comp.role}
                        onValueChange={(value) => updateCompositionElement(index, 'role', value as any)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="matrix">Matrix</SelectItem>
                          <SelectItem value="alloying">Alloying</SelectItem>
                          <SelectItem value="reinforcement">Reinforcement</SelectItem>
                          <SelectItem value="additive">Additive</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeCompositionElement(index)}
                        disabled={composition.length <= 1}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>

                {totalComposition !== 100 && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Composition should total 100%. Current total: {totalComposition.toFixed(1)}%
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </TabsContent>

            <TabsContent value="results" className="space-y-4">
              {isSimulating && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Running simulation...</span>
                        <span className="text-sm text-muted-foreground">This may take a few moments</span>
                      </div>
                      <Progress value={75} className="w-full" />
                    </div>
                  </CardContent>
                </Card>
              )}

              {currentSimulation && (
                <SimulationResultsDisplay results={currentSimulation} />
              )}

              {!currentSimulation && !isSimulating && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center text-muted-foreground">
                      <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No simulation results yet. Run a simulation to see detailed property predictions.</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {simulationHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Simulation History</CardTitle>
            <CardDescription>Previous simulation results</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {simulationHistory.slice(0, 5).map((entry: any) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50"
                  onClick={() => setCurrentSimulation(entry.results)}
                >
                  <div>
                    <div className="font-medium">{entry.materialName}</div>
                    <div className="text-sm text-muted-foreground">
                      {entry.simulationType} • {new Date(entry.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                  <Badge variant="outline">
                    {(entry.results.confidence * 100).toFixed(0)}% confidence
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Results display component
function SimulationResultsDisplay({ results }: { results: SimulationResults }) {
  const exportResults = () => {
    const data = JSON.stringify(results, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'simulation-results.json';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Results exported successfully');
  };

  const shareResults = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Material Simulation Results',
          text: `Confidence: ${(results.confidence * 100).toFixed(1)}%`,
          url: window.location.href
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Results link copied to clipboard');
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Simulation Results</CardTitle>
              <CardDescription>
                AI-predicted material properties with confidence intervals
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="text-base px-3 py-1">
                {(results.confidence * 100).toFixed(1)}% Confidence
              </Badge>
              <Button variant="outline" size="sm" onClick={exportResults}>
                <Download className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={shareResults}>
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="mechanical" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="mechanical">Mechanical</TabsTrigger>
              <TabsTrigger value="thermal">Thermal</TabsTrigger>
              <TabsTrigger value="electrical">Electrical</TabsTrigger>
              <TabsTrigger value="chemical">Chemical</TabsTrigger>
            </TabsList>

            {results.predictedProperties.mechanical && (
              <TabsContent value="mechanical" className="space-y-4">
                <PropertySection
                  title="Mechanical Properties"
                  properties={results.predictedProperties.mechanical}
                  uncertainties={results.uncertaintyBands.mechanical}
                  units={{
                    tensileStrength: 'MPa',
                    yieldStrength: 'MPa',
                    elasticModulus: 'GPa',
                    hardness: 'HV',
                    ductility: '%',
                    toughness: 'MJ/m³',
                    creepRate: '/year',
                    fatigueLife: 'cycles'
                  }}
                />
              </TabsContent>
            )}

            {results.predictedProperties.thermal && (
              <TabsContent value="thermal" className="space-y-4">
                <PropertySection
                  title="Thermal Properties"
                  properties={results.predictedProperties.thermal}
                  uncertainties={results.uncertaintyBands.thermal}
                  units={{
                    thermalConductivity: 'W/m·K',
                    thermalExpansion: '10⁻⁶/K',
                    specificHeat: 'J/kg·K',
                    thermalDiffusivity: 'm²/s',
                    thermalShock: 'W/m',
                    thermalStress: 'MPa'
                  }}
                />
              </TabsContent>
            )}

            {results.predictedProperties.electrical && (
              <TabsContent value="electrical" className="space-y-4">
                <PropertySection
                  title="Electrical Properties"
                  properties={results.predictedProperties.electrical}
                  uncertainties={results.uncertaintyBands.electrical}
                  units={{
                    resistivity: 'Ω·m',
                    conductivity: 'S/m',
                    dielectricStrength: 'kV/mm',
                    dielectricConstant: '',
                    bandGap: 'eV'
                  }}
                />
              </TabsContent>
            )}

            {results.predictedProperties.chemical && (
              <TabsContent value="chemical" className="space-y-4">
                <PropertySection
                  title="Chemical Properties"
                  properties={results.predictedProperties.chemical}
                  uncertainties={results.uncertaintyBands.chemical}
                  units={{
                    corrosionRate: 'mm/year',
                    oxidationResistance: 'index',
                    chemicalStability: 'index',
                    phStability: 'pH range'
                  }}
                />
              </TabsContent>
            )}
          </Tabs>
        </CardContent>
      </Card>

      {(results.recommendations.length > 0 || results.warnings.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>AI Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {results.recommendations.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-blue-500" />
                  <span className="font-medium">Recommendations</span>
                </div>
                <ul className="space-y-1 ml-6">
                  {results.recommendations.map((rec, index) => (
                    <li key={index} className="text-sm text-muted-foreground">• {rec}</li>
                  ))}
                </ul>
              </div>
            )}

            {results.warnings.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <span className="font-medium">Warnings</span>
                </div>
                <ul className="space-y-1 ml-6">
                  {results.warnings.map((warning, index) => (
                    <li key={index} className="text-sm text-muted-foreground">• {warning}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Property section component
function PropertySection({ 
  title, 
  properties, 
  uncertainties, 
  units 
}: { 
  title: string;
  properties: any;
  uncertainties?: any;
  units: { [key: string]: string };
}) {
  return (
    <div className="space-y-3">
      <h4 className="font-medium">{title}</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(properties).map(([key, value]) => {
          if (value === undefined || value === null) return null;
          
          const uncertainty = uncertainties?.[key];
          const unit = units[key] || '';
          
          return (
            <div key={key} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                <span className="text-sm text-muted-foreground">{unit}</span>
              </div>
              <div className="text-lg font-semibold">
                {typeof value === 'number' ? value.toFixed(2) : JSON.stringify(value)}
              </div>
              {uncertainty && (
                <div className="text-xs text-muted-foreground">
                  Range: {uncertainty.min.toFixed(2)} - {uncertainty.max.toFixed(2)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
