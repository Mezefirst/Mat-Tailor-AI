import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Brain, TrendingUp, Target, Zap } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { Material } from '@/data/materials';

interface MLEnhancedProps {
  materials: Material[];
  onMaterialsUpdated: (materials: Material[]) => void;
}

const feedbackTypes = [
  { value: 'performance', label: 'Performance Priority', icon: Target },
  { value: 'cost', label: 'Cost Optimization', icon: TrendingUp },
  { value: 'sustainability', label: 'Sustainability Focus', icon: Brain },
  { value: 'balance', label: 'Balanced Approach', icon: Zap },
];

const mlInsights = [
  {
    title: 'Material Trend Analysis',
    description: 'Carbon fiber composites show 23% increased adoption in aerospace applications',
    impact: 'high',
    category: 'market'
  },
  {
    title: 'Cost Prediction',
    description: 'Aluminum prices expected to decrease 8% over next 6 months',
    impact: 'medium',
    category: 'economic'
  },
  {
    title: 'Sustainability Alert',
    description: 'New recycling techniques improving steel sustainability scores by 15%',
    impact: 'medium',
    category: 'environmental'
  },
  {
    title: 'Performance Innovation',
    description: 'Advanced alloy treatments increasing titanium strength-to-weight by 12%',
    impact: 'high',
    category: 'technical'
  }
];

export function MLEnhanced({ materials, onMaterialsUpdated }: MLEnhancedProps) {
  const [feedbackType, setFeedbackType] = useState<string>('');
  const [isLearning, setIsLearning] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<string>('');
  const [userRating, setUserRating] = useState<number>(0);

  const applyMLOptimization = async () => {
    if (!feedbackType) {
      toast.error('Please select an optimization focus');
      return;
    }

    setIsLearning(true);
    
    // Simulate ML processing
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Apply optimization based on feedback
    const optimizedMaterials = materials.map(material => {
      const optimization = { ...material };
      
      switch (feedbackType) {
        case 'performance':
          optimization.performanceScore = Math.min(100, material.performanceScore + Math.random() * 10);
          optimization.overallScore = (optimization.performanceScore * 0.5 + material.costScore * 0.25 + material.sustainabilityScore * 0.25);
          break;
        case 'cost':
          optimization.costScore = Math.min(100, material.costScore + Math.random() * 15);
          optimization.overallScore = (material.performanceScore * 0.25 + optimization.costScore * 0.5 + material.sustainabilityScore * 0.25);
          break;
        case 'sustainability':
          optimization.sustainabilityScore = Math.min(100, material.sustainabilityScore + Math.random() * 12);
          optimization.overallScore = (material.performanceScore * 0.25 + material.costScore * 0.25 + optimization.sustainabilityScore * 0.5);
          break;
        case 'balance':
          optimization.performanceScore = Math.min(100, material.performanceScore + Math.random() * 5);
          optimization.costScore = Math.min(100, material.costScore + Math.random() * 5);
          optimization.sustainabilityScore = Math.min(100, material.sustainabilityScore + Math.random() * 5);
          optimization.overallScore = (optimization.performanceScore + optimization.costScore + optimization.sustainabilityScore) / 3;
          break;
      }
      
      optimization.performanceScore = Math.round(optimization.performanceScore);
      optimization.costScore = Math.round(optimization.costScore);
      optimization.sustainabilityScore = Math.round(optimization.sustainabilityScore);
      optimization.overallScore = Math.round(optimization.overallScore);
      
      return optimization;
    });

    // Sort by overall score
    optimizedMaterials.sort((a, b) => b.overallScore - a.overallScore);
    
    onMaterialsUpdated(optimizedMaterials);
    setIsLearning(false);
    toast.success('ML optimization applied successfully');
  };

  const submitFeedback = async () => {
    if (!selectedMaterial || userRating === 0) {
      toast.error('Please select a material and provide a rating');
      return;
    }

    // Simulate feedback processing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success('Feedback submitted. The AI will improve future recommendations.');
    setSelectedMaterial('');
    setUserRating(0);
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'market': return TrendingUp;
      case 'economic': return Target;
      case 'environmental': return Brain;
      case 'technical': return Zap;
      default: return Brain;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Machine Learning Optimization
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Optimization Focus</label>
            <Select value={feedbackType} onValueChange={setFeedbackType}>
              <SelectTrigger>
                <SelectValue placeholder="Select optimization priority" />
              </SelectTrigger>
              <SelectContent>
                {feedbackTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      <type.icon className="h-4 w-4" />
                      {type.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={applyMLOptimization}
            disabled={isLearning || !feedbackType || materials.length === 0}
            className="w-full"
          >
            {isLearning ? (
              <>
                <Brain className="mr-2 h-4 w-4 animate-pulse" />
                Optimizing with ML...
              </>
            ) : (
              <>
                <Zap className="mr-2 h-4 w-4" />
                Apply ML Optimization
              </>
            )}
          </Button>

          {materials.length === 0 && (
            <p className="text-sm text-muted-foreground text-center">
              Use AI Recommendation to find materials first
            </p>
          )}
        </CardContent>
      </Card>

      {materials.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Optimized Material Rankings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {materials.slice(0, 5).map((material, index) => (
                <div key={material.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                      {index + 1}
                    </Badge>
                    <div>
                      <div className="font-medium">{material.name}</div>
                      <div className="text-sm text-muted-foreground">{material.type}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm font-medium">Overall Score</div>
                      <div className="text-2xl font-bold">{material.overallScore}%</div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="w-12">Perf:</span>
                        <Progress value={material.performanceScore} className="w-16 h-1" />
                        <span className="w-8">{material.performanceScore}%</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="w-12">Cost:</span>
                        <Progress value={material.costScore} className="w-16 h-1" />
                        <span className="w-8">{material.costScore}%</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="w-12">Sust:</span>
                        <Progress value={material.sustainabilityScore} className="w-16 h-1" />
                        <span className="w-8">{material.sustainabilityScore}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>ML Insights & Predictions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mlInsights.map((insight, index) => {
              const IconComponent = getCategoryIcon(insight.category);
              return (
                <div key={index} className={`p-3 rounded-lg border ${getImpactColor(insight.impact)}`}>
                  <div className="flex items-start gap-3">
                    <IconComponent className="h-5 w-5 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="font-medium">{insight.title}</div>
                      <div className="text-sm mt-1">{insight.description}</div>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {insight.impact}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Feedback for ML Learning</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Select Material to Rate</label>
            <Select value={selectedMaterial} onValueChange={setSelectedMaterial}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a material to provide feedback" />
              </SelectTrigger>
              <SelectContent>
                {materials.map((material) => (
                  <SelectItem key={material.id} value={material.id}>
                    {material.name} - {material.type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Your Rating (1-5 stars)</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Button
                  key={star}
                  variant={userRating >= star ? "default" : "outline"}
                  size="sm"
                  onClick={() => setUserRating(star)}
                  className="w-8 h-8 p-0"
                >
                  ★
                </Button>
              ))}
            </div>
          </div>

          <Button 
            onClick={submitFeedback}
            disabled={!selectedMaterial || userRating === 0}
            variant="outline"
            className="w-full"
          >
            Submit Feedback
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
