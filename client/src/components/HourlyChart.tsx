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
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

type Props = {
  data: Array<{ time: string; temp: number }>;
  unitSymbol: "C" | "F";
  compact?: boolean;
  highContrast?: boolean;
};

export default function HourlyChart({ data, unitSymbol, compact = false, highContrast = false }: Props) {
  const lineColor = highContrast ? "#f8fafc" : "#60A5FA";
  const fillColor = highContrast ? "rgba(241, 245, 249, 0.2)" : "rgba(59, 130, 246, 0.18)";
  const cardClasses = highContrast ? "bg-slate-950/80 border-slate-200/35" : "bg-white/10 border-white/10";

  const chartData = {
    labels: data.map((item) => item.time),
    datasets: [
      {
        label: `Temperature (°${unitSymbol})`,
        data: data.map((item) => item.temp),
        fill: true,
        backgroundColor: fillColor,
        borderColor: lineColor,
        pointBackgroundColor: "#ffffff",
        pointBorderColor: lineColor,
        tension: 0.35,
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => `${context.formattedValue}°${unitSymbol}`,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "#e2e8f0",
        },
      },
      y: {
        grid: {
          color: "rgba(148, 163, 184, 0.2)",
          borderDash: [4, 4],
        },
        ticks: {
          color: "#e2e8f0",
        },
      },
    },
  };

  return (
    <div
      className={`border rounded-3xl text-white backdrop-blur-sm shadow-lg ${compact ? "p-3 h-80" : "p-4 h-96"} ${cardClasses}`}
    >
      <h3 className={`${compact ? "mb-3 text-lg" : "mb-4 text-xl"} font-semibold`}>Hourly Forecast</h3>
      <div className="h-full">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}
