"use client";

import * as React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Sector,
  ResponsiveContainer,
} from "recharts";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTransactions } from "@/contexts/transactions-context";

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

/* ---------- ACTIVE SLICE ---------- */
function ActiveShape(props: any) {
  const {
    cx,
    cy,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
  } = props;

  return (
    <Sector
      cx={cx}
      cy={cy}
      innerRadius={innerRadius}
      outerRadius={outerRadius + 8}
      startAngle={startAngle}
      endAngle={endAngle}
      fill={fill}
    />
  );
}

export function CategoryBreakdownChart() {
  const { currentMonthTransactions } = useTransactions();

  const [mounted, setMounted] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);
  const [lockedIndex, setLockedIndex] = React.useState<number | null>(null);

  /* ✅ NEW: selected legend (controls center value) */
  const [selectedKey, setSelectedKey] = React.useState<string | null>(null);

  const [animatedTotal, setAnimatedTotal] = React.useState(0);

  React.useEffect(() => setMounted(true), []);

  /* ---------- RAW DATA ---------- */
  const rawData = React.useMemo(() => {
    const map: Record<string, number> = {};

    currentMonthTransactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        map[t.category] = (map[t.category] || 0) + Math.abs(t.amount);
      });

    return Object.entries(map)
      .map(([key, value]) => ({
        key,
        name: key.charAt(0).toUpperCase() + key.slice(1),
        value: Number(value.toFixed(2)),
      }))
      .sort((a, b) => b.value - a.value);
  }, [currentMonthTransactions]);

  /* ---------- TOTAL ---------- */
  const totalExpense = React.useMemo(
    () => rawData.reduce((s, d) => s + d.value, 0),
    [rawData]
  );

  /* ---------- SELECTED VALUE (KEY FIX) ---------- */
  const selectedValue = React.useMemo(() => {
    if (!selectedKey) return totalExpense;
    return rawData.find((d) => d.key === selectedKey)?.value ?? totalExpense;
  }, [selectedKey, rawData, totalExpense]);

  /* ---------- NEED / WANT ---------- */
  const { needTotal, wantTotal } = React.useMemo(() => {
    let need = 0;
    let want = 0;

    currentMonthTransactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        if (t.spendingType?.toLowerCase() === "need") {
          need += Math.abs(t.amount);
        } else if (t.spendingType?.toLowerCase() === "want") {
          want += Math.abs(t.amount);
        }
      });

    return { needTotal: need, wantTotal: want };
  }, [currentMonthTransactions]);

  const needPercent = totalExpense
    ? Math.round((needTotal / totalExpense) * 100)
    : 0;

  const wantPercent = 100 - needPercent;

  /* ---------- CENTER TOTAL ANIMATION ---------- */
  React.useEffect(() => {
    const start = animatedTotal;
    const diff = selectedValue - start;
    const duration = 600;
    const startTime = performance.now();

    function animate(now: number) {
      const p = Math.min((now - startTime) / duration, 1);
      setAnimatedTotal(Math.round(start + diff * p));
      if (p < 1) requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedValue]);

  if (!mounted) return null;

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-sm sm:text-base">
          Category Breakdown
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col items-center gap-6 p-4 pt-0">
        {rawData.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-muted-foreground">
            No expense data
          </div>
        ) : (
          <>
            {/* ---------- DONUT ---------- */}
            <div
              className="relative w-full max-w-[260px] aspect-square"
              onClick={() => {
                setLockedIndex(null);
                setActiveIndex(null);
                setSelectedKey(null);
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={rawData}
                    cx="50%"
                    cy="50%"
                    innerRadius="62%"
                    outerRadius="82%"
                    dataKey="value"
                    activeIndex={lockedIndex ?? activeIndex ?? undefined}
                    activeShape={ActiveShape}
                    onMouseEnter={(_, i) =>
                      lockedIndex === null && setActiveIndex(i)
                    }
                    onMouseLeave={() =>
                      lockedIndex === null && setActiveIndex(null)
                    }
                    onClick={(_, i) => {
                      setLockedIndex((prev) => (prev === i ? null : i));
                      setActiveIndex(null);
                    }}
                  >
                    {rawData.map((_, i) => (
                      <Cell
                        key={i}
                        fill={COLORS[i % COLORS.length]}
                      />
                    ))}
                  </Pie>

                  <Tooltip
                    cursor={false}
                    contentStyle={{
                      borderRadius: 8,
                      border: "none",
                    }}
                    formatter={(v: number) =>
                      `₹${v.toLocaleString()}`
                    }
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* ---------- CENTER LABEL ---------- */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center gap-1">
                <span className="text-xs text-muted-foreground">
                  {selectedKey
                    ? rawData.find((d) => d.key === selectedKey)?.name
                    : "Total Expense"}
                </span>

                <span className="text-lg sm:text-xl font-bold">
                  ₹{animatedTotal.toLocaleString()}
                </span>

                {!selectedKey && (
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-green-600 font-medium">
                      Need {needPercent}%
                    </span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-orange-500 font-medium">
                      Want {wantPercent}%
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* ---------- LEGEND ---------- */}
            <div className="w-full space-y-2">
              {rawData.map((item, index) => {
                const percent = totalExpense
                  ? ((item.value / totalExpense) * 100).toFixed(0)
                  : "0";

                const selected = selectedKey === item.key;

                return (
                  <button
                    key={item.key}
                    onClick={() =>
                      setSelectedKey((prev) =>
                        prev === item.key ? null : item.key
                      )
                    }
                    className={`w-full flex items-center justify-between text-sm ${
                      selected ? "font-semibold" : ""
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="h-3 w-3 rounded-sm"
                        style={{
                          backgroundColor:
                            COLORS[index % COLORS.length],
                        }}
                      />
                      <span className="capitalize">
                        {item.name}
                      </span>
                    </div>

                    <span className="text-muted-foreground">
                      {percent}%
                    </span>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
