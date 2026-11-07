// Weather helper. Uses the free Open-Meteo API (no API key needed).
// If there is no internet, it falls back to sample data so the project never breaks.
const cache = new Map();
const DEFAULT_PLACE = { lat: 11.0168, lon: 76.9558, name: 'Coimbatore' };

const CODES = {
  0: ['Clear sky', '☀️'], 1: ['Mainly clear', '🌤️'], 2: ['Partly cloudy', '⛅'], 3: ['Overcast', '☁️'],
  45: ['Foggy', '🌫️'], 48: ['Foggy', '🌫️'], 51: ['Light drizzle', '🌦️'], 53: ['Drizzle', '🌦️'],
  55: ['Heavy drizzle', '🌧️'], 61: ['Light rain', '🌧️'], 63: ['Rain', '🌧️'], 65: ['Heavy rain', '🌧️'],
  80: ['Rain showers', '🌦️'], 81: ['Rain showers', '🌧️'], 82: ['Violent showers', '⛈️'],
  95: ['Thunderstorm', '⛈️'], 96: ['Thunderstorm & hail', '⛈️'], 99: ['Thunderstorm & hail', '⛈️'],
};
const describe = (code) => CODES[code] || ['Cloudy', '☁️'];

async function fetchJson(url) {
  const res = await fetch(url, { signal: AbortSignal.timeout(7000) });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  return res.json();
}

async function geocode(name) {
  if (!name) return DEFAULT_PLACE;
  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=1&countryCode=IN`;
    const data = await fetchJson(url);
    const r = data.results && data.results[0];
    if (r) return { lat: r.latitude, lon: r.longitude, name: r.name };
  } catch (e) { /* ignore, use default */ }
  return DEFAULT_PLACE;
}

async function live(place) {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${place.lat}&longitude=${place.lon}` +
    `&current=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation,weather_code` +
    `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,weather_code` +
    `&timezone=auto&forecast_days=7`;
  const d = await fetchJson(url);
  const [text, icon] = describe(d.current.weather_code);
  return {
    source: 'live',
    place: place.name,
    current: {
      temp: Math.round(d.current.temperature_2m),
      humidity: Math.round(d.current.relative_humidity_2m),
      wind: Math.round(d.current.wind_speed_10m),
      rain: d.current.precipitation,
      text, icon,
    },
    daily: d.daily.time.map((date, i) => {
      const [t, ic] = describe(d.daily.weather_code[i]);
      return {
        date,
        max: Math.round(d.daily.temperature_2m_max[i]),
        min: Math.round(d.daily.temperature_2m_min[i]),
        rain: Math.round((d.daily.precipitation_sum[i] || 0) * 10) / 10,
        prob: d.daily.precipitation_probability_max[i] || 0,
        text: t, icon: ic,
      };
    }),
  };
}

function sample(placeName) {
  const today = new Date();
  const daily = [];
  const rainPlan = [0, 0, 2, 14, 6, 0, 0];
  for (let i = 0; i < 7; i++) {
    const d = new Date(today.getTime() + i * 864e5);
    const rain = rainPlan[i];
    const [text, icon] = describe(rain > 10 ? 63 : rain > 0 ? 61 : 1);
    daily.push({
      date: d.toISOString().slice(0, 10),
      max: 33 - (rain > 0 ? 3 : 0), min: 23, rain, prob: rain ? 70 : 10, text, icon,
    });
  }
  return {
    source: 'sample',
    place: placeName || DEFAULT_PLACE.name,
    current: { temp: 30, humidity: 72, wind: 12, rain: 0, text: 'Partly cloudy', icon: '⛅' },
    daily,
  };
}

// Weather based alerts for the next 3 days
function buildAlerts(w) {
  const alerts = [];
  const next = w.daily.slice(0, 3);
  const rain3 = next.reduce((s, d) => s + d.rain, 0);

  if (next.some((d) => d.rain >= 40) || rain3 >= 60)
    alerts.push({ level: 'danger', icon: '🌊', title: 'Heavy rain warning', message: `About ${Math.round(rain3)} mm rain expected in 3 days. Open drainage channels, delay spraying and harvest ripe crops early.` });
  else if (next.some((d) => d.rain >= 10))
    alerts.push({ level: 'warning', icon: '🌧️', title: 'Rain expected', message: 'Good rain is coming. Skip irrigation and postpone fertilizer or pesticide spraying.' });

  if (next.some((d) => d.max >= 40))
    alerts.push({ level: 'danger', icon: '🔥', title: 'Heat wave alert', message: 'Temperature may cross 40°C. Irrigate in the early morning or evening and use mulching.' });
  else if (next.some((d) => d.max >= 36))
    alerts.push({ level: 'warning', icon: '🌡️', title: 'High temperature', message: 'Hot days ahead. Crops will need extra water, avoid midday field work.' });

  if (next.some((d) => d.min <= 4))
    alerts.push({ level: 'warning', icon: '❄️', title: 'Frost / cold alert', message: 'Very low night temperature. Cover young plants and give light irrigation in the evening.' });

  if (w.current.wind >= 40)
    alerts.push({ level: 'warning', icon: '💨', title: 'Strong wind', message: 'Strong winds today. Support tall crops (banana, sugarcane, maize) and avoid spraying.' });

  if (w.current.humidity >= 85 && w.current.temp >= 20 && w.current.temp <= 32)
    alerts.push({ level: 'info', icon: '🍄', title: 'High humidity', message: 'Humid and warm weather favours fungal diseases. Check leaves for spots this week.' });

  if (!alerts.length)
    alerts.push({ level: 'success', icon: '✅', title: 'No weather threat', message: 'Weather looks safe for farm work in the next 3 days.' });
  return alerts;
}

async function getWeather(placeName) {
  const key = (placeName || 'default').toLowerCase();
  const hit = cache.get(key);
  if (hit && Date.now() - hit.time < 15 * 60 * 1000) return hit.data;

  let data;
  try {
    data = await live(await geocode(placeName));
  } catch (e) {
    data = sample(placeName);
  }
  data.alerts = buildAlerts(data);
  cache.set(key, { time: Date.now(), data });
  return data;
}

module.exports = { getWeather, buildAlerts };
