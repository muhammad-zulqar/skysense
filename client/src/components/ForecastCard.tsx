type Props = {
  date: string;
  temp: number;
  condition: string;
  unitSymbol: "C" | "F";
  compact?: boolean;
  highContrast?: boolean;
};

export default function ForecastCard({
  date,
  temp,
  condition,
  unitSymbol,
  compact = false,
  highContrast = false,
}: Props) {
  const classes = highContrast
    ? "bg-slate-950/80 border-slate-200/35"
    : "bg-white/10 border-white/10";

  return (
    <div className={`border rounded-3xl text-white backdrop-blur-sm shadow-lg ${compact ? "p-3" : "p-4"} ${classes}`}>
      <p className="text-xs uppercase tracking-[0.24em] text-slate-300">{date}</p>
      <p className={`${compact ? "mt-3 text-2xl" : "mt-4 text-3xl"} font-semibold`}>
        {Math.round(temp)}°{unitSymbol}
      </p>
      <p className="mt-2 text-sm text-slate-200">{condition}</p>
    </div>
  );
}
