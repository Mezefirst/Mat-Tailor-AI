import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Robot, Lightning, Send, TestTube, Database } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { Material, MATERIALS_DATABASE, searchMaterials } from '@/data/materials';
import { ExternalSearch } from '@/components/search/ExternalSearch';
import { ExternalMaterial, materialDataSources } from '@/services/materialDataSources';
import { useTranslation } from '@/lib/i18n';

interface AIRecommendationProps {
  onMaterialsFound: (materials: Material[]) => void;
}

const exampleQueries = [
  "Find corrosion-resistant materials for marine use under $30/kg",
  "What's the best lightweight composite for aerospace applications?",
  "Recommend high-conductivity materials for electrical components",
  "Find biocompatible materials for medical implants",
  "Suggest sustainable materials for food packaging under $10/kg",
  "High-temperature materials for gas turbine applications"
];

export function AIRecommendation({ onMaterialsFound }: AIRecommendationProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversation, setConversation] = useState<Array<{
    type: 'user' | 'ai';
    content: string;
    materials?: Material[];
  }>>([
    {
      type: 'ai',
      content: 'Hello! I\'m your AI materials expert. Describe your application requirements and I\'ll recommend the best materials for your needs. You can specify mechanical properties, environmental conditions, budget constraints, or ask about specific material combinations.'
    }
  ]);

  const exampleQueries = [
    t.aiRecommendation.examples.marine,
    t.aiRecommendation.examples.packaging,
    t.aiRecommendation.examples.alloy,
    "Recommend high-conductivity materials for electrical components",
    "Find biocompatible materials for medical implants",
    "Suggest sustainable materials for food packaging under $10/kg"
  ];

  const processQuery = async () => {
    if (!query.trim()) {
      toast.error('Please enter a query');
      return;
    }

    setIsProcessing(true);
    
    // Add user message to conversation
    const userMessage = { type: 'user' as const, content: query };
    setConversation(prev => [...prev, userMessage]);
    
    const currentQuery = query;
    setQuery('');

    try {
      // Use AI to analyze the query and recommend materials
      const prompt = spark.llmPrompt`
You are a materials science expert. Based on the user's query: "${currentQuery}"

Analyze the query and recommend materials from the available database. Look for:
1. Application requirements (marine, aerospace, electrical, medical, etc.)
2. Property requirements (strength, conductivity, corrosion resistance, etc.)
3. Cost constraints
4. Environmental conditions
5. Sustainability requirements

Provide a technical analysis explaining why each material is suitable for the application.
`;

      const aiAnalysis = await spark.llm(prompt);
      
      // Search for relevant materials based on query keywords (now async)
      const materials = await findRelevantMaterials(currentQuery);
      
      const aiResponse = {
        type: 'ai' as const,
        content: `${aiAnalysis}\n\nBased on this analysis, here are my top recommendations:\n\n${generateMaterialSummary(materials)}`,
        materials
      };
      
      setConversation(prev => [...prev, aiResponse]);
      onMaterialsFound(materials);
      toast.success(`Found ${materials.length} material recommendations`);
      
    } catch (error) {
      toast.error('Failed to process query. Please try again.');
      setConversation(prev => [...prev, {
        type: 'ai',
        content: 'I apologize, but I encountered an error processing your request. Please try rephrasing your query or contact support if the issue persists.'
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const findRelevantMaterials = async (query: string): Promise<Material[]> => {
    const queryLower = query.toLowerCase();
    let materials: Material[] = [];
    
    // Extract cost constraint if mentioned
    const costMatch = query.match(/under\s*\$?([0-9]+)/i);
    const maxCost = costMatch ? parseInt(costMatch[1]) : undefined;
    
    // Define search criteria based on keywords
    const criteria: any = {};
    if (maxCost) criteria.maxCost = maxCost;
    
    // Application-based filtering for local database
    if (queryLower.includes('marine') || queryLower.includes('corrosion')) {
      materials = MATERIALS_DATABASE.filter(m => 
        m.chemical.corrosionResistance === 'excellent' ||
        m.applications.some(app => app.includes('marine'))
      );
    } else if (queryLower.includes('aerospace') || queryLower.includes('lightweight')) {
      materials = MATERIALS_DATABASE.filter(m => 
        m.mechanical.density < 5000 || // lightweight materials
        m.applications.some(app => app.includes('aerospace'))
      );
    } else if (queryLower.includes('electrical') || queryLower.includes('conductiv')) {
      materials = MATERIALS_DATABASE.filter(m => 
        m.electrical.conductivity && m.electrical.conductivity > 1e6 ||
        m.applications.some(app => app.includes('electrical'))
      );
    } else if (queryLower.includes('medical') || queryLower.includes('biocompat')) {
      materials = MATERIALS_DATABASE.filter(m => 
        m.applications.some(app => app.includes('medical') || app.includes('implant'))
      );
    } else if (queryLower.includes('packaging') || queryLower.includes('food')) {
      materials = MATERIALS_DATABASE.filter(m => 
        m.applications.some(app => app.includes('food') || app.includes('packaging'))
      );
    } else if (queryLower.includes('high.temp') || queryLower.includes('turbine')) {
      materials = MATERIALS_DATABASE.filter(m => 
        m.thermal.maxServiceTemp > 500 ||
        m.applications.some(app => app.includes('turbine') || app.includes('high-temperature'))
      );
    } else {
      // General search across all materials
      materials = searchMaterials(query);
    }
    
    // Apply cost filter if specified
    if (maxCost) {
      materials = materials.filter(m => m.manufacturing.costPerKg <= maxCost);
    }

    // Try to enhance with external data sources if available
    try {
      const status = await materialDataSources.getCredentialStatus();
      if (status.matweb || status.materialsProject) {
        // Extract search parameters for external APIs
        const externalQuery: any = {};
        
        // Extract material type keywords
        const materialKeywords = ['steel', 'aluminum', 'titanium', 'carbon', 'polymer', 'ceramic', 'composite'];
        for (const keyword of materialKeywords) {
          if (queryLower.includes(keyword)) {
            externalQuery.material = keyword;
            break;
          }
        }
        
        // Extract category keywords
        const categoryMap: { [key: string]: string } = {
          'metal': 'Metal',
          'polymer': 'Polymer', 
          'plastic': 'Polymer',
          'ceramic': 'Ceramic',
          'composite': 'Composite',
          'semiconductor': 'Semiconductor'
        };
        
        for (const [keyword, category] of Object.entries(categoryMap)) {
          if (queryLower.includes(keyword)) {
            externalQuery.category = category;
            break;
          }
        }

        // Search external databases
        const externalMaterials = await materialDataSources.searchAllSources(externalQuery);
        
        // Convert and merge external materials
        if (externalMaterials.length > 0) {
          const convertedExternal = convertExternalMaterials(externalMaterials);
          materials = [...materials, ...convertedExternal];
          
          toast.info(`Enhanced search with ${externalMaterials.length} materials from external databases`);
        }
      }
    } catch (error) {
      console.warn('Could not enhance search with external data:', error);
      // Continue with local results only
    }
    
    // Calculate scores and sort by relevance
    const scoredMaterials = materials.map(material => ({
      ...material,
      relevanceScore: calculateRelevanceScore(material, queryLower)
    }));
    
    // Sort by relevance and return top 8 (more now that we have external data)
    return scoredMaterials
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 8);
  };

  const calculateRelevanceScore = (material: Material, query: string): number => {
    let score = 0;
    
    // Application match
    const appMatches = material.applications.filter(app => 
      query.includes(app.toLowerCase()) || app.toLowerCase().includes(query)
    );
    score += appMatches.length * 20;
    
    // Category match
    if (query.includes(material.category)) score += 15;
    if (query.includes(material.subcategory)) score += 10;
    
    // Property relevance
    if (query.includes('strong') && material.mechanical.tensileStrength > 1000) score += 10;
    if (query.includes('light') && material.mechanical.density < 3000) score += 10;
    if (query.includes('conduct') && material.electrical.conductivity && material.electrical.conductivity > 1e6) score += 10;
    if (query.includes('corrosion') && material.chemical.corrosionResistance === 'excellent') score += 15;
    if (query.includes('sustain') && material.sustainability.sustainabilityScore > 7) score += 10;
    
    return score;
  };

  const generateMaterialSummary = (materials: Material[]): string => {
    return materials.map((material, index) => {
      const performanceScore = Math.min(material.mechanical.tensileStrength / 3000 * 100, 100);
      const costScore = Math.max(100 - (material.manufacturing.costPerKg / 100 * 100), 0);
      const sustainabilityScore = material.sustainability.sustainabilityScore * 10;
      
      return `${index + 1}. **${material.name}** (${material.category})
   - Applications: ${material.applications.slice(0, 3).join(', ')}
   - Cost: $${material.manufacturing.costPerKg}/kg
   - Key Properties: ${material.mechanical.tensileStrength} MPa tensile strength, ${(material.mechanical.density/1000).toFixed(2)} g/cm³ density
   - Sustainability Score: ${material.sustainability.sustainabilityScore}/10
   - Top Supplier: ${material.suppliers[0]?.name} (${material.suppliers[0]?.region})`;
    }).join('\n\n');
  };

  // Convert external materials to internal format
  const convertExternalMaterials = (externalMaterials: ExternalMaterial[]): Material[] => {
    return externalMaterials.map(ext => ({
      id: ext.id,
      name: ext.name,
      category: ext.category as any,
      subcategory: ext.category,
      composition: ext.composition,
      mechanical: {
        tensileStrength: ext.properties.find(p => p.name === 'Tensile Strength')?.value as number || 0,
        yieldStrength: ext.properties.find(p => p.name === 'Yield Strength')?.value as number || 0,
        elasticModulus: ext.properties.find(p => p.name === 'Elastic Modulus')?.value as number || 0,
        density: ext.properties.find(p => p.name === 'Density')?.value as number || 0
      },
      thermal: {
        thermalConductivity: ext.properties.find(p => p.name === 'Thermal Conductivity')?.value as number || 0,
        specificHeat: ext.properties.find(p => p.name === 'Specific Heat')?.value as number || 0,
        meltingPoint: ext.properties.find(p => p.name === 'Melting Point')?.value as number || 0,
        maxServiceTemp: 0
      },
      electrical: {
        conductivity: ext.properties.find(p => p.name === 'Electrical Conductivity')?.value as number || 0,
        resistivity: 0,
        dielectricConstant: 0
      },
      chemical: {
        corrosionResistance: 'moderate',
        chemicalCompatibility: [],
        oxidationResistance: 'moderate'
      },
      sustainability: {
        sustainabilityScore: 7,
        recyclability: 'high',
        carbonFootprint: 5,
        renewableContent: 0
      },
      manufacturing: {
        processability: 'moderate',
        costPerKg: 50, // Default value
        leadTime: 14,
        minOrderQuantity: 100
      },
      suppliers: ext.suppliers?.map(name => ({ 
        name, 
        region: 'Global', 
        contact: '', 
        certifications: [] 
      })) || [],
      applications: [ext.description || ''],
      standards: [],
      notes: `Imported from ${ext.source}`
    }));
  };

  const handleExternalMaterialsFound = (externalMaterials: ExternalMaterial[]) => {
    const convertedMaterials = convertExternalMaterials(externalMaterials);
    onMaterialsFound(convertedMaterials);
    toast.success(`Imported ${convertedMaterials.length} materials from external databases`);
  };

  const useExampleQuery = (example: string) => {
    setQuery(example);
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="ai-chat" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="ai-chat" className="flex items-center gap-2">
            <Robot className="w-4 h-4" />
            AI Chat
          </TabsTrigger>
          <TabsTrigger value="external-search" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            External Databases
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ai-chat" className="space-y-6 mt-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Robot className="h-5 w-5" />
            AI Materials Expert
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="max-h-96 overflow-y-auto space-y-4 p-4 border rounded-lg bg-muted/20">
              {conversation.map((message, index) => (
                <div key={index} className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-lg ${
                    message.type === 'user' 
                      ? 'bg-primary text-primary-foreground ml-12' 
                      : 'bg-card border mr-12'
                  }`}>
                    <div className="whitespace-pre-wrap text-sm">
                      {message.content}
                    </div>
                    
                    {message.materials && message.materials.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {message.materials.map((material) => (
                          <div key={material.id} className="p-2 border rounded bg-background/50">
                            <div className="font-medium text-sm">{material.name}</div>
                            <div className="flex gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">{material.category}</Badge>
                              <Badge variant="secondary" className="text-xs">${material.manufacturing.costPerKg}/kg</Badge>
                            </div>
                            <div className="flex gap-4 mt-2 text-xs">
                              <div className="flex items-center gap-1">
                                <span>Tensile:</span>
                                <span>{material.mechanical.tensileStrength} MPa</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span>Sustainability:</span>
                                <span>{material.sustainability.sustainabilityScore}/10</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {isProcessing && (
                <div className="flex gap-3 justify-start">
                  <div className="max-w-[80%] p-3 rounded-lg bg-card border mr-12">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Lightning className="h-4 w-4 animate-pulse" />
                      Analyzing your requirements...
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex gap-2">
              <Textarea
                placeholder="Describe your material requirements... (e.g., 'I need a lightweight, corrosion-resistant material for outdoor applications under €50/kg')"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    processQuery();
                  }
                }}
                className="min-h-[60px] resize-none"
              />
              <Button 
                onClick={processQuery}
                disabled={isProcessing || !query.trim()}
                size="sm"
                className="px-3"
              >
                {isProcessing ? (
                  <Lightning className="h-4 w-4 animate-pulse" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Example Queries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-2">
            {exampleQueries.map((example, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => useExampleQuery(example)}
                className="justify-start text-left h-auto p-3 whitespace-normal"
              >
                <TestTube className="mr-2 h-3 w-3 flex-shrink-0 mt-0.5" />
                <span className="text-xs">{example}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
        </TabsContent>

        <TabsContent value="external-search" className="mt-6">
          <ExternalSearch onMaterialsFound={handleExternalMaterialsFound} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
