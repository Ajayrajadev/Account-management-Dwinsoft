'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import type { CategoryExpense } from '@/types/dashboard';
import { useMemo } from 'react';

interface CategoryExpenseChartProps {
  data: CategoryExpense[];
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16'];

export function CategoryExpenseChart({ data }: CategoryExpenseChartProps) {
  // Use data as-is since backend now provides percentages
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    return data;
  }, [data]);

  // Custom label function that uses backend-provided percentage
  const renderLabel = (entry: any) => {
    return `${entry.category} (${entry.percentage}%)`;
  };

  // Custom legend formatter
  const renderLegend = (props: any) => {
    const { payload } = props;
    return (
      <ul className="flex flex-wrap justify-center gap-4 mt-4">
        {payload.map((entry: any, index: number) => {
          const dataItem = chartData[index];
          return (
            <li key={`item-${index}`} className="flex items-center gap-2">
              <span
                className="inline-block w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm text-gray-700">
                {dataItem?.category || entry.value} ({dataItem?.percentage || 0}%)
              </span>
            </li>
          );
        })}
      </ul>
    );
  };

  if (!chartData || chartData.length === 0) {
    return (
      <Card className="bg-white shadow-sm hover:shadow-md transition-all duration-200 border-gray-200 rounded-xl">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Top Expense Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            No expense data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white shadow-sm hover:shadow-md transition-all duration-200 border-gray-200 rounded-xl">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">Top Expense Categories</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderLabel}
              outerRadius={90}
              fill="#8884d8"
              dataKey="amount"
              stroke="white"
              strokeWidth={3}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number, name: string, props: any) => {
                return [
                  `${new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                  }).format(value)} (${props.payload.percentage || 0}%)`,
                  props.payload.category,
                ];
              }}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                fontSize: '14px',
              }}
            />
            <Legend content={renderLegend} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

