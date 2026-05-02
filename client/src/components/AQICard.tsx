type Props = {
  aqi: number;
  components?: Record<string, number>;
};

const labels: Record<number, { title: string; tone: string }> = {
  1: { title: "Good", tone: "text-emerald-300" },
  2: { title: "Fair", tone: "text-lime-300" },
  3: { title: "Moderate", tone: "text-yellow-300" },
  4: { title: "Poor", tone: "text-orange-300" },
  5: { title: "Very Poor", tone: "text-red-300" },
};

function getPrimaryPollutant(components?: Record<string, number>) {
  if (!components) return null;
  const entries = Object.entries(components);
  if (!entries.length) return null;
  const [name, value] = entries.sort((a, b) => b[1] - a[1])[0];
  return { name: name.toUpperCase(), value: value.toFixed(1) };
}

export default function AQICard({ aqi, components }: Props) {
  const label = labels[aqi] ?? { title: "Unknown", tone: "text-slate-200" };
  const primary = getPrimaryPollutant(components);

  return (
    <div className="rounded-2xl border border-white/20 bg-white/10 p-4 text-white backdrop-blur-sm shadow-lg">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Air Quality</h3>
        <span className={`text-sm font-semibold ${label.tone}`}>{label.title}</span>
      </div>
      <p className="mt-2 text-sm text-slate-200">
        AQI Index: <span className="font-semibold text-white">{aqi}</span> / 5
      </p>
      {primary && (
        <p className="mt-1 text-xs text-slate-300">
          Primary pollutant: {primary.name} ({primary.value} ug/m3)
        </p>
      )}
    </div>
  );
}
