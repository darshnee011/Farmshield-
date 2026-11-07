// "Smart" logic of FarmShield: pest-risk prediction, irrigation advice,
// plant-disease image analysis and the AI crop assistant.
// Everything is rule based (easy to understand and explain in a viva) - no paid AI key needed.

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const monthText = (arr = []) => (arr.length ? arr.map((m) => MONTHS[m - 1]).join(', ') : '-');
const daysBetween = (a, b) => Math.floor((new Date(b) - new Date(a)) / 864e5);
const money = (n) => '₹' + Number(n).toLocaleString('en-IN');

/* ------------------------------------------------------------------ */
/* 1. PEST RISK PREDICTION                                             */
/* ------------------------------------------------------------------ */
function pestRisk(crops, infoMap, weather) {
  const temp = weather.current.temp;
  const humidity = weather.current.humidity;
  const rainyDays = weather.daily.filter((d) => d.rain >= 2).length;
  const result = [];

  crops.forEach((crop) => {
    const info = infoMap[crop.cropName];
    if (!info) return;
    info.pests.forEach((p) => {
      let score = 0;
      const why = [];
      if (temp >= p.minTemp && temp <= p.maxTemp) {
        score += 40;
        why.push(`Temperature ${temp}°C is ideal for this pest (${p.minTemp}-${p.maxTemp}°C)`);
      } else if (temp >= p.minTemp - 3 && temp <= p.maxTemp + 3) {
        score += 15;
        why.push(`Temperature ${temp}°C is close to its comfortable range`);
      }
      if (humidity >= p.minHumidity) {
        score += 35;
        why.push(`Humidity ${humidity}% is above ${p.minHumidity}% which helps it spread`);
      }
      if (rainyDays >= 2) {
        score += 15;
        why.push(`Rain expected on ${rainyDays} of the next 7 days`);
      }
      // young crops are more sensitive
      const age = daysBetween(crop.sowingDate, new Date());
      if (age >= 0 && age <= 45) {
        score += 10;
        why.push('Young crop stage is more sensitive');
      }
      const level = score >= 70 ? 'High' : score >= 40 ? 'Medium' : 'Low';
      result.push({
        crop: crop.cropName, emoji: info.emoji, pest: p.name, score, level,
        why, symptoms: p.symptoms, control: p.control,
      });
    });
  });
  return result.sort((a, b) => b.score - a.score);
}

/* ------------------------------------------------------------------ */
/* 2. SMART IRRIGATION                                                 */
/* ------------------------------------------------------------------ */
function irrigationPlan(crops, infoMap, weather) {
  const today = new Date();
  const rainSoon = weather.daily.slice(0, 2).reduce((s, d) => s + d.rain, 0);
  const maxToday = weather.daily[0] ? weather.daily[0].max : weather.current.temp;

  return crops.map((crop) => {
    const info = infoMap[crop.cropName];
    if (!info) return { cropId: crop._id, cropName: crop.cropName, action: 'No data', reasons: ['Crop information not available'] };

    const age = Math.max(0, daysBetween(crop.sowingDate, today));
    const pct = age / (info.durationDays || 120);
    let stage = 'Seedling', factor = 0.6;
    if (pct >= 1) { stage = 'Ready for harvest'; factor = 0.3; }
    else if (pct >= 0.75) { stage = 'Maturity'; factor = 0.6; }
    else if (pct >= 0.5) { stage = 'Flowering / fruiting'; factor = 1.2; }
    else if (pct >= 0.2) { stage = 'Vegetative growth'; factor = 1.0; }

    const reasons = [];
    let interval = info.irrigationIntervalDays || 7;
    const soil = crop.soilType || '';
    if (/sand/i.test(soil)) { interval -= 1; reasons.push('Sandy soil drains fast, so water more often'); }
    if (/clay/i.test(soil)) { interval += 1; reasons.push('Clay soil holds water longer'); }
    if (maxToday >= 36) { interval -= 1; reasons.push(`Hot weather (${maxToday}°C) increases water loss`); }
    interval = Math.max(1, interval);

    const last = crop.lastIrrigated || crop.sowingDate;
    const sinceLast = Math.max(0, daysBetween(last, today));
    const left = interval - sinceLast;

    let action, level;
    if (pct >= 1) { action = 'Stop irrigation - harvest time'; level = 'info'; }
    else if (rainSoon >= 8) { action = 'Skip irrigation - rain coming'; level = 'info'; reasons.unshift(`About ${Math.round(rainSoon)} mm rain expected in the next 2 days`); }
    else if (left <= 0) { action = 'Irrigate today'; level = 'danger'; reasons.unshift(`Last watered ${sinceLast} day(s) ago (every ${interval} days is ideal)`); }
    else if (left === 1) { action = 'Irrigate tomorrow'; level = 'warning'; reasons.unshift('Next watering is due tomorrow'); }
    else { action = `No need now - next in ${left} days`; level = 'success'; reasons.unshift('Soil moisture should still be fine'); }

    const mm = Math.round((info.waterNeedMmPerWeek || 30) * factor * (interval / 7));
    const liters = Math.round(mm * 4046 * (crop.area || 1)); // 1 mm on 1 acre = 4046 litres
    const next = new Date(new Date(last).getTime() + interval * 864e5);

    return {
      cropId: crop._id, cropName: crop.cropName, emoji: info.emoji, stage,
      action, level, interval, nextDate: next, waterMm: mm, waterLiters: liters,
      area: crop.area, reasons,
    };
  });
}

