
"use client";

import * as React from "react";
import { PieChart, Pie, Cell, Legend, Tooltip } from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTransactions } from "@/contexts/transactions-context";

const COLORS: string[] = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export function CategoryBreakdownChart() {
  const { currentMonthTransactions } = useTransactions();

  const chartData = React.useMemo(() => {
    const categoryTotals: { [key: string]: number } = {};
    currentMonthTransactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        if (categoryTotals[t.category]) {
          categoryTotals[t.category] += t.amount;
        } else {
          categoryTotals[t.category] = t.amount;
        }
      });
    
    return Object.entries(categoryTotals).map(([category, amount]) => ({
        name: category.charAt(0).toUpperCase() + category.slice(1),
        value: Number(amount.toFixed(2)),
    }));
  }, [currentMonthTransactions]);

  const totalAmount = React.useMemo(
    () => chartData.reduce((sum, d) => sum + d.value, 0),
    [chartData]
  );
  
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };
  
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-2 border rounded-lg bg-background shadow-lg">
          <p className="font-bold">{`${payload[0].name}`}</p>
          <p className="text-sm">{`Amount: $${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Category Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="pb-0 flex flex-col items-center">
        {chartData.length > 0 ? (
           <PieChart width={240} height={240}>
            <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
            >
                {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{paddingLeft: "20px"}} iconSize={14} payload={
              chartData.map(
                (item, index) => ({
                  id: item.name,
                  type: "square",
                  value: `${item.name} (${((item.value / totalAmount) * 100).toFixed(0)}%)`,
                  color: COLORS[index % COLORS.length]
                })
              )
            } />
          </PieChart>
        ) : (
          <div className="flex items-center justify-center h-48 text-muted-foreground">
            No expense data for this month.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
