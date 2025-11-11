'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatRupees } from '@/lib/utils';
import { TrendingUp, TrendingDown, Calendar } from 'lucide-react';

interface MonthlyProfitData {
  month: string;
  income: number;
  expenses: number;
  profit: number;
}

interface MonthlyProfitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  yearlyData: MonthlyProfitData[];
}

export function MonthlyProfitModal({ open, onOpenChange, yearlyData }: MonthlyProfitModalProps) {
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');

  // Process data for display
  const processedData = yearlyData.map(item => ({
    ...item,
    monthName: new Date(item.month + '-01').toLocaleDateString('en-US', { 
      month: 'short', 
      year: 'numeric' 
    }),
    profitColor: item.profit >= 0 ? '#10b981' : '#ef4444'
  }));

  // Calculate totals
  const totalIncome = yearlyData.reduce((sum, item) => sum + item.income, 0);
  const totalExpenses = yearlyData.reduce((sum, item) => sum + item.expenses, 0);
  const totalProfit = totalIncome - totalExpenses;
  const avgMonthlyProfit = totalProfit / Math.max(yearlyData.length, 1);

  // Find best and worst months
  const bestMonth = yearlyData.reduce((best, current) => 
    current.profit > best.profit ? current : best, yearlyData[0] || { profit: 0, month: '' }
  );
  const worstMonth = yearlyData.reduce((worst, current) => 
    current.profit < worst.profit ? current : worst, yearlyData[0] || { profit: 0, month: '' }
  );

  const formatMonth = (month: string) => {
    return new Date(month + '-01').toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Monthly Profit Analysis
          </DialogTitle>
          <DialogDescription>
            Detailed breakdown of monthly profits for the past 12 months
          </DialogDescription>
        </DialogHeader>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Profit
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatRupees(totalProfit)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Avg Monthly Profit
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatRupees(avgMonthlyProfit)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <TrendingUp className="h-4 w-4 text-green-500" />
                Best Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold text-green-600">
                {formatRupees(bestMonth?.profit || 0)}
              </div>
              <div className="text-sm text-muted-foreground">
                {bestMonth?.month ? formatMonth(bestMonth.month) : 'N/A'}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <TrendingDown className="h-4 w-4 text-red-500" />
                Worst Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold text-red-600">
                {formatRupees(worstMonth?.profit || 0)}
              </div>
              <div className="text-sm text-muted-foreground">
                {worstMonth?.month ? formatMonth(worstMonth.month) : 'N/A'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* View Toggle */}
        <div className="flex gap-2 mb-4">
          <Button
            variant={viewMode === 'chart' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('chart')}
          >
            Chart View
          </Button>
          <Button
            variant={viewMode === 'table' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('table')}
          >
            Table View
          </Button>
        </div>

        {/* Chart View */}
        {viewMode === 'chart' && (
          <Card>
            <CardHeader>
              <CardTitle>Monthly Profit Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={processedData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="monthName" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
                  />
                  <Tooltip 
                    formatter={(value: number) => [formatRupees(value), 'Profit']}
                    labelFormatter={(label) => `Month: ${label}`}
                  />
                  <Bar 
                    dataKey="profit" 
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Table View */}
        {viewMode === 'table' && (
          <Card>
            <CardHeader>
              <CardTitle>Monthly Profit Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2 font-medium">Month</th>
                      <th className="text-right p-2 font-medium">Income</th>
                      <th className="text-right p-2 font-medium">Expenses</th>
                      <th className="text-right p-2 font-medium">Profit</th>
                      <th className="text-right p-2 font-medium">Margin</th>
                    </tr>
                  </thead>
                  <tbody>
                    {processedData.map((item, index) => {
                      const margin = item.income > 0 ? (item.profit / item.income) * 100 : 0;
                      return (
                        <tr key={index} className="border-b hover:bg-muted/50">
                          <td className="p-2 font-medium">{item.monthName}</td>
                          <td className="p-2 text-right text-green-600">
                            {formatRupees(item.income)}
                          </td>
                          <td className="p-2 text-right text-red-600">
                            {formatRupees(item.expenses)}
                          </td>
                          <td className={`p-2 text-right font-semibold ${
                            item.profit >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {formatRupees(item.profit)}
                          </td>
                          <td className={`p-2 text-right ${
                            margin >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {margin.toFixed(1)}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="border-t-2 font-semibold">
                    <tr>
                      <td className="p-2">Total</td>
                      <td className="p-2 text-right text-green-600">
                        {formatRupees(totalIncome)}
                      </td>
                      <td className="p-2 text-right text-red-600">
                        {formatRupees(totalExpenses)}
                      </td>
                      <td className={`p-2 text-right ${
                        totalProfit >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatRupees(totalProfit)}
                      </td>
                      <td className={`p-2 text-right ${
                        totalIncome > 0 && (totalProfit / totalIncome) * 100 >= 0 
                          ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {totalIncome > 0 ? ((totalProfit / totalIncome) * 100).toFixed(1) : '0.0'}%
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </DialogContent>
    </Dialog>
  );
}
