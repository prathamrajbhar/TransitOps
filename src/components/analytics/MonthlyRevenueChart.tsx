"use client";

import React, { useState, useEffect } from "react";
import { formatCurrency } from "@/lib/utils/format";
import { TrendingUp, BarChart3, LineChart } from "lucide-react";

interface ChartItem {
  label: string;
  revenue: number;
  trips: number;
}

interface MonthlyRevenueChartProps {
  chartData: ChartItem[];
  timeFilter: "WEEKLY" | "MONTHLY" | "YEARLY";
}

export function MonthlyRevenueChart({ chartData, timeFilter }: MonthlyRevenueChartProps) {
  const [activeTooltip, setActiveTooltip] = useState<number | null>(null);
  const [chartType, setChartType] = useState<"bar" | "area">("area");
  const [animated, setAnimated] = useState(false);

  const [prevTimeFilter, setPrevTimeFilter] = useState(timeFilter);
  if (timeFilter !== prevTimeFilter) {
    setPrevTimeFilter(timeFilter);
    setAnimated(false);
  }

  useEffect(() => {
    if (!animated) {
      const timer = setTimeout(() => {
        setAnimated(true);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [animated]);

  const maxChartVal = Math.max(...chartData.map((d) => d.revenue)) || 1;

  // SVG dimensions
  const svgWidth = 600;
  const svgHeight = 240;
  const paddingLeft = 65;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 35;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  // Calculate standard Y gridline values
  const gridlineCount = 4;
  const yGridValues = Array.from(
    { length: gridlineCount + 1 },
    (_, i) => (maxChartVal / gridlineCount) * i
  );

  // Helper to format large currency numbers compactly (e.g. ₹2.6L, ₹45K)
  const formatCompactCurrency = (value: number) => {
    if (value === 0) return "₹0";
    if (value >= 100000) {
      return `₹${(value / 100000).toFixed(1).replace(/\.0$/, "")}L`;
    }
    if (value >= 1000) {
      return `₹${(value / 1000).toFixed(0)}K`;
    }
    return `₹${value}`;
  };

  // Calculate coordinates for SVG items
  const points = chartData.map((item, index) => {
    // For Area/Line Chart, spread points evenly
    const x = paddingLeft + (index / Math.max(chartData.length - 1, 1)) * chartWidth;
    const rawHeight = (item.revenue / maxChartVal) * chartHeight;
    const animatedHeight = animated ? rawHeight : 0;
    const y = paddingTop + chartHeight - animatedHeight;
    return { x, y, label: item.label, revenue: item.revenue, trips: item.trips };
  });

  // Calculate bar width and specific x coordinates for Bar Chart
  const barGap = 16;
  const totalGapsWidth = barGap * (chartData.length - 1);
  const barWidth = Math.max((chartWidth - totalGapsWidth) / chartData.length, 12);

  const barPoints = chartData.map((item, index) => {
    const x = paddingLeft + index * (barWidth + barGap);
    const rawHeight = (item.revenue / maxChartVal) * chartHeight;
    const animatedHeight = animated ? rawHeight : 0;
    const y = paddingTop + chartHeight - animatedHeight;
    return { x, y, width: barWidth, height: animatedHeight, label: item.label, revenue: item.revenue, trips: item.trips };
  });

  // Generate Area SVG path
  const areaPath = (() => {
    if (points.length === 0) return "";
    const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
    return `${linePath} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`;
  })();

  // Generate Line SVG path
  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  // Average Revenue calculation
  const totalRevenue = chartData.reduce((sum, item) => sum + item.revenue, 0);
  const avgRevenue = totalRevenue / (chartData.length || 1);
  const avgY = paddingTop + chartHeight - (avgRevenue / maxChartVal) * chartHeight;

  return (
    <div className="rounded-2xl glass-panel p-6 border border-white/60 flex flex-col justify-between hover:shadow-md transition-all duration-300">
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-extrabold text-xs text-slate-500 uppercase tracking-wider">
              {timeFilter.charAt(0) + timeFilter.slice(1).toLowerCase()} Revenue Trend
            </h3>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
              Interactive operational income breakdown
            </p>
          </div>

          {/* Toggle between Bar and Area Chart */}
          <div className="flex items-center p-0.5 bg-slate-200/50 rounded-lg border border-slate-200/30">
            <button
              onClick={() => setChartType("bar")}
              className={`p-1.5 rounded-md transition-all cursor-pointer ${
                chartType === "bar"
                  ? "bg-white text-blue-600 shadow-xs"
                  : "text-slate-400 hover:text-slate-700"
              }`}
              title="Bar Chart"
            >
              <BarChart3 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setChartType("area")}
              className={`p-1.5 rounded-md transition-all cursor-pointer ${
                chartType === "area"
                  ? "bg-white text-blue-600 shadow-xs"
                  : "text-slate-400 hover:text-slate-700"
              }`}
              title="Area Chart"
            >
              <LineChart className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* SVG Container */}
        <div className="relative w-full overflow-visible">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-auto overflow-visible select-none"
          >
            <defs>
              {/* Bar Fill Gradient */}
              <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.9" />
              </linearGradient>
              {/* Bar Fill Hover Gradient */}
              <linearGradient id="barGradHover" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#60a5fa" stopOpacity="1" />
                <stop offset="100%" stopColor="#2563eb" stopOpacity="1" />
              </linearGradient>
              {/* Area Fill Gradient */}
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
              </linearGradient>
              {/* Glow Filter */}
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Horizontal Gridlines & Y-Axis Labels */}
            {yGridValues.map((val, idx) => {
              const y = paddingTop + chartHeight - (val / maxChartVal) * chartHeight;
              return (
                <g key={idx} className="opacity-70">
                  <line
                    x1={paddingLeft}
                    y1={y}
                    x2={svgWidth - paddingRight}
                    y2={y}
                    stroke="#e2e8f0"
                    strokeDasharray="4 4"
                    strokeWidth="1"
                  />
                  <text
                    x={paddingLeft - 10}
                    y={y + 3.5}
                    textAnchor="end"
                    className="text-[9px] font-bold fill-slate-400"
                  >
                    {formatCompactCurrency(val)}
                  </text>
                </g>
              );
            })}

            {/* Render Area/Line Chart */}
            {chartType === "area" && points.length > 0 && (
              <g>
                {/* Area Path */}
                <path
                  d={areaPath}
                  fill="url(#areaGrad)"
                  className="transition-all duration-1000 ease-out"
                />

                {/* Line Stroke */}
                <path
                  d={linePath}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transition-all duration-1000 ease-out"
                />

                {/* Dot Markers */}
                {points.map((p, idx) => {
                  const isHovered = activeTooltip === idx;
                  return (
                    <circle
                      key={idx}
                      cx={p.x}
                      cy={p.y}
                      r={isHovered ? 6 : 4}
                      fill={isHovered ? "#3b82f6" : "#ffffff"}
                      stroke="#3b82f6"
                      strokeWidth={isHovered ? 3 : 2}
                      className="transition-all duration-300 cursor-pointer"
                      style={isHovered ? { filter: "url(#glow)" } : undefined}
                    />
                  );
                })}
              </g>
            )}

            {/* Render Bar Chart */}
            {chartType === "bar" &&
              barPoints.map((b, idx) => {
                const isHovered = activeTooltip === idx;
                // Draw rounded top corners for bars
                const rx = 5;
                const pathD =
                  b.height > 0
                    ? `
                    M ${b.x},${b.y + b.height}
                    V ${b.y + rx}
                    A ${rx},${rx} 0 0,1 ${b.x + rx},${b.y}
                    H ${b.x + b.width - rx}
                    A ${rx},${rx} 0 0,1 ${b.x + b.width},${b.y + rx}
                    V ${b.y + b.height}
                    Z
                  `
                    : "";

                return (
                  <path
                    key={idx}
                    d={pathD}
                    fill={isHovered ? "url(#barGradHover)" : "url(#barGrad)"}
                    className="transition-all duration-700 ease-out cursor-pointer"
                    style={isHovered ? { filter: "url(#glow)" } : undefined}
                  />
                );
              })}

            {/* Average Revenue Dotted Line */}
            {animated && (
              <g className="opacity-60 transition-all duration-1000">
                <line
                  x1={paddingLeft}
                  y1={avgY}
                  x2={svgWidth - paddingRight}
                  y2={avgY}
                  stroke="#f59e0b"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                />
                <text
                  x={svgWidth - paddingRight}
                  y={avgY - 6}
                  textAnchor="end"
                  className="text-[8px] font-black fill-amber-500 uppercase tracking-wider"
                >
                  Avg: {formatCompactCurrency(avgRevenue)}
                </text>
              </g>
            )}

            {/* Hover Vertical Guide Line */}
            {activeTooltip !== null && points[activeTooltip] && (
              <line
                x1={points[activeTooltip].x}
                y1={paddingTop}
                x2={points[activeTooltip].x}
                y2={paddingTop + chartHeight}
                stroke="#94a3b8"
                strokeWidth="1"
                strokeDasharray="2 2"
                className="pointer-events-none"
              />
            )}

            {/* X-Axis Labels */}
            {chartData.map((item, index) => {
              const x =
                chartType === "area"
                  ? paddingLeft + (index / Math.max(chartData.length - 1, 1)) * chartWidth
                  : paddingLeft + index * (barWidth + barGap) + barWidth / 2;

              return (
                <text
                  key={index}
                  x={x}
                  y={svgHeight - 10}
                  textAnchor="middle"
                  className="text-[9px] font-bold fill-slate-400"
                >
                  {item.label}
                </text>
              );
            })}

            {/* Invisible Hit Columns for Hover (UX Improvement) */}
            {chartData.map((item, index) => {
              const columnWidth = chartWidth / chartData.length;
              const x = paddingLeft + index * columnWidth;

              return (
                <rect
                  key={index}
                  x={x}
                  y={paddingTop}
                  width={columnWidth}
                  height={chartHeight}
                  fill="transparent"
                  className="cursor-pointer pointer-events-auto"
                  onMouseEnter={() => setActiveTooltip(index)}
                  onMouseLeave={() => setActiveTooltip(null)}
                />
              );
            })}
          </svg>

          {/* Floating HTML Tooltip */}
          {activeTooltip !== null && chartData[activeTooltip] && (
            <div
              className="absolute pointer-events-none bg-slate-900/90 backdrop-blur-xs text-white text-[10px] p-3 rounded-xl shadow-lg border border-slate-700/50 flex flex-col gap-1 z-40 transition-all duration-150 ease-out"
              style={{
                left: `${
                  (chartType === "area"
                    ? points[activeTooltip].x
                    : barPoints[activeTooltip].x + barWidth / 2) - 64
                }px`,
                bottom: `${svgHeight - (chartType === "area" ? points[activeTooltip].y : barPoints[activeTooltip].y) + 12}px`,
                width: "128px",
              }}
            >
              <div className="flex items-center justify-between border-b border-slate-700/50 pb-1 mb-1">
                <span className="font-extrabold text-amber-400">
                  {chartData[activeTooltip].label}
                </span>
                <span className="text-[8px] text-slate-400 font-bold">
                  {chartData[activeTooltip].trips} Trips
                </span>
              </div>
              <div className="font-black text-xs text-white">
                {formatCurrency(chartData[activeTooltip].revenue)}
              </div>
              {chartData[activeTooltip].revenue > 0 && chartData[activeTooltip].trips > 0 && (
                <div className="text-[7.5px] text-slate-300 font-semibold mt-0.5">
                  Avg/Trip: {formatCurrency(Math.round(chartData[activeTooltip].revenue / chartData[activeTooltip].trips))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Legend Indicators */}
        <div className="flex items-center justify-between text-[9px] text-slate-400 font-extrabold uppercase tracking-wider mt-4">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-blue-500/80" /> Revenue (INR)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 border-t-2 border-dashed border-amber-500" /> Timeframe Average
            </span>
          </div>
          <span className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-emerald-500" /> Max: {formatCurrency(maxChartVal)}
          </span>
        </div>
      </div>
    </div>
  );
}
