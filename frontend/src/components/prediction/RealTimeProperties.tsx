import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Lightning, 
  Gauge, 
  Thermometer, 
  CurrencyCircleDollar,
  Leaf,
  Atom,
  Wrench,
  FlaskConical,
  Info
} from '@phosphor-icons/react';
import { PredictionResult } from '@/hooks/usePropertyPrediction';
import { useTranslation } from '@/lib/i18n';

interface RealTimePropertiesProps {
  prediction: PredictionResult | null;
  isCalculating: boolean;
  className?: string;
}

export function RealTimeProperties({ prediction, isCalculating, className }: RealTimePropertiesProps) {
  const { t } = useTranslation();

  if (isCalculating) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightning className="h-5 w-5 animate-pulse" />
            Calculating Properties...
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
            <FlaskConical className="h-5 w-5 text-muted-foreground" />
            Live Property Prediction
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Atom className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Add elements to see real-time property predictions</p>
            <p className="text-sm mt-1">Properties will update automatically as you modify the composition</p>
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

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Lightning className="h-5 w-5 text-primary" />
            Live Property Prediction
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Gauge className="h-3 w-3" />
              {scores.confidence}% Confidence
            </Badge>
            {prediction.validationMessage && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Info className="h-3 w-3" />
                Auto-normalized
              </Badge>
            )}
          </div>
        </div>
        {prediction.validationMessage && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>{prediction.validationMessage}</AlertDescription>
          </Alert>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Performance Scores */}
        <div>
          <h4 className="font-medium mb-4 flex items-center gap-2">
            <Gauge className="h-4 w-4" />
            Performance Scores
          </h4>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm flex items-center gap-1">
                  <Wrench className="h-3 w-3" />
                  Performance
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
          
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="font-medium">Overall Score</span>
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

        {/* Mechanical Properties */}
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            Mechanical Properties
          </h4>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">Tensile Strength</span>
              <span className="font-medium">{properties.tensileStrength} MPa</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Yield Strength</span>
              <span className="font-medium">{properties.yieldStrength} MPa</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Elastic Modulus</span>
              <span className="font-medium">{properties.elasticModulus} GPa</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Hardness</span>
              <span className="font-medium">{properties.hardness} HV</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Density</span>
              <span className="font-medium">{properties.density} g/cm³</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Corrosion Resistance</span>
              <div className="flex items-center gap-2">
                <Progress value={properties.corrosionResistance} className="w-16 h-2" />
                <span className="font-medium text-xs">{properties.corrosionResistance}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Thermal & Electrical Properties */}
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Thermometer className="h-4 w-4" />
            Thermal & Electrical Properties
          </h4>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">Melting Point</span>
              <span className="font-medium">{properties.meltingPoint}°C</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Thermal Conductivity</span>
              <span className="font-medium">{properties.thermalConductivity} W/mK</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Electrical Conductivity</span>
              <span className="font-medium">{properties.electricalConductivity} MS/m</span>
            </div>
          </div>
        </div>

        {/* Manufacturing Properties */}
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            Manufacturing Properties
          </h4>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Formability</div>
              <div className="flex items-center justify-center gap-1 mt-1">
                <Progress value={properties.formability} className="w-12 h-2" />
                <span className="text-xs font-medium">{properties.formability}%</span>
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Weldability</div>
              <div className="flex items-center justify-center gap-1 mt-1">
                <Progress value={properties.weldability} className="w-12 h-2" />
                <span className="text-xs font-medium">{properties.weldability}%</span>
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Machinability</div>
              <div className="flex items-center justify-center gap-1 mt-1">
                <Progress value={properties.machinability} className="w-12 h-2" />
                <span className="text-xs font-medium">{properties.machinability}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-blue-800 dark:text-blue-200">
              <p className="font-medium mb-1">Real-time Prediction</p>
              <p>Properties are calculated instantly using advanced material science models. 
              Values update automatically as you modify the composition. Higher confidence indicates more reliable predictions.</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
