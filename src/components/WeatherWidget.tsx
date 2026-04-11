"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface WeatherData {
  tempF: string;
  feelsLikeF: string;
  description: string;
}

const CACHE_KEY = "rendition_weather";
const CACHE_DURATION_MS = 30 * 60 * 1000; // 30 minutes

function getWeatherEmoji(desc: string): string {
  const d = desc.toLowerCase();
  if (d.includes("thunder")) return "⛈️";
  if (d.includes("snow") || d.includes("blizzard") || d.includes("sleet"))
    return "❄️";
  if (d.includes("rain") || d.includes("drizzle") || d.includes("shower"))
    return "🌧️";
  if (d.includes("fog") || d.includes("mist") || d.includes("haze"))
    return "🌫️";
  if (d.includes("partly cloudy") || d.includes("partly")) return "⛅";
  if (d.includes("cloudy") || d.includes("overcast")) return "☁️";
  if (d.includes("sunny") || d.includes("clear")) return "☀️";
  return "🌤️";
}

function getDateSuggestion(tempF: number, desc: string): string {
  const d = desc.toLowerCase();
  const isRainy =
    d.includes("rain") || d.includes("drizzle") || d.includes("thunder");
  const isSnowy = d.includes("snow") || d.includes("blizzard");

  if (isRainy) return "Cozy indoor night";
  if (isSnowy && tempF < 30) return "Hot cocoa & movie night";
  if (isSnowy) return "Snowy stroll, then warm up together";
  if (tempF >= 70 && tempF <= 85) return "Perfect patio weather";
  if (tempF > 85) return "Find somewhere with AC";
  if (tempF >= 50 && tempF < 70) return "Great night for a canyon walk";
  if (tempF >= 32 && tempF < 50) return "Bundle up for a walk";
  return "Stay warm — indoor date night";
}

export default function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchWeather() {
      // Check sessionStorage cache
      try {
        const cached = sessionStorage.getItem(CACHE_KEY);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_DURATION_MS) {
            setWeather(data);
            setLoading(false);
            return;
          }
        }
      } catch {
        // Ignore cache read errors
      }

      try {
        const res = await fetch("https://wttr.in/Provo,UT?format=j1");
        if (!res.ok) throw new Error("Weather fetch failed");
        const json = await res.json();
        const condition = json.current_condition[0];
        const data: WeatherData = {
          tempF: condition.temp_F,
          feelsLikeF: condition.FeelsLikeF,
          description: condition.weatherDesc[0].value,
        };

        // Cache the result
        try {
          sessionStorage.setItem(
            CACHE_KEY,
            JSON.stringify({ data, timestamp: Date.now() })
          );
        } catch {
          // Ignore cache write errors
        }

        setWeather(data);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchWeather();
  }, []);

  if (error) return null;

  if (loading) {
    return (
      <div className="inline-flex items-center gap-2 rounded-xl border border-border bg-bg-card px-3 py-1.5">
        <div className="h-4 w-4 animate-pulse rounded-full bg-text-muted/20" />
        <div className="h-3 w-16 animate-pulse rounded bg-text-muted/20" />
        <div className="h-3 w-28 animate-pulse rounded bg-text-muted/20" />
      </div>
    );
  }

  if (!weather) return null;

  const tempNum = parseInt(weather.tempF, 10);
  const emoji = getWeatherEmoji(weather.description);
  const suggestion = getDateSuggestion(tempNum, weather.description);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="inline-flex items-center gap-2 rounded-xl border border-border bg-bg-card px-3 py-1.5"
    >
      <span className="text-sm" aria-hidden="true">
        {emoji}
      </span>
      <span className="text-sm font-bold text-text-primary">
        {weather.tempF}°F
      </span>
      <span className="text-xs text-text-muted">{suggestion}</span>
    </motion.div>
  );
}