/* ------------------------------------------------------------------ */
/* 3. PLANT DISEASE IMAGE ANALYSIS                                     */
/* The browser looks at the leaf colours (green / yellow / brown /     */
/* dark / white percentage) and sends them here to be interpreted.     */
/* ------------------------------------------------------------------ */
const DISEASES = {
  healthy: {
    name: 'Healthy leaf', severity: 'None',
    cause: 'The leaf is mostly green with no strong spots.',
    treatment: ['No treatment needed.', 'Keep regular irrigation and balanced fertilizer.'],
    prevention: ['Scout the field once a week.', 'Remove weeds that can host pests.'],
  },
  blight: {
    name: 'Leaf spot / blight (fungal)', severity: 'High',
    cause: 'Brown or dark patches usually come from fungal or bacterial infection, often after wet weather.',
    treatment: ['Remove and burn badly affected leaves.', 'Spray Mancozeb 2.5 g/L or Copper oxychloride 3 g/L (check label).', 'Avoid overhead irrigation.'],
    prevention: ['Use disease-free seed.', 'Keep proper spacing for air movement.', 'Rotate crops every season.'],
  },
  chlorosis: {
    name: 'Yellowing - nutrient deficiency or virus', severity: 'Medium',
    cause: 'Yellow leaves often mean nitrogen/iron deficiency, waterlogging, or a viral disease spread by whiteflies.',
    treatment: ['Apply nitrogen (urea 1% foliar spray) if the lower leaves are yellow.', 'Improve drainage if the field is waterlogged.', 'If leaves are curled / mottled, control whiteflies with yellow sticky traps and neem oil 5 ml/L.'],
    prevention: ['Do a soil test every year (Soil Health Card).', 'Use organic manure along with fertilizer.'],
  },
  mildew: {
    name: 'Powdery mildew (white coating)', severity: 'Medium',
    cause: 'White powdery growth appears in dry days with cool nights and high humidity.',
    treatment: ['Spray wettable sulphur 2 g/L or Hexaconazole 1 ml/L.', 'Remove heavily infected leaves.'],
    prevention: ['Avoid dense planting.', 'Water in the morning so leaves dry quickly.'],
  },
  stress: {
    name: 'Mixed symptoms - possible water / heat stress', severity: 'Low',
    cause: 'The colours are mixed. It may be heat, water stress or early disease.',
    treatment: ['Check soil moisture and irrigate if dry.', 'Take a clearer close-up photo of a single leaf and scan again.', 'Report the problem to the admin for an expert opinion.'],
    prevention: ['Mulch the soil to keep moisture.', 'Avoid fertilizer in extreme heat.'],
  },
};

