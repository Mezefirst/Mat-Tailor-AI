// Composition Visualization Chart Component
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PieChart } from '@phosphor-icons/react';

interface Element {
  symbol: string;
  name: string;
  atomicNumber: number;
  category: string;
}

interface CompositionData {
  element: Element;
  percentage: number;
}

interface CompositionChartProps {
  data: CompositionData[];
  title?: string;
}

// Color mapping for different element categories
const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    'alkali-metal': '#ff6b6b',
    'alkaline-earth-metal': '#ffa726',
    'lanthanide': '#42a5f5',
    'actinide': '#ab47bc',
    'transition-metal': '#66bb6a',
    'post-transition-metal': '#ffca28',
    'metalloid': '#26c6da',
    'reactive-nonmetal': '#ef5350',
    'noble-gas': '#8d6e63',
    'unknown': '#bdbdbd',
  };
  return colors[category] || '#bdbdbd';
};

export function CompositionChart({ data, title = "Material Composition" }: CompositionChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="w-5 h-5" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            No composition data available
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate total for normalization
  const total = data.reduce((sum, item) => sum + item.percentage, 0);
  const normalizedData = data.map(item => ({
    ...item,
    normalizedPercentage: total > 0 ? (item.percentage / total) * 100 : 0
  }));

  // Create SVG pie chart
  const radius = 80;
  const centerX = 100;
  const centerY = 100;

  let cumulativePercentage = 0;
  const paths = normalizedData.map((item, index) => {
    const percentage = item.normalizedPercentage;
    const startAngle = (cumulativePercentage / 100) * 360;
    const endAngle = ((cumulativePercentage + percentage) / 100) * 360;
    
    const startAngleRad = (startAngle * Math.PI) / 180;
    const endAngleRad = (endAngle * Math.PI) / 180;
    
    const x1 = centerX + radius * Math.cos(startAngleRad);
    const y1 = centerY + radius * Math.sin(startAngleRad);
    const x2 = centerX + radius * Math.cos(endAngleRad);
    const y2 = centerY + radius * Math.sin(endAngleRad);
    
    const largeArcFlag = percentage > 50 ? 1 : 0;
    
    const pathData = [
      `M ${centerX} ${centerY}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      'Z'
    ].join(' ');
    
    cumulativePercentage += percentage;
    
    return {
      pathData,
      color: getCategoryColor(item.element.category),
      element: item.element,
      percentage: item.normalizedPercentage
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChart className="w-5 h-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Pie Chart */}
          <div className="flex-shrink-0">
            <svg width="200" height="200" viewBox="0 0 200 200" className="w-48 h-48">
              {paths.map((path, index) => (
                <path
                  key={index}
                  d={path.pathData}
                  fill={path.color}
                  stroke="white"
                  strokeWidth="2"
                  className="hover:opacity-80 transition-opacity cursor-pointer"
                  title={`${path.element.symbol}: ${path.percentage.toFixed(1)}%`}
                />
              ))}
            </svg>
          </div>
          
          {/* Legend */}
          <div className="flex-1 space-y-3">
            <h4 className="font-medium text-sm">Elements</h4>
            <div className="grid gap-2">
              {normalizedData.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: getCategoryColor(item.element.category) }}
                    />
                    <div>
                      <span className="font-medium text-sm">{item.element.symbol}</span>
                      <span className="text-xs text-muted-foreground ml-2">{item.element.name}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {item.normalizedPercentage.toFixed(1)}%
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {item.element.category.replace('-', ' ')}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            
            {total !== 100 && (
              <div className="text-sm text-amber-600 bg-amber-50 p-2 rounded-lg">
                Note: Total composition is {total.toFixed(1)}%. Percentages shown are normalized to 100%.
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
