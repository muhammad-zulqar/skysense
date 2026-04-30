type Props = {
  temp: number;
  feelsLike: number;
  humidity: number;
  windSpeed?: number;
  pressure: number;
  condition: string;
  city: string;
};

export default function WeatherCard({
  temp,
  feelsLike,
  humidity,
  windSpeed,
  pressure,
  condition,
  city,
}: Props) {
  return (
    <div className="bg-white/20 backdrop-blur-lg rounded-3xl p-6 text-white shadow-lg w-full max-w-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">{city}</h2>
          <p className="text-sm text-slate-200">{condition}</p>
        </div>
        <p className="text-6xl font-bold">{temp}°C</p>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 text-sm text-slate-100">
        <div className="rounded-2xl bg-slate-900/20 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-300">Feels like</p>
          <p className="mt-2 text-xl font-semibold">{feelsLike}°C</p>
        </div>
        <div className="rounded-2xl bg-slate-900/20 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-300">Humidity</p>
          <p className="mt-2 text-xl font-semibold">{humidity}%</p>
        </div>
        <div className="rounded-2xl bg-slate-900/20 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-300">Wind speed</p>
          <p className="mt-2 text-xl font-semibold">{windSpeed ?? 0} m/s</p>
        </div>
        <div className="rounded-2xl bg-slate-900/20 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-300">Pressure</p>
          <p className="mt-2 text-xl font-semibold">{pressure} hPa</p>
        </div>
      </div>
    </div>
  );
}