function diagnose(ratios, cropName, info) {
  const r = { green: 0, yellow: 0, brown: 0, dark: 0, white: 0, ...ratios };
  const scores = {
    healthy: Math.max(0, r.green - 2 * (r.brown + r.dark + r.yellow) + 10),
    blight: (r.brown * 1.3 + r.dark * 0.9),
    chlorosis: r.yellow * 1.5,
    mildew: r.white > 12 ? r.white * 1.6 : 0,
    stress: 8,
  };
  if (r.green >= 70 && r.brown + r.dark < 8 && r.yellow < 12) scores.healthy += 60;
  const sum = Object.values(scores).reduce((a, b) => a + b, 0) || 1;
  const ranked = Object.entries(scores)
    .map(([key, s]) => ({ key, confidence: Math.round((s / sum) * 100) }))
    .sort((a, b) => b.confidence - a.confidence);

  const top = ranked[0];
  const d = DISEASES[top.key];
  const cropPests = info && info.pests.length
    ? `Common problems of ${cropName}: ${info.pests.map((p) => p.name).join(', ')}.`
    : '';
  return {
    result: d.name, severity: d.severity, confidence: Math.min(95, Math.max(40, top.confidence + 30)),
    cause: d.cause, treatment: d.treatment, prevention: d.prevention,
    otherPossibilities: ranked.slice(1, 3).filter((x) => x.confidence >= 10).map((x) => DISEASES[x.key].name),
    cropNote: cropPests,
    disclaimer: 'This is an indicative result from leaf colour analysis. For serious cases, report a problem to the admin or visit your nearest Krishi Vigyan Kendra.',
  };
}

/* ------------------------------------------------------------------ */
/* 4. AI CROP ASSISTANT (keyword / intent based chatbot)               */
/* ------------------------------------------------------------------ */
const ALIASES = { paddy: 'rice', corn: 'maize', peanut: 'groundnut', chili: 'chilli', chillies: 'chilli', tomatoes: 'tomato', potatoes: 'potato', onions: 'onion', 'sugar cane': 'sugarcane', dhan: 'rice', gehu: 'wheat', nel: 'rice', arisi: 'rice' };

function findCrop(q, infoList) {
  let text = q;
  Object.entries(ALIASES).forEach(([a, b]) => { text = text.replace(new RegExp('\\b' + a + '\\b', 'g'), b); });
  // whole-word match, so the word "price" does not match the crop "rice"
  return infoList.find((i) => new RegExp('\\b' + i.name.toLowerCase() + '\\b').test(text));
}

