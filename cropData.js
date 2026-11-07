// Starter crop knowledge base (admin can edit / add more from the Admin dashboard).
const P = (name, symptoms, control, minTemp, maxTemp, minHumidity) => ({ name, symptoms, control, minTemp, maxTemp, minHumidity });

module.exports = [
  {
    name: 'Rice', emoji: '🌾', category: 'Cereal', season: 'Kharif (monsoon)',
    sowingMonths: [6, 7], harvestMonths: [10, 11], durationDays: 120, irrigationIntervalDays: 3, waterNeedMmPerWeek: 60,
    soil: 'Clay or clay loam with good water holding', temperature: '20-35°C',
    fertilizer: 'Basal DAP + potash, urea in 3 splits (transplanting, tillering, panicle initiation). Roughly 120:60:40 kg N:P:K per hectare.',
    tips: ['Use certified seed and treat it before sowing.', 'Keep 2-5 cm water standing during tillering.', 'Drain the field 10 days before harvest.'],
    pests: [
      P('Brown plant hopper', 'Circular patches of dried plants ("hopper burn")', 'Avoid excess urea, drain field, spray Imidacloprid as per label', 25, 32, 80),
      P('Stem borer', 'Dead heart in young plants, white ear heads', 'Pheromone traps, release Trichogramma cards, Cartap granules', 25, 33, 70),
      P('Rice blast', 'Diamond shaped grey spots on leaves', 'Spray Tricyclazole 0.6 g/L, avoid heavy nitrogen', 20, 28, 85),
    ],
  },
  {
    name: 'Wheat', emoji: '🌿', category: 'Cereal', season: 'Rabi (winter)',
    sowingMonths: [11, 12], harvestMonths: [3, 4], durationDays: 130, irrigationIntervalDays: 10, waterNeedMmPerWeek: 25,
    soil: 'Well drained loam or clay loam', temperature: '10-25°C',
    fertilizer: 'Half nitrogen + full P and K at sowing, remaining nitrogen at first irrigation. Roughly 120:60:40 kg per hectare.',
    tips: ['Irrigate at crown root initiation (21 days) - the most critical stage.', 'Sow on time; late sowing reduces yield.', 'Control weeds 30-35 days after sowing.'],
    pests: [
      P('Aphids', 'Sticky leaves and curling of tender shoots', 'Neem oil 5 ml/L or Dimethoate as per label', 15, 25, 60),
      P('Yellow rust', 'Yellow stripes of powder on leaves', 'Spray Propiconazole 1 ml/L at first sign', 10, 20, 80),
      P('Termites', 'Wilting plants with damaged roots', 'Seed treatment with Chlorpyrifos, avoid raw cow dung', 25, 35, 40),
    ],
  },
  {
    name: 'Maize', emoji: '🌽', category: 'Cereal', season: 'Kharif / Rabi',
    sowingMonths: [6, 7, 10], harvestMonths: [9, 10, 2], durationDays: 100, irrigationIntervalDays: 7, waterNeedMmPerWeek: 35,
    soil: 'Fertile well drained loam', temperature: '21-30°C',
    fertilizer: 'Apply 120:60:40 kg NPK per hectare. Give nitrogen in 3 splits.',
    tips: ['Never allow water logging.', 'Earthing up at 30-35 days gives strong roots.', 'Irrigate at tasselling and silking.'],
    pests: [
      P('Fall armyworm', 'Ragged holes in leaves and sawdust-like droppings in whorl', 'Spray Emamectin benzoate 0.4 g/L, apply sand+lime in whorl', 25, 32, 60),
      P('Stem borer', 'Dead heart and tunnels in stem', 'Release Trichogramma, Carbofuran granules in whorl', 25, 33, 65),
      P('Leaf blight', 'Long grey-green lesions on leaves', 'Spray Mancozeb 2.5 g/L', 18, 27, 80),
    ],
  },
  {
    name: 'Cotton', emoji: '☁️', category: 'Fibre', season: 'Kharif',
    sowingMonths: [5, 6], harvestMonths: [10, 11, 12], durationDays: 170, irrigationIntervalDays: 10, waterNeedMmPerWeek: 35,
    soil: 'Deep black cotton soil', temperature: '21-35°C',
    fertilizer: 'Apply 80:40:40 kg NPK per hectare for hybrid varieties in splits.',
    tips: ['Maintain plant spacing for air flow.', 'Install pheromone traps for bollworm.', 'Stop irrigation when 60% bolls open.'],
    pests: [
      P('Pink bollworm', 'Rosette flowers and damaged bolls with larvae inside', 'Pheromone traps, spray Profenofos as per label', 25, 35, 60),
      P('Whitefly', 'Yellowing and sticky honeydew on leaves', 'Yellow sticky traps, neem oil 5 ml/L', 28, 35, 50),
      P('Aphids', 'Curled leaves with ants on plants', 'Neem oil, conserve ladybird beetles', 20, 30, 60),
    ],
  },
  {
    name: 'Sugarcane', emoji: '🎋', category: 'Cash crop', season: 'Annual (Feb-Mar / Oct)',
    sowingMonths: [2, 3, 10], harvestMonths: [12, 1, 2, 3], durationDays: 330, irrigationIntervalDays: 8, waterNeedMmPerWeek: 45,
    soil: 'Deep fertile loam', temperature: '20-35°C',
    fertilizer: 'About 250:100:120 kg NPK per hectare; give nitrogen in 3-4 splits with earthing up.',
    tips: ['Use disease free setts (3 budded).', 'Trash mulching saves water.', 'Remove dry leaves to reduce pests.'],
    pests: [
      P('Early shoot borer', 'Dead heart in young shoots', 'Earthing up, Chlorantraniliprole as per label', 25, 35, 60),
      P('Red rot', 'Reddening of internal tissue with sour smell', 'Use resistant variety, remove infected clumps', 25, 32, 85),
      P('Woolly aphid', 'White wool-like patches under leaves', 'Release predators (Dipha), avoid excess nitrogen', 22, 30, 70),
    ],
  },
  {
    name: 'Tomato', emoji: '🍅', category: 'Vegetable', season: 'Kharif / Rabi',
    sowingMonths: [6, 7, 10, 11], harvestMonths: [9, 10, 1, 2], durationDays: 110, irrigationIntervalDays: 4, waterNeedMmPerWeek: 30,
    soil: 'Well drained sandy loam, pH 6-7', temperature: '18-30°C',
    fertilizer: 'Farmyard manure 20 t/ha at planting, then 100:60:60 kg NPK per hectare in splits.',
    tips: ['Stake plants to keep fruits off the soil.', 'Use drip irrigation - wet leaves invite blight.', 'Rotate with non-solanaceous crops.'],
    pests: [
      P('Early blight', 'Dark rings (target spots) on older leaves', 'Spray Mancozeb 2.5 g/L, remove infected leaves', 24, 29, 80),
      P('Fruit borer', 'Round holes in fruits', 'Pheromone traps, spray Spinosad as per label', 22, 30, 60),
      P('Whitefly (leaf curl virus)', 'Upward curling and yellowing of leaves', 'Yellow sticky traps, neem oil, remove infected plants', 28, 35, 50),
    ],
  },
  {
    name: 'Potato', emoji: '🥔', category: 'Vegetable', season: 'Rabi',
    sowingMonths: [10, 11], harvestMonths: [2, 3], durationDays: 100, irrigationIntervalDays: 7, waterNeedMmPerWeek: 25,
    soil: 'Loose sandy loam, good drainage', temperature: '15-25°C',
    fertilizer: 'About 120:80:100 kg NPK per hectare; apply at planting and earthing up.',
    tips: ['Use disease free seed tubers.', 'Earth up at 25-30 days.', 'Stop irrigation 10 days before harvest.'],
    pests: [
      P('Late blight', 'Water-soaked dark patches that spread fast in cool wet weather', 'Spray Metalaxyl + Mancozeb at first sign', 10, 20, 90),
      P('Aphids', 'Leaf curling, spread virus', 'Neem oil, Imidacloprid as per label', 15, 25, 60),
      P('Cutworm', 'Plants cut at ground level at night', 'Deep ploughing, Chlorpyrifos soil drench', 18, 28, 50),
    ],
  },
  {
    name: 'Groundnut', emoji: '🥜', category: 'Oilseed', season: 'Kharif',
    sowingMonths: [6, 7], harvestMonths: [10, 11], durationDays: 110, irrigationIntervalDays: 8, waterNeedMmPerWeek: 30,
    soil: 'Light sandy loam rich in calcium', temperature: '22-30°C',
    fertilizer: 'Apply gypsum 400 kg/ha at flowering, 20:40:40 kg NPK per hectare.',
    tips: ['Irrigate at flowering and pegging.', 'Earth up at 40 days to help pod formation.', 'Dry pods well before storing.'],
    pests: [
      P('Tikka leaf spot', 'Dark brown spots with yellow halo on leaves', 'Spray Chlorothalonil 2 g/L', 25, 30, 80),
      P('Leaf miner', 'White blotches / mines on leaflets', 'Neem seed kernel extract 5%, Dimethoate as per label', 25, 33, 60),
      P('Aphids', 'Stunted plants with curled leaves', 'Neem oil 5 ml/L', 20, 30, 60),
    ],
  },
  {
    name: 'Onion', emoji: '🧅', category: 'Vegetable', season: 'Rabi',
    sowingMonths: [10, 11], harvestMonths: [3, 4], durationDays: 130, irrigationIntervalDays: 7, waterNeedMmPerWeek: 25,
    soil: 'Well drained loam, pH 6-7', temperature: '13-30°C',
    fertilizer: 'Apply 100:50:50 kg NPK per hectare; add sulphur for pungency.',
    tips: ['Stop irrigation 10-15 days before harvest.', 'Cure bulbs in shade for 3-4 days.', 'Keep field weed free for first 45 days.'],
    pests: [
      P('Thrips', 'Silvery streaks on leaves, tips turn white', 'Blue sticky traps, Fipronil as per label', 25, 35, 40),
      P('Purple blotch', 'Purple patches with yellow edges', 'Spray Mancozeb 2.5 g/L', 20, 30, 85),
      P('Downy mildew', 'Pale patches with grey-violet growth', 'Spray Metalaxyl + Mancozeb', 15, 25, 85),
    ],
  },
  {
    name: 'Chilli', emoji: '🌶️', category: 'Spice', season: 'Kharif / Rabi',
    sowingMonths: [6, 7, 10], harvestMonths: [11, 12, 1, 2], durationDays: 150, irrigationIntervalDays: 6, waterNeedMmPerWeek: 30,
    soil: 'Well drained loam / black soil', temperature: '20-30°C',
    fertilizer: 'Apply 100:50:50 kg NPK per hectare with farmyard manure; split nitrogen.',
    tips: ['Avoid water logging - roots rot easily.', 'Mulch to reduce weed and conserve moisture.', 'Pick fruits at full colour for best price.'],
    pests: [
      P('Thrips', 'Upward curling of leaves, silvery patches', 'Blue sticky traps, Spinosad as per label', 25, 35, 40),
      P('Anthracnose (fruit rot)', 'Sunken dark spots on ripe fruits', 'Spray Carbendazim 1 g/L, remove infected fruits', 25, 30, 85),
      P('Mites', 'Leaves curl downward and turn bronze', 'Spray wettable sulphur 2 g/L', 28, 35, 40),
    ],
  },
];
