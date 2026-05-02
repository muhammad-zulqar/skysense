type Props = {
  temp: number;
  feelsLike: number;
  humidity: number;
  windSpeed?: number;
  pressure: number;
  condition: string;
  city: string;
  unitSymbol: "C" | "F";
  compact?: boolean;
  highContrast?: boolean;
};

export default function WeatherCard({
  temp,
  feelsLike,
  humidity,
  windSpeed,
  pressure,
  condition,
  city,
  unitSymbol,
  compact = false,
  highContrast = false,
}: Props) {
  const cardClasses = highContrast
    ? "bg-slate-950/85 border border-slate-200/40"
    : "bg-white/20";
  const metricCardClasses = highContrast ? "bg-black/40" : "bg-slate-900/20";

  return (
    <div
      className={`backdrop-blur-lg rounded-3xl text-white shadow-lg w-full max-w-md ${compact ? "p-4" : "p-6"} ${cardClasses}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">{city}</h2>
          <p className="text-sm text-slate-200">{condition}</p>
        </div>
        <p className={`${compact ? "text-5xl" : "text-6xl"} font-bold`}>{temp}°{unitSymbol}</p>
      </div>

      <div className={`grid grid-cols-2 text-sm text-slate-100 ${compact ? "mt-4 gap-3" : "mt-6 gap-4"}`}>
        <div className={`rounded-2xl p-4 ${metricCardClasses}`}>
          <p className="text-xs uppercase tracking-wide text-slate-300">Feels like</p>
          <p className="mt-2 text-xl font-semibold">{feelsLike}°{unitSymbol}</p>
        </div>
        <div className={`rounded-2xl p-4 ${metricCardClasses}`}>
          <p className="text-xs uppercase tracking-wide text-slate-300">Humidity</p>
          <p className="mt-2 text-xl font-semibold">{humidity}%</p>
        </div>
        <div className={`rounded-2xl p-4 ${metricCardClasses}`}>
          <p className="text-xs uppercase tracking-wide text-slate-300">Wind speed</p>
          <p className="mt-2 text-xl font-semibold">{windSpeed ?? 0} m/s</p>
        </div>
        <div className={`rounded-2xl p-4 ${metricCardClasses}`}>
          <p className="text-xs uppercase tracking-wide text-slate-300">Pressure</p>
          <p className="mt-2 text-xl font-semibold">{pressure} hPa</p>
        </div>
      </div>
    </div>
  );
}
