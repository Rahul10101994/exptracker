"use client"

import * as React from "react"
import { Cell, Pie, PieChart, Legend, Tooltip, ResponsiveContainer } from "recharts"

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
  { category: "food", amount: 250, label: "Food" },
  { category: "transport", amount: 150, label: "Transport" },
  { category: "shopping", amount: 300, label: "Shopping" },
  { category: "bills", amount: 200, label: "Bills" },
  { category: "other", amount: 100, label: "Other" },
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

export function CategoryBreakdownChart() {
  const totalAmount = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.amount, 0)
  }, [])

  return (
    <Card className="shadow-lg border-0">
      <CardHeader>
        <CardTitle>Category Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-60"
        >
          <PieChart>
            <Tooltip
              cursor={false}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload.payload;
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex flex-col">
                          <span className="text-[0.70rem] uppercase text-muted-foreground">
                            {data.label}
                          </span>
                          <span className="font-bold text-foreground">
                            ${data.amount.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                }

                return null
              }}
            />
            <Pie
              data={chartData}
              dataKey="amount"
              nameKey="label"
              cx="50%"
              cy="50%"
              outerRadius={80}
              innerRadius={60}
              strokeWidth={5}
            >
              {chartData.map((entry) => (
                <Cell
                  key={entry.category}
                  fill={chartConfig[entry.category as keyof typeof chartConfig]?.color}
                  className="focus:outline-none"
                />
              ))}
            </Pie>
            <Legend
              content={({ payload }) => {
                return (
                  <ul className="flex flex-col space-y-1 text-sm text-muted-foreground">
                    {payload?.map((entry, index) => {
                      const { color, value } = entry;
                      const item = chartData.find(d => d.label === value);
                      const percentage = item ? (item.amount / totalAmount * 100).toFixed(0) : 0;
                      return (
                        <li key={`item-${index}`} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <span className="mr-2 h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
                            <span>{value}</span>
                          </div>
                          <span className="font-semibold">{percentage}%</span>
                        </li>
                      )
                    })}
                  </ul>
                )
              }}
              layout="vertical"
              verticalAlign="middle"
              align="right"
              wrapperStyle={{ paddingLeft: '20px' }}
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
