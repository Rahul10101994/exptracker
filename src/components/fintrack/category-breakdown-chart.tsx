"use client"

import * as React from "react"
import { PieChart, Pie, Cell, Legend } from "recharts"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const chartData = [
  { category: "food", amount: 250, label: "Food" },
  { category: "transport", amount: 150, label: "Transport" },
  { category: "shopping", amount: 300, label: "Shopping" },
  { category: "bills", amount: 200, label: "Bills" },
  { category: "other", amount: 100, label: "Other" },
]

const COLORS: Record<string, string> = {
  food: "hsl(var(--chart-1))",
  transport: "hsl(var(--chart-2))",
  shopping: "hsl(var(--chart-3))",
  bills: "hsl(var(--chart-4))",
  other: "hsl(var(--chart-5))",
}

export function CategoryBreakdownChart() {
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null)

  const totalAmount = React.useMemo(
    () => chartData.reduce((sum, d) => sum + d.amount, 0),
    []
  )

  const activeData =
    activeIndex !== null ? chartData[activeIndex] : null

  const CENTER_X = 120
  const CENTER_Y = 120

  return (
    <Card>
      <CardHeader>
        <CardTitle>Category Breakdown</CardTitle>
      </CardHeader>

      <CardContent className="flex justify-center">
        <PieChart width={240} height={300}>
          {/* CENTER TEXT */}
          <g transform={`translate(${CENTER_X}, ${CENTER_Y})`}>
            <text
              textAnchor="middle"
              dominantBaseline="central"
              className="fill-foreground text-lg font-bold"
            >
              ₹{activeData ? activeData.amount : totalAmount}
            </text>
            <text
              y={18}
              textAnchor="middle"
              dominantBaseline="central"
              className="fill-muted-foreground text-xs"
            >
              {activeData ? activeData.label : "Total"}
            </text>
          </g>

          <Pie
            data={chartData}
            dataKey="amount"
            nameKey="label"
            cx={CENTER_X}
            cy={CENTER_Y}
            innerRadius={60}
            outerRadius={80}
            activeIndex={activeIndex ?? undefined}
            activeOuterRadius={92}
            onMouseEnter={(_, i) => setActiveIndex(i)}
            onMouseLeave={() => setActiveIndex(null)}
          >
            {chartData.map((entry) => (
              <Cell
                key={entry.category}
                fill={COLORS[entry.category]}
                className="transition-all duration-300"
              />
            ))}
          </Pie>

          {/* LEGEND WITH % */}
          <Legend
            verticalAlign="bottom"
            align="center"
            content={({ payload }) => (
              <ul className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs">
                {payload?.map((entry, index) => {
                  const item = chartData.find(
                    (d) => d.label === entry.value
                  )
                  const percent = item
                    ? Math.round((item.amount / totalAmount) * 100)
                    : 0

                  return (
                    <li
                      key={index}
                      className="flex items-center gap-1.5"
                    >
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: entry.color }}
                      />
                      <span>{entry.value}</span>
                      <span className="text-muted-foreground">
                        {percent}%
                      </span>
                    </li>
                  )
                })}
              </ul>
            )}
          />
        </PieChart>
      </CardContent>
    </Card>
  )
}
