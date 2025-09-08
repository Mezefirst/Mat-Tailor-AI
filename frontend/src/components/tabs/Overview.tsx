import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChartBar, TestTube, Atom, Lightning, MagnifyingGlass, Funnel } from '@phosphor-icons/react';
import { Material, MATERIALS_DATABASE, searchMaterials, getUniqueCategories } from '@/data/materials';
import { useTranslation } from '@/lib/i18n';

// Calculate performance scores based on material properties
const calculatePerformanceScore = (material: Material): number => {
  // Normalize and weight different properties
  const strengthScore = Math.min(material.mechanical.tensileStrength / 3000 * 100, 100);
  const densityScore = Math.max(100 - (material.mechanical.density / 10000 * 100), 0);
  const thermalScore = Math.min(material.thermal.thermalConductivity / 400 * 100, 100);
  
  return Math.round((strengthScore * 0.4 + densityScore * 0.3 + thermalScore * 0.3));
};

const calculateCostScore = (material: Material): number => {
  // Inverse cost score - lower cost = higher score
  const maxCost = 100; // USD/kg
  return Math.max(100 - (material.manufacturing.costPerKg / maxCost * 100), 0);
};

const calculateOverallScore = (material: Material): number => {
  const perfScore = calculatePerformanceScore(material);
  const costScore = calculateCostScore(material);
  const sustainability = material.sustainability.sustainabilityScore * 10;
  
  return Math.round((perfScore * 0.4 + costScore * 0.3 + sustainability * 0.3));
};

interface OverviewProps {
  materials: Material[];
  selectedMaterial: Material | null;
  onSelectMaterial: (material: Material) => void;
}

