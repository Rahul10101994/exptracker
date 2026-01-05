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
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null); // hover
  const [lockedIndex, setLockedIndex] = React.useState<number | null>(null); // tap
  const [hiddenKeys, setHiddenKeys] = React.useState<Set<string>>(new Set());
  const [animatedTotal, setAnimatedTotal] = React.useState(0);

  React.useEffect(() => setMounted(true), []);

  /* ---------- RAW CATEGORY DATA ---------- */
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

  /* ---------- FILTERED DATA ---------- */
  const chartData = React.useMemo(
    () => rawData.filter((d) => !hiddenKeys.has(d.key)),
    [rawData, hiddenKeys]
  );

  /* ---------- TOTALS ---------- */
  const visibleTotal = React.useMemo(
    () => chartData.reduce((s, d) => s + d.value, 0),
    [chartData]
  );

  const fullTotal = React.useMemo(
    () => rawData.reduce((s, d) => s + d.value, 0),
    [rawData]
  );

  /* ---------- NEED / WANT SPLIT ---------- */
  const { needTotal, wantTotal } = React.useMemo(() => {
    let need = 0;
    let want = 0;

    currentMonthTransactions
      .filter(
        (t) =>
          t.type === "expense" &&
          !hiddenKeys.has(t.category)
      )
      .forEach((t) => {
        if (t.needWant?.toLowerCase() === "need") {
          need += Math.abs(t.amount);
        } else if (t.needWant?.toLowerCase() === "want") {
          want += Math.abs(t.amount);
        }
      });

    return { needTotal: need, wantTotal: want };
  }, [currentMonthTransactions, hiddenKeys]);

  const needPercent = visibleTotal
    ? Math.round((needTotal / visibleTotal) * 100)
    : 0;

  const wantPercent = 100 - needPercent;

  /* ---------- SMOOTH TOTAL ANIMATION ---------- */
  React.useEffect(() => {
    const startValue = animatedTotal;
    const diff = visibleTotal - startValue;
    const duration = 600;
    const startTime = performance.now();

    function animate(now: number) {
      const progress = Math.min((now - startTime) / duration, 1);
      setAnimatedTotal(Math.round(startValue + diff * progress));
      if (progress < 1) requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleTotal]);

  /* ---------- LEGEND TOGGLE ---------- */
  function toggleCategory(key: string) {
    setActiveIndex(null);
    setLockedIndex(null);
    setHiddenKeys((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  if (!mounted) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Category Breakdown</CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col items-center gap-6">
        {chartData.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-muted-foreground">
            No expense data
          </div>
        ) : (
          <>
            {/* ---------- DONUT (TAP OUTSIDE TO CLEAR) ---------- */}
            <div
              className="relative w-full max-w-[280px] aspect-square"
              onClick={() => {
                setLockedIndex(null);
                setActiveIndex(null);
              }}
            >
              <ResponsiveContainer
                width="100%"
                height="100%"
                onClick={(e) => e.stopPropagation()}
              >
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius="60%"
                    outerRadius="80%"
                    dataKey="value"
                    activeIndex={
                      lockedIndex ?? activeIndex ?? undefined
                    }
                    activeShape={ActiveShape}
                    onMouseEnter={(_, i) => {
                      if (lockedIndex === null)
                        setActiveIndex(i);
                    }}
                    onMouseLeave={() => {
                      if (lockedIndex === null)
                        setActiveIndex(null);
                    }}
                    onClick={(_, i) => {
                      setLockedIndex((prev) =>
                        prev === i ? null : i
                      );
                      setActiveIndex(null);
                    }}
                  >
                    {chartData.map((_, i) => (
                      <Cell
                        key={i}
                        fill={COLORS[i % COLORS.length]}
                      />
                    ))}
                  </Pie>

                  {/* FIXED TOOLTIP */}
                  <Tooltip
                    cursor={false}
                    formatter={(v: number) =>
                      `₹${v.toLocaleString()}`
                    }
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* ---------- CENTER LABEL ---------- */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center gap-1">
                <span className="text-xs text-muted-foreground">
                  Total Expense
                </span>

                <span className="text-lg font-bold">
                  ₹{animatedTotal.toLocaleString()}
                </span>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="text-green-600 font-medium">
                    Need {needPercent}%
                  </span>
                  <span>•</span>
                  <span className="text-orange-500 font-medium">
                    Want {wantPercent}%
                  </span>
                </div>
              </div>
            </div>

            {/* ---------- LEGEND ---------- */}
            <div className="w-full space-y-2">
              {rawData.map((item, index) => {
                const hidden = hiddenKeys.has(item.key);
                const percent = fullTotal
                  ? ((item.value / fullTotal) * 100).toFixed(0)
                  : "0";

                return (
                  <button
                    key={item.key}
                    onClick={() =>
                      toggleCategory(item.key)
                    }
                    className={`w-full flex items-center justify-between text-sm transition-opacity ${
                      hidden
                        ? "opacity-40"
                        : "opacity-100"
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
                      <span>{item.name}</span>
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
