type Props = {
  date: string;
  temp: number;
  condition: string;
};

export default function ForecastCard({ date, temp, condition }: Props) {
  return (
    <div className="bg-white/10 border border-white/10 rounded-3xl p-4 text-white backdrop-blur-sm shadow-lg">
      <p className="text-xs uppercase tracking-[0.24em] text-slate-300">{date}</p>
      <p className="mt-4 text-3xl font-semibold">{Math.round(temp)}°C</p>
      <p className="mt-2 text-sm text-slate-200">{condition}</p>
    </div>
  );
}
