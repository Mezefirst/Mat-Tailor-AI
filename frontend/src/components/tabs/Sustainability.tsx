import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Leaf, Recycle, Factory, Truck, Award, Globe } from '@phosphor-icons/react';
import { Material } from '@/data/materials';

interface SustainabilityProps {
  selectedMaterial: Material | null;
  materials: Material[];
}

const sustainabilityMetrics = {
  carbonFootprint: { score: 85, unit: 'kg CO₂/kg', value: 2.1 },
  recyclability: { score: 92, percentage: 92 },
  renewableContent: { score: 78, percentage: 45 },
  waterUsage: { score: 88, unit: 'L/kg', value: 15 },
  energyIntensity: { score: 75, unit: 'MJ/kg', value: 28 },
  toxicity: { score: 95, level: 'Very Low' },
};

const lifecycleData = [
  { phase: 'Raw Material', impact: 25, color: '#ef4444' },
  { phase: 'Production', impact: 35, color: '#f97316' },
  { phase: 'Transportation', impact: 15, color: '#eab308' },
  { phase: 'Use Phase', impact: 20, color: '#22c55e' },
  { phase: 'End of Life', impact: 5, color: '#10b981' },
];

const certifications = [
  { name: 'ISO 14001', description: 'Environmental Management', status: 'Certified' },
  { name: 'REACH Compliant', description: 'EU Chemical Safety', status: 'Compliant' },
  { name: 'RoHS Compliant', description: 'Restricted Substances', status: 'Compliant' },
  { name: 'Cradle to Cradle', description: 'Circular Design', status: 'Gold' },
  { name: 'FSC Certified', description: 'Sustainable Sourcing', status: 'Chain of Custody' },
];

const supplyChainData = [
  { supplier: 'Nordic Mining Co.', region: 'Scandinavia', sustainabilityScore: 94, carbonNeutral: true },
  { supplier: 'Green Materials Ltd', region: 'Germany', sustainabilityScore: 88, carbonNeutral: true },
  { supplier: 'EcoAlloys Corp', region: 'Netherlands', sustainabilityScore: 91, carbonNeutral: false },
  { supplier: 'Sustainable Steel AB', region: 'Sweden', sustainabilityScore: 96, carbonNeutral: true },
];

