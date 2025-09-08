import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TestTube, Atom, Lightning, FlaskConical, Table, Plus, Trash, PieChart } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { Material } from '@/data/materials';
import { PeriodicTable, Element } from '@/components/periodic/PeriodicTable';
import { CompositionChart } from '@/components/charts/CompositionChart';
import { RealTimeProperties } from '@/components/prediction/RealTimeProperties';
import { AdvancedPropertyPrediction } from '@/components/prediction/AdvancedPropertyPrediction';
import { usePropertyPrediction } from '@/hooks/usePropertyPrediction';
import { useTranslation } from '@/lib/i18n';

interface NewMaterialProps {
  onMaterialCreated: (material: Material) => void;
}

export function NewMaterial({ onMaterialCreated }: NewMaterialProps) {
  const { t } = useTranslation();
  const [materialName, setMaterialName] = useState('');
  const [selectedElements, setSelectedElements] = useState<Array<{element: Element, percentage: number}>>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResults, setSimulationResults] = useState<any>(null);

  // Real-time property prediction
  const { prediction, isCalculating } = usePropertyPrediction(selectedElements, 500);

  const addElement = (element: Element) => {
    if (selectedElements.find(e => e.element.symbol === element.symbol)) {
      toast.error(t.common.error, {
        description: `${element.symbol} already added`
      });
      return;
    }
    
    const currentTotal = selectedElements.reduce((sum, e) => sum + e.percentage, 0);
    let defaultPercentage = Math.min(20, 100 - currentTotal);
    
    // Intelligent default percentages based on element type and common alloys
    const intelligentDefaults = {
      'Fe': Math.min(70, 100 - currentTotal), // Iron as major component
      'Al': Math.min(60, 100 - currentTotal), // Aluminum as major component
      'Cu': Math.min(50, 100 - currentTotal), // Copper as major component
      'Ti': Math.min(40, 100 - currentTotal), // Titanium as major component
      'C': Math.min(2, 100 - currentTotal),   // Carbon as minor alloying element
      'Cr': Math.min(18, 100 - currentTotal), // Chromium for stainless steel
      'Ni': Math.min(8, 100 - currentTotal),  // Nickel for stainless steel
      'Mn': Math.min(2, 100 - currentTotal),  // Manganese as minor element
      'Si': Math.min(1, 100 - currentTotal),  // Silicon as minor element
      'Mo': Math.min(4, 100 - currentTotal),  // Molybdenum for high-strength steels
      'V': Math.min(1, 100 - currentTotal),   // Vanadium for tool steels
      'W': Math.min(3, 100 - currentTotal),   // Tungsten for high-speed steels
    };
    
    if (intelligentDefaults[element.symbol as keyof typeof intelligentDefaults]) {
      defaultPercentage = intelligentDefaults[element.symbol as keyof typeof intelligentDefaults];
    }
    
    if (currentTotal >= 100) {
      toast.error(t.common.error, {
        description: 'Total composition is 100%. Remove an element or normalize first.'
      });
      return;
    }
    
    const newElement = { element, percentage: defaultPercentage };
    const newElements = [...selectedElements, newElement];
    const newTotal = newElements.reduce((sum, e) => sum + e.percentage, 0);
    
    // Smart composition suggestions
    const getCompositionAdvice = (elements: typeof newElements) => {
      const symbols = elements.map(e => e.element.symbol);
      const hasIron = symbols.includes('Fe');
      const hasCarbon = symbols.includes('C');
      const hasChromium = symbols.includes('Cr');
      const hasNickel = symbols.includes('Ni');
      const hasAluminum = symbols.includes('Al');
      
      if (hasIron && hasCarbon && !hasChromium) {
        return "💡 Consider adding Chromium (Cr) to create stainless steel with enhanced corrosion resistance.";
      }
      if (hasIron && hasChromium && !hasNickel) {
        return "💡 Adding Nickel (Ni) would create austenitic stainless steel with better ductility.";
      }
      if (hasAluminum && symbols.length === 1) {
        return "💡 Consider adding Silicon (Si) or Magnesium (Mg) for aerospace-grade aluminum alloys.";
      }
      if (hasIron && symbols.length === 1) {
        return "💡 Add Carbon (C) for steel, or Chromium (Cr) for stainless properties.";
      }
      return null;
    };
    
    // If adding this element would exceed 100%, suggest normalization
    if (newTotal > 100) {
      setSelectedElements(newElements);
      toast.warning('Composition exceeds 100%', {
        description: 'Click "Normalize" to automatically balance all elements.',
        action: {
          label: 'Auto-normalize',
          onClick: () => {
            const total = newElements.reduce((sum, e) => sum + e.percentage, 0);
            setSelectedElements(newElements.map(item => ({
              ...item,
              percentage: parseFloat(((item.percentage / total) * 100).toFixed(2))
            })));
            toast.success('Composition auto-normalized to 100%');
          }
        }
      });
    } else {
      setSelectedElements(newElements);
      
      const advice = getCompositionAdvice(newElements);
      if (advice) {
        toast.success(`${element.symbol} (${element.name}) added with ${defaultPercentage}%`, {
          description: advice
        });
      } else {
        toast.success(`${element.symbol} (${element.name}) added with ${defaultPercentage}%`);
      }
    }
  };

  const removeElementFromComposition = (symbol: string) => {
    setSelectedElements(prev => prev.filter(item => item.element.symbol !== symbol));
  };

  const updatePercentage = (index: number, percentage: number) => {
    const roundedPercentage = Math.round(percentage * 100) / 100; // Round to 2 decimal places
    setSelectedElements(prev => prev.map((item, i) => 
      i === index ? { ...item, percentage: roundedPercentage } : item
    ));
  };

  const equalizePercentages = () => {
    if (selectedElements.length === 0) return;
    
    const equalPercentage = parseFloat((100 / selectedElements.length).toFixed(2));
    setSelectedElements(prev => prev.map(item => ({
      ...item,
      percentage: equalPercentage
    })));
    
    toast.success('Equal distribution applied', {
      description: `Each element now has ${equalPercentage}%`
    });
  };

  const optimizeComposition = async () => {
    if (selectedElements.length === 0) {
      toast.error('No elements to optimize');
      return;
    }

    setIsSimulating(true);
    
    try {
      // Use AI to suggest optimal composition ratios
      const prompt = spark.llmPrompt`
      Optimize the composition of a material with the following elements: ${selectedElements.map(e => e.element.symbol).join(', ')}
      
      Current composition: ${selectedElements.map(e => `${e.element.symbol}: ${e.percentage}%`).join(', ')}
      
      Goals:
      1. Maximize mechanical strength (tensile strength, hardness)
      2. Maintain good ductility and toughness
      3. Optimize for manufacturability
      4. Consider cost-effectiveness
      5. Ensure chemical stability
      
      Base the optimization on:
      - Known successful alloy compositions
      - Phase diagrams and metallurgical principles
      - Element interactions and synergies
      - Industrial best practices
      
      Return optimized percentages as JSON: {"elements": [{"symbol": "Fe", "percentage": 85.2}, ...]}
      Ensure percentages sum to exactly 100%.
      `;

      const result = await spark.llm(prompt, 'gpt-4o', true);
      const optimized = JSON.parse(result);
      
      if (optimized.elements && Array.isArray(optimized.elements)) {
        const newComposition = selectedElements.map(item => {
          const optimizedElement = optimized.elements.find((e: any) => e.symbol === item.element.symbol);
          return {
            ...item,
            percentage: optimizedElement ? optimizedElement.percentage : item.percentage
          };
        });
        
        setSelectedElements(newComposition);
        toast.success('Composition optimized using AI recommendations', {
          description: 'Ratios adjusted for enhanced properties and manufacturability'
        });
      }
    } catch (error) {
      // Fallback to rule-based optimization
      const optimizedComposition = selectedElements.map(item => {
        const symbol = item.element.symbol;
        
        // Rule-based optimization based on common alloy practices
        if (symbol === 'Fe' && selectedElements.some(e => e.element.symbol === 'C')) {
          return { ...item, percentage: 98.5 }; // Carbon steel
        } else if (symbol === 'C' && selectedElements.some(e => e.element.symbol === 'Fe')) {
          return { ...item, percentage: 0.8 }; // Medium carbon steel
        } else if (symbol === 'Cr' && selectedElements.some(e => e.element.symbol === 'Fe')) {
          return { ...item, percentage: 18.0 }; // Stainless steel
        } else if (symbol === 'Ni' && selectedElements.some(e => e.element.symbol === 'Fe')) {
          return { ...item, percentage: 8.0 }; // Austenitic stainless
        } else if (symbol === 'Al' && selectedElements.length === 1) {
          return { ...item, percentage: 100 }; // Pure aluminum
        }
        
        return item;
      });
      
      // Normalize if needed
      const total = optimizedComposition.reduce((sum, e) => sum + e.percentage, 0);
      if (total !== 100) {
        const normalized = optimizedComposition.map(item => ({
          ...item,
          percentage: parseFloat(((item.percentage / total) * 100).toFixed(2))
        }));
        setSelectedElements(normalized);
      } else {
        setSelectedElements(optimizedComposition);
      }
      
      toast.success('Composition optimized using metallurgical principles');
    } finally {
      setIsSimulating(false);
    }
  };

  const suggestAlloyPresets = () => {
    const presets = [
      {
        name: "304 Stainless Steel",
        elements: [
          { symbol: 'Fe', percentage: 70.0 },
          { symbol: 'Cr', percentage: 18.0 },
          { symbol: 'Ni', percentage: 8.0 },
          { symbol: 'Mn', percentage: 2.0 },
          { symbol: 'Si', percentage: 1.0 },
          { symbol: 'C', percentage: 0.08 }
        ]
      },
      {
        name: "6061 Aluminum Alloy",
        elements: [
          { symbol: 'Al', percentage: 97.9 },
          { symbol: 'Mg', percentage: 1.0 },
          { symbol: 'Si', percentage: 0.6 },
          { symbol: 'Cu', percentage: 0.3 },
          { symbol: 'Cr', percentage: 0.2 }
        ]
      },
      {
        name: "Ti-6Al-4V",
        elements: [
          { symbol: 'Ti', percentage: 90.0 },
          { symbol: 'Al', percentage: 6.0 },
          { symbol: 'V', percentage: 4.0 }
        ]
      }
    ];
    
    return presets;
  };

  const removeElement = (index: number) => {
    setSelectedElements(prev => prev.filter((_, i) => i !== index));
  };

  const normalizeComposition = () => {
    if (selectedElements.length === 0) {
      toast.error(t.common.error, {
        description: 'No elements to normalize'
      });
      return;
    }
    
    const total = selectedElements.reduce((sum, e) => sum + e.percentage, 0);
    if (total === 0) {
      toast.error(t.common.error, {
        description: 'All elements have 0% composition'
      });
      return;
    }
    
    // Check if already normalized
    if (Math.abs(total - 100) < 0.01) {
      toast.info('Composition already normalized', {
        description: 'Total composition is already 100%'
      });
      return;
    }
    
    setSelectedElements(prev => prev.map(item => ({
      ...item,
      percentage: parseFloat(((item.percentage / total) * 100).toFixed(2))
    })));
    
    toast.success(t.common.success, {
      description: `Composition normalized from ${total.toFixed(1)}% to 100%`
    });
  };

  const totalPercentage = selectedElements.reduce((sum, e) => sum + e.percentage, 0);

  const simulateProperties = async () => {
    if (selectedElements.length === 0) {
      toast.error(t.common.error, {
        description: 'Please add at least one element'
      });
      return;
    }
    
    if (Math.abs(totalPercentage - 100) > 0.01) {
      toast.error(t.common.error, {
        description: 'Total composition must equal 100%. Click "Normalize" to fix this.'
      });
      return;
    }

    setIsSimulating(true);
    
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Use the real-time prediction results if available
    if (prediction && prediction.isValid) {
      const properties = prediction.properties;
      const scores = prediction.scores;
      
      setSimulationResults({
        properties: {
          tensileStrength: properties.tensileStrength,
          density: properties.density,
          thermalConductivity: properties.thermalConductivity,
          electricalConductivity: properties.electricalConductivity,
        },
        performanceScore: scores.performanceScore,
        costScore: scores.costScore,
        sustainabilityScore: scores.sustainabilityScore,
        overallScore: scores.overallScore,
        confidence: scores.confidence,
      });
    } else {
      // Fallback to basic calculation
      const hasIron = selectedElements.find(e => e.element.symbol === 'Fe');
      const hasCarbon = selectedElements.find(e => e.element.symbol === 'C');
      const hasAluminum = selectedElements.find(e => e.element.symbol === 'Al');
      
      const properties = {
        tensileStrength: hasIron ? 400 + (hasCarbon?.percentage || 0) * 10 : hasAluminum ? 300 : 250,
        density: hasIron ? 7.8 - (hasAluminum?.percentage || 0) * 0.05 : hasAluminum ? 2.7 : 5.0,
        thermalConductivity: hasAluminum ? 200 - (hasIron?.percentage || 0) * 1.5 : 80,
        electricalConductivity: selectedElements.find(e => e.element.symbol === 'Cu') ? 60 : hasAluminum ? 38 : 10,
      };
      
      const performanceScore = Math.min(95, Math.max(60, properties.tensileStrength / 10 + Math.random() * 10));
      const costScore = Math.min(95, Math.max(40, 100 - (properties.density * 8) + Math.random() * 15));
      const sustainabilityScore = Math.min(95, Math.max(50, hasAluminum ? 85 : 70 + Math.random() * 10));
      
      setSimulationResults({
        properties,
        performanceScore,
        costScore,
        sustainabilityScore,
        overallScore: (performanceScore + costScore + sustainabilityScore) / 3,
        confidence: Math.min(95, 70 + selectedElements.length * 5),
      });
    }
    
    setIsSimulating(false);
    toast.success(t.common.success, {
      description: 'Material properties simulated successfully'
    });
  };

  const createMaterial = () => {
    if (!materialName.trim()) {
      toast.error(t.common.error, {
        description: 'Please enter a material name'
      });
      return;
    }
    
    // Use real-time prediction if available, otherwise require simulation
    const propertiesToUse = prediction && prediction.isValid ? prediction.properties : simulationResults?.properties;
    const scoresToUse = prediction && prediction.isValid ? prediction.scores : simulationResults;
    
    if (!propertiesToUse) {
      toast.error(t.common.error, {
        description: 'Please wait for property calculations or run simulation'
      });
      return;
    }

    const newMaterial: Material = {
      id: Date.now().toString(),
      name: materialName,
      category: 'metal',
      subcategory: 'custom alloy',
      
      mechanical: {
        tensileStrength: Math.round(propertiesToUse.tensileStrength || 250),
        yieldStrength: Math.round((propertiesToUse.yieldStrength || propertiesToUse.tensileStrength * 0.8) || 200),
        elasticModulus: Math.round(propertiesToUse.elasticModulus || 200),
        hardness: Math.round(propertiesToUse.hardness || 250),
        density: Math.round((propertiesToUse.density || 5.0) * 1000),
        poissonRatio: 0.3,
        fatigueLimit: Math.round((propertiesToUse.tensileStrength || 250) * 0.4),
        fractureToughness: 50
      },
      
      thermal: {
        meltingPoint: Math.round(propertiesToUse.meltingPoint || 1500),
        thermalConductivity: Math.round(propertiesToUse.thermalConductivity || 80),
        thermalExpansion: 12,
        specificHeat: 500,
        maxServiceTemp: 400
      },
      
      electrical: {
        resistivity: 1e-6,
        conductivity: (propertiesToUse.electricalConductivity || 10) * 1e6
      },
      
      chemical: {
        corrosionResistance: 'good',
        oxidationResistance: 'fair',
        chemicalCompatibility: ['water', 'mild acids'],
        phLevel: { min: 5, max: 9 }
      },
      
      manufacturing: {
        machinability: 'good',
        weldability: 'good',
        formability: 'fair',
        costPerKg: Math.round(15 + Math.random() * 20),
        availability: 'limited'
      },
      
      sustainability: {
        recyclability: 'good',
        carbonFootprint: 8.0,
        sustainabilityScore: Math.round((scoresToUse?.sustainabilityScore || 70) / 10),
        eolOptions: ['recycling', 'remelting']
      },
      
      applications: ['custom engineering', 'prototyping', 'specialized components'],
      advantages: ['custom properties', 'tailored composition'],
      limitations: ['limited testing', 'prototype stage', 'requires validation'],
      
      suppliers: [
        {
          name: 'Advanced Materials Co.',
          region: 'North America',
          minOrderQty: 50,
          leadTime: 60,
        },
      ],
    };

    onMaterialCreated(newMaterial);
    toast.success(t.common.success, {
      description: `Material "${materialName}" created successfully`
    });
    
    // Reset form
    setMaterialName('');
    setSelectedElements([]);
    setSimulationResults(null);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FlaskConical className="h-5 w-5" />
            {t.newMaterial.title}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {t.newMaterial.description}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="material-name">{t.newMaterial.materialName}</Label>
            <Input
              id="material-name"
              placeholder="e.g. High-Strength Steel Alloy"
              value={materialName}
              onChange={(e) => setMaterialName(e.target.value)}
            />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-4">
              <Table className="h-5 w-5" />
              <Label className="text-base font-medium">{t.newMaterial.periodicTable} - {t.newMaterial.selectElements}</Label>
            </div>
            <div className="mb-4 p-3 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">
                <strong>Select base elements:</strong> Click on elements to add them to your material composition. 
                Elements are color-coded by category to help you choose appropriate base materials.
              </p>
              <div className="flex flex-wrap gap-2 text-xs">
                <span><strong>Tip:</strong> Common alloy bases include Fe (steel), Al (aluminum alloys), Cu (brass/bronze), Ti (titanium alloys)</span>
              </div>
              
              {/* Quick Preset Selection */}
              <div className="mt-3 pt-3 border-t">
                <p className="text-sm font-medium mb-2">🚀 Quick Start Presets:</p>
                <div className="flex flex-wrap gap-2">
                  {suggestAlloyPresets().map((preset) => (
                    <Button
                      key={preset.name}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Find corresponding Element objects for each preset
                        const presetElements = preset.elements.map(pe => {
                          // You'll need to access the periodic table data here
                          // For now, let's create a simple element structure
                          const element = {
                            symbol: pe.symbol,
                            name: pe.symbol, // Simplified for now
                            atomicNumber: 0, // Would need to be looked up
                            category: 'metal' as const
                          };
                          return { element, percentage: pe.percentage };
                        });
                        setSelectedElements(presetElements);
                        toast.success(`Applied ${preset.name} composition`);
                      }}
                      className="text-xs"
                    >
                      {preset.name}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
            <PeriodicTable
              selectedElements={selectedElements.map(e => e.element.symbol)}
              onElementSelect={addElement}
              onElementDeselect={removeElementFromComposition}
            />
          </div>

          {selectedElements.length > 0 && (
            <>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-base font-medium">
                    {t.newMaterial.composition} ({totalPercentage.toFixed(2)}%)
                  </Label>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={Math.abs(totalPercentage - 100) > 0.1 ? "default" : "outline"}
                      size="sm"
                      onClick={normalizeComposition}
                      className="flex items-center gap-1"
                      disabled={selectedElements.length === 0}
                    >
                      <Lightning className="w-4 h-4" />
                      {t.newMaterial.normalize}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={equalizePercentages}
                      className="flex items-center gap-1"
                      disabled={selectedElements.length === 0}
                      title="Distribute equally among all elements"
                    >
                      ⚖️ Equal
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={optimizeComposition}
                      className="flex items-center gap-1"
                      disabled={selectedElements.length === 0 || isSimulating}
                      title="AI-powered composition optimization"
                    >
                      {isSimulating ? (
                        <Lightning className="w-4 h-4 animate-pulse" />
                      ) : (
                        <Atom className="w-4 h-4" />
                      )}
                      {isSimulating ? 'Optimizing...' : 'AI Optimize'}
                    </Button>
                    <Badge 
                      variant={Math.abs(totalPercentage - 100) < 0.1 ? "default" : totalPercentage > 100 ? "destructive" : "secondary"}
                    >
                      {Math.abs(totalPercentage - 100) < 0.1 
                        ? "✓ Normalized" 
                        : totalPercentage > 100 
                          ? `${(totalPercentage - 100).toFixed(1)}% over` 
                          : `${(100 - totalPercentage).toFixed(1)}% remaining`
                      }
                    </Badge>
                  </div>
                </div>
                
                {/* Composition status indicator */}
                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                    <span>Composition Balance</span>
                    <span>{totalPercentage.toFixed(2)}% / 100%</span>
                  </div>
                  <Progress 
                    value={Math.min(100, totalPercentage)} 
                    className="h-2"
                  />
                  {totalPercentage > 100 && (
                    <p className="text-xs text-destructive mt-1">
                      ⚠ Total exceeds 100%. Click "Normalize" to balance composition.
                    </p>
                  )}
                  {totalPercentage < 99.9 && totalPercentage > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      💡 Consider normalizing to 100% for accurate material properties.
                    </p>
                  )}
                </div>
                <div className="space-y-3 mt-2">
                  {selectedElements.map((item, index) => (
                    <div key={item.element.symbol} className="flex items-center gap-4 p-3 border rounded-lg bg-card">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <Badge variant="outline" className="font-mono">
                          {item.element.symbol}
                      </Badge>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{item.element.name}</span>
                        <span className="text-xs text-muted-foreground">
                          Atomic #: {item.element.atomicNumber} | Category: {item.element.category.replace('-', ' ')}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Slider
                        value={[item.percentage]}
                        onValueChange={([value]) => updatePercentage(index, value)}
                        max={100}
                        step={0.01}
                        className="flex-1"
                      />
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          value={item.percentage.toFixed(2)}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value) || 0;
                            updatePercentage(index, Math.max(0, Math.min(100, value)));
                          }}
                          className="w-16 h-8 text-xs text-center font-mono"
                          min="0"
                          max="100"
                          step="0.01"
                        />
                        <span className="text-xs text-muted-foreground">%</span>
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeElement(index)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
              
              {/* Composition Visualization */}
              <div className="mt-4">
                <CompositionChart 
                  data={selectedElements} 
                  title={t.newMaterial.visualize}
                />
              </div>
            </div>
            </>
          )}

          <div className="flex gap-3">
            <Button 
              onClick={simulateProperties}
              disabled={isSimulating || selectedElements.length === 0}
              className="flex-1"
              variant="outline"
            >
              {isSimulating ? (
                <>
                  <Lightning className="mr-2 h-4 w-4 animate-pulse" />
                  {t.common.loading}
                </>
              ) : (
                <>
                  <TestTube className="mr-2 h-4 w-4" />
                  Full Simulation
                </>
              )}
            </Button>
            
            <Button 
              onClick={createMaterial}
              disabled={!prediction?.isValid && !simulationResults || !materialName.trim()}
              className="flex-1"
            >
              <Plus className="mr-2 h-4 w-4" />
              {t.newMaterial.createMaterial}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Real-time Property Prediction */}
      <RealTimeProperties 
        prediction={prediction}
        isCalculating={isCalculating}
      />

      {/* Advanced Property Analysis */}
      <AdvancedPropertyPrediction 
        prediction={prediction}
        isCalculating={isCalculating}
        composition={selectedElements}
      />

      {simulationResults && (
        <Card>
          <CardHeader>
            <CardTitle>Full Simulation Results</CardTitle>
            <Badge variant="outline">
              Confidence: {simulationResults.confidence}%
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h4 className="font-medium mb-3">{t.common.performance} Scores</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">{t.common.performance}</span>
                    <div className="flex items-center gap-2">
                      <Progress value={simulationResults.performanceScore} className="w-20" />
                      <span className="text-sm font-medium">{simulationResults.performanceScore.toFixed(0)}%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Cost Efficiency</span>
                    <div className="flex items-center gap-2">
                      <Progress value={simulationResults.costScore} className="w-20" />
                      <span className="text-sm font-medium">{simulationResults.costScore.toFixed(0)}%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">{t.common.sustainability}</span>
                    <div className="flex items-center gap-2">
                      <Progress value={simulationResults.sustainabilityScore} className="w-20" />
                      <span className="text-sm font-medium">{simulationResults.sustainabilityScore.toFixed(0)}%</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-3">Predicted Properties</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Tensile Strength</span>
                    <span className="font-medium">{simulationResults.properties.tensileStrength.toFixed(0)} MPa</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Density</span>
                    <span className="font-medium">{simulationResults.properties.density.toFixed(2)} g/cm³</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Thermal Conductivity</span>
                    <span className="font-medium">{simulationResults.properties.thermalConductivity.toFixed(0)} W/mK</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Electrical Conductivity</span>
                    <span className="font-medium">{simulationResults.properties.electricalConductivity.toFixed(0)} MS/m</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
