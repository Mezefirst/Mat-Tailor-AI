import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Lightning, 
  Gauge, 
  Thermometer, 
  CurrencyCircleDollar,
  Leaf,
  Atom,
  Wrench,
  FlaskConical,
  Info,
  TrendUp,
  Brain,
  ChartLine,
  Target,
  Beaker
} from '@phosphor-icons/react';
import { PredictionResult } from '@/hooks/usePropertyPrediction';
import { useTranslation } from '@/lib/i18n';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  ScatterChart,
  Scatter
} from 'recharts';

interface AdvancedPropertyPredictionProps {
  prediction: PredictionResult | null;
  isCalculating: boolean;
  composition: Array<{element: any, percentage: number}>;
  className?: string;
}

interface PropertyTrend {
  timestamp: number;
  tensileStrength: number;
  density: number;
  thermalConductivity: number;
  overallScore: number;
}

export function AdvancedPropertyPrediction({ 
  prediction, 
  isCalculating, 
  composition,
  className 
}: AdvancedPropertyPredictionProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('overview');
  const [propertyHistory, setPropertyHistory] = useState<PropertyTrend[]>([]);
  const [aiInsights, setAiInsights] = useState<string | null>(null);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);

  // Track property changes over time
  useEffect(() => {
    if (prediction && prediction.isValid) {
      const newTrend: PropertyTrend = {
        timestamp: Date.now(),
        tensileStrength: prediction.properties.tensileStrength,
        density: prediction.properties.density,
        thermalConductivity: prediction.properties.thermalConductivity,
        overallScore: prediction.scores.overallScore
      };
      
      setPropertyHistory(prev => [...prev.slice(-9), newTrend]);
    }
  }, [prediction]);

  const generateAIInsights = async () => {
    if (!prediction || !prediction.isValid || composition.length === 0) return;

    setIsGeneratingInsights(true);
    try {
      const prompt = spark.llmPrompt`
      Analyze this material composition and provide expert metallurgical insights:
      
      Composition: ${composition.map(c => `${c.element.symbol}: ${c.percentage.toFixed(2)}%`).join(', ')}
      
      Predicted Properties:
      - Tensile Strength: ${prediction.properties.tensileStrength} MPa
      - Density: ${prediction.properties.density} g/cm³
      - Thermal Conductivity: ${prediction.properties.thermalConductivity} W/mK
      - Electrical Conductivity: ${prediction.properties.electricalConductivity} MS/m
      - Hardness: ${prediction.properties.hardness} HV
      - Performance Score: ${prediction.scores.performanceScore}%
      - Sustainability Score: ${prediction.scores.sustainabilityScore}%
      
      Provide insights on:
      1. Microstructure and phase behavior
      2. Potential applications based on properties
      3. Manufacturing considerations
      4. Strengths and limitations
      5. Optimization suggestions
      6. Comparison to similar commercial alloys
      
      Keep response concise but technically accurate.
      `;

      const insights = await spark.llm(prompt, 'gpt-4o');
      setAiInsights(insights);
    } catch (error) {
      setAiInsights("AI insights unavailable. Properties are calculated using established materials science principles and databases.");
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  if (isCalculating) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightning className="h-5 w-5 animate-pulse" />
            Advanced Property Analysis...
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-2 w-full" />
              <Skeleton className="h-2 w-full" />
              <Skeleton className="h-2 w-full" />
            </div>
            <div className="space-y-3">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-2 w-full" />
              <Skeleton className="h-2 w-full" />
              <Skeleton className="h-2 w-full" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!prediction || !prediction.isValid) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-muted-foreground" />
            Advanced Property Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Atom className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Add elements to see advanced property analysis</p>
            <p className="text-sm mt-1">Get AI-powered insights, trend analysis, and optimization suggestions</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { properties, scores } = prediction;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreVariant = (score: number): "default" | "secondary" | "destructive" => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  const getPropertyRadarData = () => [
    {
      property: 'Strength',
      value: Math.min(100, (properties.tensileStrength / 2000) * 100),
      fullMark: 100
    },
    {
      property: 'Lightweight',
      value: Math.max(0, 100 - (properties.density / 10) * 100),
      fullMark: 100
    },
    {
      property: 'Thermal Cond.',
      value: Math.min(100, (properties.thermalConductivity / 400) * 100),
      fullMark: 100
    },
    {
      property: 'Electrical Cond.',
      value: Math.min(100, (properties.electricalConductivity / 60) * 100),
      fullMark: 100
    },
    {
      property: 'Hardness',
      value: Math.min(100, (properties.hardness / 1000) * 100),
      fullMark: 100
    },
    {
      property: 'Corr. Resist.',
      value: properties.corrosionResistance,
      fullMark: 100
    }
  ];

  const getPropertyTrendData = () => {
    return propertyHistory.map((trend, index) => ({
      step: index + 1,
      tensileStrength: trend.tensileStrength,
      density: trend.density * 1000, // Convert to kg/m³ for better scaling
      thermalConductivity: trend.thermalConductivity,
      overallScore: trend.overallScore
    }));
  };

  const getCompositionEffectData = () => {
    return composition.map(comp => ({
      element: comp.element.symbol,
      percentage: comp.percentage,
      strengthContribution: comp.percentage * (comp.element.symbol === 'C' ? 20 : comp.element.symbol === 'Cr' ? 5 : 2),
      densityContribution: comp.percentage * (comp.element.symbol === 'Fe' ? 7.87 : comp.element.symbol === 'Al' ? 2.7 : 5)
    }));
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Advanced Property Analysis
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Gauge className="h-3 w-3" />
              {scores.confidence}% Confidence
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={generateAIInsights}
              disabled={isGeneratingInsights}
              className="flex items-center gap-1"
            >
              {isGeneratingInsights ? (
                <Lightning className="h-3 w-3 animate-pulse" />
              ) : (
                <Brain className="h-3 w-3" />
              )}
              {isGeneratingInsights ? 'Analyzing...' : 'AI Insights'}
            </Button>
          </div>
        </div>
        {prediction.validationMessage && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>{prediction.validationMessage}</AlertDescription>
          </Alert>
        )}
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-1">
              <Gauge className="h-3 w-3" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="properties" className="flex items-center gap-1">
              <Wrench className="h-3 w-3" />
              Properties
            </TabsTrigger>
            <TabsTrigger value="trends" className="flex items-center gap-1">
              <TrendUp className="h-3 w-3" />
              Trends
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-1">
              <Brain className="h-3 w-3" />
              AI Insights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Performance Scores */}
            <div>
              <h4 className="font-medium mb-4 flex items-center gap-2">
                <Target className="h-4 w-4" />
                Performance Dashboard
              </h4>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm flex items-center gap-1">
                      <Wrench className="h-3 w-3" />
                      Mechanical
                    </span>
                    <Badge variant={getScoreVariant(scores.performanceScore)}>
                      {scores.performanceScore}%
                    </Badge>
                  </div>
                  <Progress value={scores.performanceScore} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm flex items-center gap-1">
                      <CurrencyCircleDollar className="h-3 w-3" />
                      Cost Efficiency
                    </span>
                    <Badge variant={getScoreVariant(scores.costScore)}>
                      {scores.costScore}%
                    </Badge>
                  </div>
                  <Progress value={scores.costScore} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm flex items-center gap-1">
                      <Leaf className="h-3 w-3" />
                      Sustainability
                    </span>
                    <Badge variant={getScoreVariant(scores.sustainabilityScore)}>
                      {scores.sustainabilityScore}%
                    </Badge>
                  </div>
                  <Progress value={scores.sustainabilityScore} className="h-2" />
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Overall Material Score</span>
                  <Badge 
                    variant={getScoreVariant(scores.overallScore)}
                    className="text-base px-3 py-1"
                  >
                    {scores.overallScore}%
                  </Badge>
                </div>
                <Progress value={scores.overallScore} className="h-3 mt-2" />
              </div>
            </div>

            {/* Property Radar Chart */}
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <ChartLine className="h-4 w-4" />
                Property Profile
              </h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={getPropertyRadarData()}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="property" tick={{ fontSize: 10 }} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} />
                    <Radar
                      name="Properties"
                      dataKey="value"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="properties" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Mechanical Properties */}
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Wrench className="h-4 w-4" />
                  Mechanical Properties
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm font-medium">Tensile Strength</span>
                    <span className="font-bold text-lg">{properties.tensileStrength} MPa</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm font-medium">Yield Strength</span>
                    <span className="font-bold text-lg">{properties.yieldStrength} MPa</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm font-medium">Elastic Modulus</span>
                    <span className="font-bold text-lg">{properties.elasticModulus} GPa</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm font-medium">Hardness</span>
                    <span className="font-bold text-lg">{properties.hardness} HV</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm font-medium">Density</span>
                    <span className="font-bold text-lg">{properties.density} g/cm³</span>
                  </div>
                </div>
              </div>

              {/* Thermal & Electrical Properties */}
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Thermometer className="h-4 w-4" />
                  Thermal & Electrical
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm font-medium">Melting Point</span>
                    <span className="font-bold text-lg">{properties.meltingPoint}°C</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm font-medium">Thermal Conductivity</span>
                    <span className="font-bold text-lg">{properties.thermalConductivity} W/mK</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm font-medium">Electrical Conductivity</span>
                    <span className="font-bold text-lg">{properties.electricalConductivity} MS/m</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm font-medium">Corrosion Resistance</span>
                    <div className="flex items-center gap-2">
                      <Progress value={properties.corrosionResistance} className="w-16 h-2" />
                      <span className="font-bold text-sm">{properties.corrosionResistance}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Manufacturing Properties */}
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Beaker className="h-4 w-4" />
                Manufacturing Properties
              </h4>
              <div className="grid gap-3 md:grid-cols-3">
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-sm text-muted-foreground mb-2">Formability</div>
                  <div className="flex items-center justify-center gap-1">
                    <Progress value={properties.formability} className="w-16 h-2" />
                    <span className="text-sm font-bold">{properties.formability}%</span>
                  </div>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-sm text-muted-foreground mb-2">Weldability</div>
                  <div className="flex items-center justify-center gap-1">
                    <Progress value={properties.weldability} className="w-16 h-2" />
                    <span className="text-sm font-bold">{properties.weldability}%</span>
                  </div>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-sm text-muted-foreground mb-2">Machinability</div>
                  <div className="flex items-center justify-center gap-1">
                    <Progress value={properties.machinability} className="w-16 h-2" />
                    <span className="text-sm font-bold">{properties.machinability}%</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            {propertyHistory.length > 1 ? (
              <>
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <TrendUp className="h-4 w-4" />
                    Property Evolution
                  </h4>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={getPropertyTrendData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="step" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="tensileStrength" stroke="hsl(var(--primary))" name="Tensile Strength (MPa)" />
                        <Line type="monotone" dataKey="thermalConductivity" stroke="hsl(var(--accent))" name="Thermal Cond. (W/mK)" />
                        <Line type="monotone" dataKey="overallScore" stroke="hsl(var(--secondary))" name="Overall Score (%)" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Atom className="h-4 w-4" />
                    Element Contribution Analysis
                  </h4>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={getCompositionEffectData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="element" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="strengthContribution" fill="hsl(var(--primary))" name="Strength Contribution" />
                        <Bar dataKey="percentage" fill="hsl(var(--accent))" name="Percentage %" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <ChartLine className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Make composition changes to see property trends</p>
                <p className="text-sm mt-1">Adjust element percentages to track how properties evolve</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            {aiInsights ? (
              <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Brain className="h-4 w-4 text-blue-600" />
                  AI Material Analysis
                </h4>
                <div className="prose prose-sm max-w-none text-blue-800 dark:text-blue-200">
                  {aiInsights.split('\n').map((line, index) => (
                    <p key={index} className="mb-2">{line}</p>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Brain className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Generate AI insights for detailed material analysis</p>
                <p className="text-sm mt-1">Get expert metallurgical insights and optimization suggestions</p>
                <Button
                  onClick={generateAIInsights}
                  disabled={isGeneratingInsights}
                  className="mt-4"
                >
                  {isGeneratingInsights ? (
                    <Lightning className="h-4 w-4 mr-2 animate-pulse" />
                  ) : (
                    <Brain className="h-4 w-4 mr-2" />
                  )}
                  {isGeneratingInsights ? 'Generating Insights...' : 'Generate AI Insights'}
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-blue-800 dark:text-blue-200">
              <p className="font-medium mb-1">Advanced Analysis</p>
              <p>Properties calculated using state-of-the-art materials science models, thermodynamic databases, 
              and machine learning algorithms. Real-time predictions consider element interactions, phase stability, 
              and processing effects for accurate material design.</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