export function Sustainability({ selectedMaterial, materials }: SustainabilityProps) {
  const [selectedSupplier, setSelectedSupplier] = useState<string>('');
  const [viewMode, setViewMode] = useState<'overview' | 'lifecycle' | 'supply-chain'>('overview');

  const getSustainabilityGrade = (score: number) => {
    if (score >= 90) return { grade: 'A+', color: 'text-green-700 bg-green-100 border-green-300' };
    if (score >= 80) return { grade: 'A', color: 'text-green-600 bg-green-50 border-green-200' };
    if (score >= 70) return { grade: 'B', color: 'text-yellow-600 bg-yellow-50 border-yellow-200' };
    if (score >= 60) return { grade: 'C', color: 'text-orange-600 bg-orange-50 border-orange-200' };
    return { grade: 'D', color: 'text-red-600 bg-red-50 border-red-200' };
  };

  const materialSustainabilityRanking = materials
    .sort((a, b) => b.sustainabilityScore - a.sustainabilityScore)
    .map((material, index) => ({
      ...material,
      rank: index + 1,
      grade: getSustainabilityGrade(material.sustainabilityScore)
    }));

  return (
    <div className="space-y-6">
      {!selectedMaterial ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Leaf size={48} className="mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">Select a material from Overview to view sustainability analysis</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Leaf className="h-5 w-5" />
                Sustainability Analysis: {selectedMaterial.name}
              </CardTitle>
              <div className="flex gap-2">
                <Badge variant="secondary">{selectedMaterial.category}</Badge>
                <Badge className={getSustainabilityGrade(selectedMaterial.sustainability.sustainabilityScore * 10).color}>
                  Grade: {getSustainabilityGrade(selectedMaterial.sustainability.sustainabilityScore * 10).grade}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <Button
                  variant={viewMode === 'overview' ? 'default' : 'outline'}
                  onClick={() => setViewMode('overview')}
                  className="justify-start"
                >
                  <Leaf className="mr-2 h-4 w-4" />
                  Environmental Impact
                </Button>
                <Button
                  variant={viewMode === 'lifecycle' ? 'default' : 'outline'}
                  onClick={() => setViewMode('lifecycle')}
                  className="justify-start"
                >
                  <Recycle className="mr-2 h-4 w-4" />
                  Lifecycle Analysis
                </Button>
                <Button
                  variant={viewMode === 'supply-chain' ? 'default' : 'outline'}
                  onClick={() => setViewMode('supply-chain')}
                  className="justify-start"
                >
                  <Truck className="mr-2 h-4 w-4" />
                  Supply Chain
                </Button>
              </div>
            </CardContent>
          </Card>

          {viewMode === 'overview' && (
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Environmental Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <Factory className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Carbon Footprint</span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{selectedMaterial.sustainability.carbonFootprint} kg CO₂/kg</div>
                        <Progress value={Math.max(0, 100 - (selectedMaterial.sustainability.carbonFootprint * 5))} className="w-16 h-2 mt-1" />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <Recycle className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Recyclability</span>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="capitalize">
                          {selectedMaterial.sustainability.recyclability}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <Leaf className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Sustainability Score</span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{selectedMaterial.sustainability.sustainabilityScore}/10</div>
                        <Progress value={selectedMaterial.sustainability.sustainabilityScore * 10} className="w-16 h-2 mt-1" />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">End-of-Life Options</span>
                      </div>
                      <div className="text-right">
                        <div className="flex flex-wrap gap-1 justify-end">
                          {selectedMaterial.sustainability.eolOptions.slice(0, 2).map((option, index) => (
                            <Badge key={index} variant="outline" className="text-xs capitalize">
                              {option}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <Factory className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Energy Intensity</span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{sustainabilityMetrics.energyIntensity.value} {sustainabilityMetrics.energyIntensity.unit}</div>
                        <Progress value={sustainabilityMetrics.energyIntensity.score} className="w-16 h-2 mt-1" />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Toxicity Level</span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{sustainabilityMetrics.toxicity.level}</div>
                        <Progress value={sustainabilityMetrics.toxicity.score} className="w-16 h-2 mt-1" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Certifications & Standards</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {certifications.map((cert, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium text-sm">{cert.name}</div>
                          <div className="text-xs text-muted-foreground">{cert.description}</div>
                        </div>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          {cert.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {viewMode === 'lifecycle' && (
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Lifecycle Impact Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={lifecycleData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={2}
                          dataKey="impact"
                        >
                          {lifecycleData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value}%`, 'Environmental Impact']} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    {lifecycleData.map((phase, index) => (
                      <div key={index} className="flex items-center gap-2 text-xs">
                        <div 
                          className="w-3 h-3 rounded" 
                          style={{ backgroundColor: phase.color }}
                        />
                        <span>{phase.phase}: {phase.impact}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Lifecycle Phases</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {lifecycleData.map((phase, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm">{phase.phase}</span>
                          <Badge variant="outline">{phase.impact}% impact</Badge>
                        </div>
                        <Progress 
                          value={phase.impact * 2} 
                          className="h-2"
                        />
                        <div className="text-xs text-muted-foreground mt-1">
                          {phase.phase === 'Raw Material' && 'Extraction, processing, and transportation of raw materials'}
                          {phase.phase === 'Production' && 'Manufacturing processes, energy consumption, and waste generation'}
                          {phase.phase === 'Transportation' && 'Distribution and logistics to end users'}
                          {phase.phase === 'Use Phase' && 'Material performance during its intended application'}
                          {phase.phase === 'End of Life' && 'Recycling, disposal, and material recovery'}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {viewMode === 'supply-chain' && (
            <Card>
              <CardHeader>
                <CardTitle>Sustainable Supply Chain</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {supplyChainData.map((supplier, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <div className="font-medium">{supplier.supplier}</div>
                          <div className="text-sm text-muted-foreground">{supplier.region}</div>
                        </div>
                        <div className="flex gap-2">
                          {supplier.carbonNeutral && (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              Carbon Neutral
                            </Badge>
                          )}
                          <Badge variant="secondary">
                            Score: {supplier.sustainabilityScore}%
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-sm">Sustainability Score:</span>
                        <Progress value={supplier.sustainabilityScore} className="flex-1" />
                        <span className="text-sm font-medium">{supplier.sustainabilityScore}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {materials.length > 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Sustainability Ranking</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {materialSustainabilityRanking.map((material) => (
                    <div key={material.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                          #{material.rank}
                        </Badge>
                        <div>
                          <div className="font-medium">{material.name}</div>
                          <div className="text-sm text-muted-foreground">{material.type}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-sm font-medium">Sustainability Score</div>
                          <div className="text-2xl font-bold">{material.sustainabilityScore}%</div>
                        </div>
                        <Badge className={material.grade.color}>
                          {material.grade.grade}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
