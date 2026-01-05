
"use client";

import * as React from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Transaction } from "@/contexts/transactions-context";

const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))"];

export function NeedVsWantChart({ transactions }: { transactions: Transaction[] }) {
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const chartData = React.useMemo(() => {
    const spendingTypes: { [key: string]: number } = {
      need: 0,
      want: 0,
    };

    transactions
      .filter((t) => t.type === "expense" && t.spendingType)
      .forEach((t) => {
        if (t.spendingType) {
          spendingTypes[t.spendingType] += t.amount;
        }
      });
    
    return Object.entries(spendingTypes).map(([type, amount]) => ({
        name: type.charAt(0).toUpperCase() + type.slice(1),
        value: Number(amount.toFixed(2)),
    }));
  }, [transactions]);

  const totalAmount = React.useMemo(
    () => chartData.reduce((sum, d) => sum + d.value, 0),
    [chartData]
  );
  
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent === 0) return null;

    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central">
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
        <CardTitle>Needs vs. Wants</CardTitle>
      </CardHeader>
      <CardContent className="pb-0 flex flex-col items-center">
        {totalAmount > 0 && isClient ? (
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
                  value: `${item.name} (${totalAmount > 0 ? ((item.value / totalAmount) * 100).toFixed(0) : 0}%)`,
                  color: COLORS[index % COLORS.length]
                })
              )
            } />
          </PieChart>
        ) : (
          <div className="flex items-center justify-center h-48 text-muted-foreground">
            {isClient ? 'No expense data for this period.' : 'Loading chart...'}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
