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
};

export default function HourlyChart({ data }: Props) {
  const chartData = {
    labels: data.map((item) => item.time),
    datasets: [
      {
        label: "Temperature (°C)",
        data: data.map((item) => item.temp),
        fill: true,
        backgroundColor: "rgba(59, 130, 246, 0.18)",
        borderColor: "#60A5FA",
        pointBackgroundColor: "#ffffff",
        pointBorderColor: "#60A5FA",
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
          label: (context: any) => `${context.formattedValue}°C`,
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
    <div className="bg-white/10 border border-white/10 rounded-3xl p-4 text-white backdrop-blur-sm shadow-lg h-96">
      <h3 className="mb-4 text-xl font-semibold">Hourly Forecast</h3>
      <div className="h-full">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}
