import { useCallback, useEffect, useState } from "react";
import SearchBar from "./components/SearchBar";
import WeatherCard from "./components/WeatherCard";
import ForecastCard from "./components/ForecastCard";
import HourlyChart from "./components/HourlyChart";
import AdviceBox from "./components/AdviceBox";
import AQICard from "./components/AQICard";
import "./App.css";

function App() {
  const [weather, setWeather] = useState<any>(null);
  const [forecast, setForecast] = useState<any[]>([]);
  const [hourly, setHourly] = useState<Array<{ time: string; temp: number }>>([]);
  const [aqi, setAqi] = useState<{ index: number; components?: Record<string, number> } | null>(null);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    unit: "C" as "C" | "F",
    compactView: false,
    highContrast: false,
    showAnimations: true,
  });

  const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY ?? "f5a7b01a2b7f34a2e1a7275eb8a1ae2c";

  const buildForecast = (data: any) => {
    const byDay = new Map<string, { item: any; score: number }>();

    data.list.forEach((item: any) => {
      const date = new Date(item.dt * 1000);
      const dayKey = date.toISOString().slice(0, 10);
      const score = Math.abs(date.getUTCHours() - 12);

      const existing = byDay.get(dayKey);
      if (!existing || score < existing.score) {
        byDay.set(dayKey, { item, score });
      }
    });

    return Array.from(byDay.values())
      .slice(0, 5)
      .map(({ item }) => ({
        date: new Date(item.dt * 1000),
        temp: item.main.temp,
        condition: item.weather[0]?.main ?? "",
      }));
  };

  const buildHourly = (data: any) => {
    return data.list.slice(0, 8).map((item: any) => ({
      time: new Date(item.dt * 1000).toLocaleTimeString(undefined, {
        hour: "numeric",
        minute: "2-digit",
      }),
      temp: item.main.temp,
    }));
  };

  const fetchWeatherData = useCallback(async (currentUrl: string, forecastUrl: string) => {
    setLoading(true);
    setError("");

    try {
      const [currentRes, forecastRes] = await Promise.all([fetch(currentUrl), fetch(forecastUrl)]);
      const [currentData, forecastData] = await Promise.all([currentRes.json(), forecastRes.json()]);

      if (!currentRes.ok) {
        setError(currentData.message || "Unable to fetch weather data.");
        setWeather(null);
        setForecast([]);
        setAqi(null);
        return;
      }

      setWeather(currentData);
      if (currentData?.coord?.lat != null && currentData?.coord?.lon != null) {
        try {
          const aqiRes = await fetch(
            `https://api.openweathermap.org/data/2.5/air_pollution?lat=${currentData.coord.lat}&lon=${currentData.coord.lon}&appid=${apiKey}`
          );
          const aqiData = await aqiRes.json();
          if (aqiRes.ok && aqiData?.list?.length) {
            setAqi({
              index: aqiData.list[0].main?.aqi ?? 0,
              components: aqiData.list[0].components,
            });
          } else {
            setAqi(null);
          }
        } catch {
          setAqi(null);
        }
      } else {
        setAqi(null);
      }

      if (!forecastRes.ok) {
        setError(forecastData.message || "Unable to fetch forecast data.");
        setForecast([]);
        setHourly([]);
      } else {
        setForecast(buildForecast(forecastData));
        setHourly(buildHourly(forecastData));
      }
    } catch (err) {
      setError("Network error. Please try again.");
      setWeather(null);
      setForecast([]);
      setAqi(null);
    } finally {
      setLoading(false);
    }
  }, [apiKey]);

  const fetchWeatherByCoords = useCallback(
    async (lat: number, lon: number) => {
      if (!apiKey) {
        setError("API key is missing. Add VITE_OPENWEATHER_API_KEY to your .env file.");
        return;
      }

      await fetchWeatherData(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`,
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
      );
    },
    [apiKey, fetchWeatherData]
  );

  const handleSearch = useCallback(
    async (city: string) => {
      const trimmedCity = city.trim();
      if (!trimmedCity) {
        setError("Please enter a city name.");
        setWeather(null);
        setForecast([]);
        setAqi(null);
        return;
      }

      await fetchWeatherData(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(trimmedCity)}&appid=${apiKey}&units=metric`,
        `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(trimmedCity)}&appid=${apiKey}&units=metric`
      );
    },
    [apiKey, fetchWeatherData]
  );

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser. Search manually instead.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        fetchWeatherByCoords(position.coords.latitude, position.coords.longitude);
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setError("Location access denied. Search for a city manually.");
        } else {
          setError("Unable to detect your location. Search manually instead.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  }, []);

  const getAdvice = () => {
    if (!weather?.main) return "";

    const temp = weather.main.temp;
    const humidity = weather.main.humidity;
    const condition = weather.weather[0]?.main ?? "";

    if (condition === "Rain") {
      return "Rain expected — carry an umbrella.";
    }

    if (temp <= 10) {
      return "Cold weather — wear warm clothes.";
    }

    if (temp >= 28 && humidity >= 65) {
      return "High heat and humidity — avoid outdoor activity.";
    }

    if (temp >= 30) {
      return "Stay hydrated, it's hot!";
    }

    return "Weather looks pleasant!";
  };

  const getBackgroundMode = () => {
    if (!weather?.weather?.length) return "default";

    const condition = weather.weather[0]?.main ?? "";
    const temp = weather.main?.temp ?? 0;
    const currentUtc = weather.dt ?? Math.floor(Date.now() / 1000);
    const sunrise = weather.sys?.sunrise;
    const sunset = weather.sys?.sunset;
    const rainyConditions = ["Rain", "Drizzle"];
    const cloudyConditions = ["Clouds", "Mist", "Fog", "Haze", "Smoke", "Dust", "Sand", "Ash", "Squall"];

    if (condition === "Thunderstorm") return "thunderstorm";
    if (rainyConditions.includes(condition)) return "rain";

    if (sunrise && sunset) {
      const eveningStart = sunset - 2 * 60 * 60;
      const nightStart = sunset + 60 * 60;

      if (currentUtc < sunrise || currentUtc >= nightStart) return "night";
      if (currentUtc >= eveningStart) return "evening";
      if (cloudyConditions.includes(condition)) return "cloudy";
      if (condition === "Clear" && temp >= 32) return "hot";
      if (condition === "Clear") return "sunny";
      return "day";
    }

      const localHour = new Date((currentUtc + (weather.timezone ?? 0)) * 1000).getUTCHours();

    if (localHour >= 19 || localHour < 6) return "night";
    if (localHour >= 17) return "evening";
    if (cloudyConditions.includes(condition)) return "cloudy";
    if (condition === "Clear" && temp >= 32) return "hot";
    if (condition === "Clear") return "sunny";
    return "day";
  };

  const backgroundMode = getBackgroundMode();
  const toDisplayTemp = (tempC: number) =>
    settings.unit === "F" ? Math.round((tempC * 9) / 5 + 32) : Math.round(tempC);
  const displayHourly = hourly.map((item) => ({ ...item, temp: toDisplayTemp(item.temp) }));

  return (
    <div
      className={`min-h-screen relative overflow-hidden flex flex-col items-center justify-center gap-6 p-4 transition-all duration-700 weather-page ${backgroundMode}`}
    >
      {settings.showAnimations && (
        <div className="weather-animation pointer-events-none absolute inset-0 z-0">
          <div className="sunny-effect">
            <div className="sun" />
            <div className="cloud cloud-1" />
            <div className="cloud cloud-2" />
          </div>

          <div className="rain-effect">
            {Array.from({ length: 14 }, (_, index) => (
              <span key={index} className={`raindrop drop-${index + 1}`} />
            ))}
          </div>

          <div className="thunderstorm-effect">
            <div className="storm-cloud" />
            <div className="lightning lightning-1" />
            <div className="lightning lightning-2" />
            {Array.from({ length: 18 }, (_, index) => (
              <span key={index} className={`raindrop storm-drop drop-${(index % 14) + 1}`} />
            ))}
          </div>

          <div className="night-effect">
            <div className="moon" />
            {Array.from({ length: 14 }, (_, index) => (
              <span key={index} className={`star star-${index + 1}`} />
            ))}
          </div>
        </div>
      )}

      <div className="relative z-10 w-full max-w-3xl">
        <div className="mb-4 flex items-center justify-between gap-3">
          <SearchBar onSearch={handleSearch} />
          <button
            type="button"
            onClick={() => setShowSettings((prev) => !prev)}
            className="rounded-xl border border-white/30 bg-slate-900/35 px-4 py-2 text-sm font-medium text-white backdrop-blur-md transition hover:bg-slate-800/45"
          >
            {showSettings ? "Close Settings" : "Settings"}
          </button>
        </div>

        {showSettings && (
          <div className="mb-6 grid gap-3 rounded-2xl border border-white/20 bg-slate-900/45 p-4 text-white backdrop-blur-lg sm:grid-cols-2">
            <label className="flex items-center justify-between rounded-xl bg-black/20 px-3 py-2 text-sm">
              <span>Temperature unit</span>
              <select
                value={settings.unit}
                onChange={(e) => setSettings((prev) => ({ ...prev, unit: e.target.value as "C" | "F" }))}
                className="rounded-lg bg-slate-800/80 px-2 py-1 text-sm outline-none"
              >
                <option value="C">Celsius</option>
                <option value="F">Fahrenheit</option>
              </select>
            </label>

            <label className="flex items-center justify-between rounded-xl bg-black/20 px-3 py-2 text-sm">
              <span>Compact layout</span>
              <input
                type="checkbox"
                checked={settings.compactView}
                onChange={(e) => setSettings((prev) => ({ ...prev, compactView: e.target.checked }))}
              />
            </label>

            <label className="flex items-center justify-between rounded-xl bg-black/20 px-3 py-2 text-sm">
              <span>High contrast mode</span>
              <input
                type="checkbox"
                checked={settings.highContrast}
                onChange={(e) => setSettings((prev) => ({ ...prev, highContrast: e.target.checked }))}
              />
            </label>

            <label className="flex items-center justify-between rounded-xl bg-black/20 px-3 py-2 text-sm">
              <span>Background animations</span>
              <input
                type="checkbox"
                checked={settings.showAnimations}
                onChange={(e) => setSettings((prev) => ({ ...prev, showAnimations: e.target.checked }))}
              />
            </label>
          </div>
        )}

        {loading && (
          <div className="text-white">Loading weather…</div>
        )}

        {error && (
          <div className="bg-red-500/20 text-red-100 p-4 rounded-xl">
            {error}
          </div>
        )}

        {weather?.main && (
          <>
            <WeatherCard
              temp={toDisplayTemp(weather.main.temp)}
              feelsLike={toDisplayTemp(weather.main.feels_like)}
              humidity={weather.main.humidity}
              windSpeed={weather.wind?.speed}
              pressure={weather.main.pressure}
              condition={weather.weather[0]?.main ?? "Unknown"}
              city={weather.name}
              unitSymbol={settings.unit}
              compact={settings.compactView}
              highContrast={settings.highContrast}
            />
            <AdviceBox advice={getAdvice()} />
            {aqi && (
              <div className="mt-4">
                <AQICard aqi={aqi.index} components={aqi.components} />
              </div>
            )}

            {hourly.length > 0 && (
              <div className="mt-8">
                <HourlyChart
                  data={displayHourly}
                  unitSymbol={settings.unit}
                  compact={settings.compactView}
                  highContrast={settings.highContrast}
                />
              </div>
            )}

            {forecast.length > 0 && (
              <div className="mt-8 text-white">
                <h3 className="mb-4 text-xl font-semibold">5-Day Forecast</h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                  {forecast.map((item) => (
                    <ForecastCard
                      key={item.date.toISOString()}
                      date={item.date.toLocaleDateString(undefined, {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                      temp={toDisplayTemp(item.temp)}
                      condition={item.condition}
                      unitSymbol={settings.unit}
                      compact={settings.compactView}
                      highContrast={settings.highContrast}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default App;
