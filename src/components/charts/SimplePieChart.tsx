import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface SimpleChartData {
  name: string;
  value: number;
  color?: string;
}

interface SimplePieChartProps {
  data: SimpleChartData[];
  size?: number;
  innerRadius?: number;
  showTooltip?: boolean;
  className?: string;
}

const DEFAULT_COLORS = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', 
  '#d084d0', '#87d068', '#ffa726', '#ef5350', '#42a5f5'
];

export function SimplePieChart({ 
  data, 
  size = 150, 
  innerRadius = 0,
  showTooltip = true,
  className = ""
}: SimplePieChartProps) {
  // Add colors to data if not provided
  const chartData = data.map((item, index) => ({
    ...item,
    color: item.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-card border border-border rounded-lg p-2 shadow-lg text-xs">
          <div className="font-medium">{data.name}</div>
          <div className="text-muted-foreground">
            {typeof data.value === 'number' ? data.value.toFixed(1) : data.value}%
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={size}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={size * 0.4}
            dataKey="value"
            animationBegin={0}
            animationDuration={600}
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color}
              />
            ))}
          </Pie>
          {showTooltip && <Tooltip content={<CustomTooltip />} />}
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