export function Overview({ materials, selectedMaterial, onSelectMaterial }: OverviewProps) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [displayMaterials, setDisplayMaterials] = useState<Material[]>(MATERIALS_DATABASE);

  useEffect(() => {
    let filtered = MATERIALS_DATABASE;
    
    if (searchQuery || categoryFilter !== 'all') {
      filtered = searchMaterials(searchQuery, {
        category: categoryFilter !== 'all' ? categoryFilter : undefined
      });
    }
    
    setDisplayMaterials(filtered);
  }, [searchQuery, categoryFilter]);

  const topMaterials = displayMaterials
    .slice(0, 6)
    .map(material => ({
      ...material,
      performanceScore: calculatePerformanceScore(material),
      costScore: calculateCostScore(material),
      overallScore: calculateOverallScore(material)
    }))
    .sort((a, b) => b.overallScore - a.overallScore)
    .slice(0, 3);

  const stats = {
    totalMaterials: displayMaterials.length,
    topPerformance: topMaterials.length > 0 ? Math.max(...topMaterials.map(m => m.performanceScore)) : 0,
    bestValue: topMaterials.find(m => m.costScore === Math.max(...topMaterials.map(m => m.costScore))),
    topSustainability: topMaterials.find(m => m.sustainability.sustainabilityScore === Math.max(...topMaterials.map(m => m.sustainability.sustainabilityScore)))
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MagnifyingGlass className="h-5 w-5" />
            {t.overview.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder={`${t.common.search} materials, applications, or properties...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <Funnel className="h-4 w-4 mr-2" />
                <SelectValue placeholder={t.common.filter} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {getUniqueCategories().map(category => (
                  <SelectItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Materials Available</CardTitle>
            <TestTube className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMaterials}</div>
            <p className="text-xs text-muted-foreground">
              In comprehensive database
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Performance</CardTitle>
            <Lightning className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.topPerformance}%</div>
            <p className="text-xs text-muted-foreground">
              {topMaterials[0]?.name || 'No materials selected'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Best Value</CardTitle>
            <ChartBar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.bestValue?.manufacturing.costPerKg.toFixed(2) || '0'}/kg
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.bestValue?.name || 'No materials found'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sustainability Leader</CardTitle>
            <Atom className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.topSustainability?.sustainability.sustainabilityScore || 0}/10
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.topSustainability?.name || 'No materials found'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topMaterials.length > 0 ? topMaterials.map((material) => (
                <div 
                  key={material.id}
                  className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => onSelectMaterial(material)}
                >
                  <div className="space-y-1">
                    <div className="font-medium">{material.name}</div>
                    <div className="flex gap-2">
                      <Badge variant="secondary">{material.category}</Badge>
                      <Badge variant="outline">Score: {material.overallScore}%</Badge>
                      <Badge variant="outline">${material.manufacturing.costPerKg}/kg</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {material.applications.slice(0, 2).join(', ')}
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="text-sm text-muted-foreground">Performance</div>
                    <Progress value={material.performanceScore} className="w-20" />
                  </div>
                </div>
              )) : (
                <div className="text-center text-muted-foreground py-8">
                  <TestTube size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No materials found</p>
                  <p className="text-sm">Try adjusting your search or filters</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Material Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {getUniqueCategories().map(category => {
                const categoryMaterials = displayMaterials.filter(m => m.category === category);
                const avgCost = categoryMaterials.reduce((sum, m) => sum + m.manufacturing.costPerKg, 0) / categoryMaterials.length;
                
                return (
                  <div key={category} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium capitalize">{category}</div>
                      <div className="text-sm text-muted-foreground">
                        {categoryMaterials.length} materials
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        ${avgCost.toFixed(2)}/kg avg
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Average cost
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {selectedMaterial && (
        <Card>
          <CardHeader>
            <CardTitle>Selected Material: {selectedMaterial.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              <div>
                <div className="text-sm font-medium mb-2">Performance Scores</div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Performance</span>
                    <div className="flex items-center gap-2">
                      <Progress value={calculatePerformanceScore(selectedMaterial)} className="w-16" />
                      <span className="text-sm">{calculatePerformanceScore(selectedMaterial)}%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Cost</span>
                    <div className="flex items-center gap-2">
                      <Progress value={calculateCostScore(selectedMaterial)} className="w-16" />
                      <span className="text-sm">{calculateCostScore(selectedMaterial)}%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Sustainability</span>
                    <div className="flex items-center gap-2">
                      <Progress value={selectedMaterial.sustainability.sustainabilityScore * 10} className="w-16" />
                      <span className="text-sm">{selectedMaterial.sustainability.sustainabilityScore}/10</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <div className="text-sm font-medium mb-2">Key Properties</div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Tensile Strength</span>
                    <span>{selectedMaterial.mechanical.tensileStrength} MPa</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Density</span>
                    <span>{(selectedMaterial.mechanical.density / 1000).toFixed(2)} g/cm³</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Thermal Conductivity</span>
                    <span>{selectedMaterial.thermal.thermalConductivity} W/mK</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Melting Point</span>
                    <span>{selectedMaterial.thermal.meltingPoint}°C</span>
                  </div>
                </div>
              </div>
              
              <div>
                <div className="text-sm font-medium mb-2">Top Supplier</div>
                {selectedMaterial.suppliers.length > 0 && (
                  <div className="space-y-1 text-sm">
                    <div className="font-medium">{selectedMaterial.suppliers[0].name}</div>
                    <div className="text-muted-foreground">{selectedMaterial.suppliers[0].region}</div>
                    <div>${selectedMaterial.suppliers[0].minOrderQty}kg min order</div>
                    <div>{selectedMaterial.suppliers[0].leadTime} days lead time</div>
                    <Badge variant="outline" className="text-xs">
                      {selectedMaterial.manufacturing.availability}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div>
                <div className="text-sm font-medium mb-2">Applications</div>
                <div className="flex flex-wrap gap-1">
                  {selectedMaterial.applications.map((app, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {app}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <div className="text-sm font-medium mb-2">Manufacturing</div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Machinability</span>
                    <Badge variant="outline" className="text-xs capitalize">
                      {selectedMaterial.manufacturing.machinability}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Weldability</span>
                    <Badge variant="outline" className="text-xs capitalize">
                      {selectedMaterial.manufacturing.weldability}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Recyclability</span>
                    <Badge variant="outline" className="text-xs capitalize">
                      {selectedMaterial.sustainability.recyclability}
                    </Badge>
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