function assistant(message, ctx) {
  const q = (message || '').toLowerCase().trim();
  const { user, crops, infoList, infoMap, prices, schemes, weather } = ctx;
  const info = findCrop(q, infoList);
  const has = (re) => re.test(q);
  const suggestions = ['What is the weather today?', 'When to irrigate my crops?', 'Pest risk for my crops', 'Price of tomato', 'Which government schemes can I apply?'];

  if (!q) return { reply: 'Please type your question, for example "How to grow rice?"', suggestions };

  if (has(/^(hi|hello|hey|vanakkam|namaste|namaskar)\b/))
    return { reply: `Hello ${user.name.split(' ')[0]}! 👋 I am your FarmShield assistant. Ask me about crops, weather, pests, irrigation, market prices or government schemes.`, suggestions };

  if (has(/weather|rain|temperature|forecast|mausam|mazhai|climate/)) {
    const c = weather.current;
    let r = `${c.icon} **Weather in ${weather.place}**: ${c.temp}°C, ${c.text}, humidity ${c.humidity}%, wind ${c.wind} km/h.\n`;
    const next = weather.daily.slice(1, 4).map((d) => `${d.date.slice(5)}: ${d.min}-${d.max}°C, rain ${d.rain} mm`).join('\n');
    r += `\nNext days:\n${next}\n\n`;
    r += weather.alerts.map((a) => `${a.icon} ${a.title}: ${a.message}`).join('\n');
    return { reply: r, suggestions };
  }

  if (has(/irrigat|water|paani|thanni|sinchai/)) {
    const list = info ? crops.filter((c) => c.cropName === info.name) : crops;
    if (!list.length) {
      if (info) return { reply: `${info.emoji} **${info.name}** needs watering about every ${info.irrigationIntervalDays} days (~${info.waterNeedMmPerWeek} mm per week). Register it under "My Crops" to get a personal schedule.`, suggestions };
      return { reply: 'You have not registered any crop yet. Add a crop in "My Crops" and I will prepare your irrigation schedule.', suggestions };
    }
    const plans = irrigationPlan(list, infoMap, weather);
    return { reply: '💧 **Irrigation advice**\n' + plans.map((p) => `${p.emoji || ''} ${p.cropName} (${p.stage}): ${p.action}${p.waterLiters ? ` - about ${p.waterLiters.toLocaleString('en-IN')} litres` : ''}`).join('\n'), suggestions };
  }

  if (has(/pest|insect|bug|worm|attack|keet|poochi/)) {
    if (info) {
      const own = crops.find((c) => c.cropName === info.name);
      let r = `🐛 **Pests of ${info.name}**\n` + info.pests.map((p) => `• ${p.name}: ${p.symptoms}\n  Control: ${p.control}`).join('\n');
      if (own) {
        const top = pestRisk([own], infoMap, weather)[0];
        if (top) r += `\n\n⚠️ Current highest risk on your ${info.name}: ${top.pest} (${top.level}).`;
      }
      return { reply: r, suggestions };
    }
    const risks = pestRisk(crops, infoMap, weather).slice(0, 4);
    if (!risks.length) return { reply: 'Register your crops first and I can predict pest risk from the weather. You can also ask "pests of tomato".', suggestions };
    return { reply: '🐛 **Pest risk this week**\n' + risks.map((r) => `${r.emoji} ${r.crop} - ${r.pest}: ${r.level} risk\n  Control: ${r.control}`).join('\n'), suggestions };
  }

  if (has(/price|rate|market|mandi|sell|bhav|vilai/)) {
    let list = prices;
    if (info) list = prices.filter((p) => p.crop === info.name);
    if (!list.length) return { reply: 'I could not find a market price for that crop yet.', suggestions };
    return { reply: '💰 **Market prices (per quintal)**\n' + list.slice(0, 6).map((p) => {
      const ch = p.previousPrice ? (((p.price - p.previousPrice) / p.previousPrice) * 100).toFixed(1) : null;
      return `• ${p.crop} @ ${p.market}: ${money(p.price)}${ch !== null ? ` (${ch >= 0 ? '▲' : '▼'} ${Math.abs(ch)}%)` : ''}`;
    }).join('\n'), suggestions };
  }

  if (has(/scheme|subsid|loan|insurance|government|govt|yojana|kisan credit|pm-?kisan/)) {
    let list = schemes;
    const word = ['insurance', 'loan', 'credit', 'irrigation', 'solar', 'soil', 'market'].find((w) => q.includes(w));
    if (word) { const f = schemes.filter((s) => (s.title + s.description + s.category).toLowerCase().includes(word)); if (f.length) list = f; }
    return { reply: '🏛️ **Government schemes**\n' + list.slice(0, 4).map((s) => `• ${s.title}: ${s.benefit || s.description}`).join('\n') + '\n\nOpen the "Government Schemes" page for eligibility and links.', suggestions };
  }

  if (has(/fertili|manure|urea|npk|nutrient|khad/) && info)
    return { reply: `🧪 **Fertilizer for ${info.name}**\n${info.fertilizer}`, suggestions };

  if (has(/when|sow|plant|season|harvest|month|calendar|time/) && info)
    return { reply: `📅 **${info.name}** (${info.season})\n• Best sowing months: ${monthText(info.sowingMonths)}\n• Harvest months: ${monthText(info.harvestMonths)}\n• Crop duration: about ${info.durationDays} days`, suggestions };

  if (has(/disease|spot|yellow|wilt|blight|leaf|rot|fungus|fungal/))
    return { reply: '🔬 For leaf problems, open **Disease Scan**, upload a clear close-up photo of the leaf and I will analyse it. You can also use **Report Problem** to send the photo to the admin / agriculture expert.', suggestions };

  if (info) {
    let r = `${info.emoji} **${info.name}** (${info.season})\n• Sowing: ${monthText(info.sowingMonths)}\n• Harvest: ${monthText(info.harvestMonths)}\n• Duration: ~${info.durationDays} days\n• Soil: ${info.soil}\n• Temperature: ${info.temperature}\n• Fertilizer: ${info.fertilizer}\n\n💡 Tips:\n` + info.tips.map((t) => '• ' + t).join('\n');
    return { reply: r, suggestions: [`Pests of ${info.name}`, `Price of ${info.name}`, `When to sow ${info.name}?`] };
  }

  return {
    reply: 'I can help with:\n• Crop guidance - "How to grow tomato?"\n• Weather & alerts - "Will it rain?"\n• Irrigation - "When should I water?"\n• Pests - "Pest risk for my crops"\n• Prices - "Price of onion"\n• Schemes - "Crop insurance scheme"\n\nTry one of these questions.',
    suggestions,
  };
}

module.exports = { pestRisk, irrigationPlan, diagnose, assistant, monthText };
