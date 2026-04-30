import { useCallback, useEffect, useState } from "react";
import SearchBar from "./components/SearchBar";
import WeatherCard from "./components/WeatherCard";
import ForecastCard from "./components/ForecastCard";
import HourlyChart from "./components/HourlyChart";
import AdviceBox from "./components/AdviceBox";
import "./App.css";

function App() {
  const [weather, setWeather] = useState<any>(null);
  const [forecast, setForecast] = useState<any[]>([]);
  const [hourly, setHourly] = useState<Array<{ time: string; temp: number }>>([]);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

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
        return;
      }

      setWeather(currentData);

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
    } finally {
      setLoading(false);
    }
  }, []);

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

    const condition = weather.weather[0].main;
    const currentUtc = Math.floor(Date.now() / 1000);
    const sunrise = weather.sys?.sunrise;
    const sunset = weather.sys?.sunset;
    const isNight = sunrise && sunset ? currentUtc < sunrise || currentUtc > sunset : false;

    if (isNight) return "night";
    if (condition === "Clear") return "sunny";
    if (["Rain", "Drizzle", "Thunderstorm"].includes(condition)) return "rain";
    return "default";
  };

  const backgroundMode = getBackgroundMode();

  return (
    <div className={`min-h-screen relative overflow-hidden flex flex-col items-center justify-center gap-6 p-4 transition-all duration-700 weather-page ${backgroundMode}`}>
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

        <div className="night-effect">
          <div className="moon" />
          {Array.from({ length: 14 }, (_, index) => (
            <span key={index} className={`star star-${index + 1}`} />
          ))}
        </div>
      </div>

      <div className="relative z-10 w-full max-w-3xl">
        <SearchBar onSearch={handleSearch} />

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
              temp={weather.main.temp}
              feelsLike={weather.main.feels_like}
              humidity={weather.main.humidity}
              windSpeed={weather.wind?.speed}
              pressure={weather.main.pressure}
              condition={weather.weather[0]?.main ?? "Unknown"}
              city={weather.name}
            />
            <AdviceBox advice={getAdvice()} />

            {hourly.length > 0 && (
              <div className="mt-8">
                <HourlyChart data={hourly} />
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
                      temp={item.temp}
                      condition={item.condition}
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
