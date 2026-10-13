"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement,
  type TooltipItem,
  type ChartOptions,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement,
);

interface MonthlyDataPoint {
  label: string;
  enrollments: number;
  revenue: number;
}

interface LineChartProps {
  data: MonthlyDataPoint[];
  metric: "enrollments" | "revenue";
  className?: string;
}

const metricConfig = {
  enrollments: {
    label: "Enrollments",
    color: "rgb(99, 102, 241)",
    backgroundColor: "rgba(99, 102, 241, 0.1)",
    borderColor: "rgb(99, 102, 241)",
    yAxisLabel: "Number of Enrollments",
  },
  revenue: {
    label: "Revenue (₹)",
    color: "rgb(16, 185, 129)",
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    borderColor: "rgb(16, 185, 129)",
    yAxisLabel: "Revenue (₹)",
  },
};

export function MonthlyProgressLineChart({
  data,
  metric,
  className = "",
}: LineChartProps) {
  const config = metricConfig[metric];

  const chartData = {
    labels: data.map((d) => d.label),
    datasets: [
      {
        label: config.label,
        data: data.map((d) => d[metric]),
        fill: true,
        backgroundColor: config.backgroundColor,
        borderColor: config.borderColor,
        borderWidth: 2.5,
        pointBackgroundColor: config.borderColor,
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: config.borderColor,
        pointHoverBorderColor: "#ffffff",
        pointHoverBorderWidth: 2,
        tension: 0.35,
      },
    ],
  };

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(15, 23, 42, 0.95)",
        titleColor: "#ffffff",
        bodyColor: "#ffffff",
        borderColor: "rgba(148, 163, 184, 0.2)",
        borderWidth: 1,
        padding: 14,
        cornerRadius: 10,
        displayColors: false,
        titleFont: {
          size: 13,
          weight: 600,
          family: "Inter, system-ui, sans-serif",
        },
        bodyFont: {
          size: 14,
          weight: 500,
          family: "Inter, system-ui, sans-serif",
        },
        callbacks: {
          label: (context: TooltipItem<"line">) => {
            const value = context.parsed.y ?? 0;
            if (metric === "revenue") {
              return `₹${value.toLocaleString()}`;
            }
            return `${value.toLocaleString()} enrollments`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "#94a3b8",
          font: {
            size: 11,
            weight: 500,
            family: "Inter, system-ui, sans-serif",
          },
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 12,
        },
        border: {
          display: false,
        },
      },
      y: {
        grid: {
          color: "rgba(148, 163, 184, 0.1)",
          lineWidth: 1,
        },
        ticks: {
          color: "#94a3b8",
          font: {
            size: 11,
            weight: 500,
            family: "Inter, system-ui, sans-serif",
          },
          callback: (value: number | string) => {
            const numValue = typeof value === "number" ? value : Number(value);
            if (metric === "revenue") {
              if (numValue >= 100000) return `₹${(numValue / 100000).toFixed(1)}L`;
              if (numValue >= 1000) return `₹${(numValue / 1000).toFixed(0)}K`;
              return `₹${numValue}`;
            }
            return numValue;
          },
          stepSize: undefined,
        },
        border: {
          display: false,
        },
        beginAtZero: true,
        title: {
          display: true,
          text: config.yAxisLabel,
          color: "#64748b",
          font: {
            size: 11,
            weight: 600,
            family: "Inter, system-ui, sans-serif",
          },
          padding: { top: 8, bottom: 16 },
        },
      },
    },
    animation: {
      duration: 800,
      easing: "easeOutQuart" as const,
    },
    layout: {
      padding: {
        top: 8,
        right: 16,
        bottom: 8,
        left: 8,
      },
    },
  };

  return (
    <div className={`relative h-72 w-full ${className}`}>
      <Line data={chartData} options={options} />
    </div>
  );
}

interface ChartCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function ChartCard({
  title,
  description,
  children,
  action,
  className = "",
}: ChartCardProps) {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-white ${className}`}>
      <div className="border-b border-slate-200 px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{title}</h2>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}