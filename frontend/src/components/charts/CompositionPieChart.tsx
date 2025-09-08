import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChartPie } from '@phosphor-icons/react';

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

interface CompositionPieChartProps {
  data: CompositionData[];
  title?: string;
  showLegend?: boolean;
  size?: number;
}

// Color palette for different element categories
const ELEMENT_COLORS = {
  'alkali-metal': '#FF6B6B',
  'alkaline-earth-metal': '#4ECDC4', 
  'transition-metal': '#45B7D1',
  'post-transition-metal': '#96CEB4',
  'metalloid': '#FFEAA7',
  'reactive-nonmetal': '#DDA0DD',
  'noble-gas': '#98D8E8',
  'lanthanide': '#F8BBD9',
  'actinide': '#B19CD9',
  'unknown': '#D3D3D3'
};

// Fallback colors for when element categories don't match
const FALLBACK_COLORS = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', 
  '#d084d0', '#87d068', '#ffa726', '#ef5350', '#42a5f5'
];

export function CompositionPieChart({ 
  data, 
  title = "Material Composition", 
  showLegend = true,
  size = 300 
}: CompositionPieChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChartPie className="h-5 w-5" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <div className="text-center">
              <ChartPie className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No composition data available</p>
              <p className="text-sm">Add elements to see the composition chart</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Prepare data for the pie chart
  const chartData = data.map((item, index) => ({
    name: item.element.symbol,
    fullName: item.element.name,
    value: item.percentage,
    category: item.element.category,
    color: ELEMENT_COLORS[item.element.category as keyof typeof ELEMENT_COLORS] || 
           FALLBACK_COLORS[index % FALLBACK_COLORS.length]
  }));

  // Sort by percentage for better visual representation
  chartData.sort((a, b) => b.value - a.value);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <div className="font-medium">{data.fullName} ({data.name})</div>
          <div className="text-sm text-muted-foreground">
            Category: {data.category.replace('-', ' ')}
          </div>
          <div className="text-sm font-medium mt-1">
            {data.value.toFixed(2)}%
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom legend
  const CustomLegend = ({ payload }: any) => {
    if (!showLegend || !payload) return null;
    
    return (
      <div className="flex flex-wrap gap-2 justify-center mt-4">
        {payload.map((entry: any, index: number) => (
          <Badge 
            key={index}
            variant="outline" 
            className="flex items-center gap-1 text-xs"
            style={{ borderColor: entry.color }}
          >
            <div 
              className="w-2 h-2 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            {entry.payload.name} ({entry.payload.value.toFixed(1)}%)
          </Badge>
        ))}
      </div>
    );
  };

  // Calculate total percentage
  const totalPercentage = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ChartPie className="h-5 w-5" />
            {title}
          </CardTitle>
          <Badge 
            variant={Math.abs(totalPercentage - 100) < 0.1 ? "default" : "secondary"}
          >
            Total: {totalPercentage.toFixed(1)}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <ResponsiveContainer width="100%" height={size}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={size * 0.15}
                outerRadius={size * 0.35}
                paddingAngle={2}
                dataKey="value"
                animationBegin={0}
                animationDuration={800}
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color}
                    stroke={entry.color}
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />
            </PieChart>
          </ResponsiveContainer>

          {/* Detailed breakdown */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Detailed Breakdown</h4>
            <div className="space-y-1">
              {chartData.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full border"
                      style={{ 
                        backgroundColor: item.color,
                        borderColor: item.color
                      }}
                    />
                    <span className="font-mono font-medium">{item.name}</span>
                    <span className="text-muted-foreground">{item.fullName}</span>
                  </div>
                  <span className="font-medium">{item.value.toFixed(2)}%</span>
                </div>
              ))}
            </div>
            
            {Math.abs(totalPercentage - 100) > 0.1 && (
              <div className="mt-3 p-2 bg-muted/50 rounded text-xs text-muted-foreground">
                <strong>Note:</strong> Composition totals {totalPercentage.toFixed(1)}%. 
                Consider normalizing to 100% for accurate material simulation.
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
