"use client"

import * as React from "react"
import { Cell, Pie, PieChart, Legend, Tooltip } from "recharts"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
} from "@/components/ui/chart"

const chartData = [
  { category: "Food", amount: 250 },
  { category: "Transport", amount: 150 },
  { category: "Shopping", amount: 300 },
  { category: "Bills", amount: 200 },
  { category: "Other", amount: 100 },
]

const chartConfig = {
  amount: {
    label: "Amount",
  },
  food: {
    label: "Food",
    color: "hsl(var(--chart-1))",
  },
  transport: {
    label: "Transport",
    color: "hsl(var(--chart-2))",
  },
  shopping: {
    label: "Shopping",
    color: "hsl(var(--chart-3))",
  },
  bills: {
    label: "Bills",
    color: "hsl(var(--chart-4))",
  },
  other: {
    label: "Other",
    color: "hsl(var(--chart-5))",
  },
}

const COLORS = Object.values(chartConfig).map(item => item.color).filter(Boolean) as string[];

export function CategoryBreakdownChart() {
  return (
    <Card className="shadow-lg border-0">
      <CardHeader>
        <CardTitle>Category Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-60"
        >
          <PieChart>
            <Tooltip
              formatter={(value, name) => [`$${value}`, name]}
            />
            <Pie
              data={chartData}
              dataKey="amount"
              nameKey="category"
              cx="50%"
              cy="50%"
              outerRadius={80}
              innerRadius={60}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ paddingLeft: '20px' }}/>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}