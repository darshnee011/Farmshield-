// Runs every time the server starts. Adds starter data only if the database is empty.
const bcrypt = require('bcryptjs');
const { User, CropInfo, Scheme, Price, Announcement, Crop, Reminder } = require('../models');
const cropData = require('./cropData');

const schemes = [
  { title: 'PM-KISAN Samman Nidhi', category: 'Income support', description: 'Direct income support to farmer families, paid in instalments straight to the bank account.', eligibility: 'Landholding farmer families (some exclusions apply, such as income-tax payers).', benefit: '₹6,000 per year in three equal instalments', link: 'https://pmkisan.gov.in' },
  { title: 'PM Fasal Bima Yojana (Crop Insurance)', category: 'Insurance', description: 'Insurance cover against crop loss from drought, flood, pests and natural calamities.', eligibility: 'Farmers growing notified crops in notified areas (loanee and non-loanee).', benefit: 'Low fixed premium for farmers; the rest is paid by the government', link: 'https://pmfby.gov.in' },
  { title: 'Kisan Credit Card (KCC)', category: 'Loan', description: 'Short term credit for seeds, fertilizer, pesticides and other cultivation needs.', eligibility: 'Farmers, tenant farmers, sharecroppers and self-help groups.', benefit: 'Low interest crop loan with flexible repayment', link: 'https://www.myscheme.gov.in' },
  { title: 'Soil Health Card Scheme', category: 'Soil', description: 'Free soil testing and a card that tells which nutrients your soil needs.', eligibility: 'All farmers.', benefit: 'Free soil test report with fertilizer recommendation', link: 'https://soilhealth.dac.gov.in' },
  { title: 'PM Krishi Sinchayee Yojana - Per Drop More Crop', category: 'Irrigation', description: 'Subsidy for drip and sprinkler irrigation to save water and increase yield.', eligibility: 'Farmers with own land and a water source.', benefit: 'Subsidy on micro-irrigation systems (percentage varies by state / farmer category)', link: 'https://pmksy.gov.in' },
  { title: 'PM-KUSUM (Solar Pumps)', category: 'Solar', description: 'Support to install solar water pumps and solar plants on farm land.', eligibility: 'Individual farmers, groups and cooperatives.', benefit: 'Central and state subsidy on solar pumps', link: 'https://pmkusum.mnre.gov.in' },
  { title: 'e-NAM (National Agriculture Market)', category: 'Market', description: 'Online trading platform to sell produce to buyers across India at better prices.', eligibility: 'Farmers registered with a nearby e-NAM mandi.', benefit: 'Transparent price discovery and online payment', link: 'https://enam.gov.in' },
];

const markets = ['Coimbatore Mandi', 'Azadpur Mandi, Delhi', 'Pune APMC'];
const basePrice = { Rice: 2300, Wheat: 2425, Maize: 2200, Cotton: 7000, Sugarcane: 350, Tomato: 2000, Potato: 1500, Groundnut: 6500, Onion: 1800, Chilli: 12000 };

module.exports = async function seed() {
  // Admin user
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@farmshield.com').toLowerCase();
  if (!(await User.findOne({ email: adminEmail }))) {
    await User.create({
      name: 'FarmShield Admin',
      email: adminEmail,
      password: await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin@123', 10),
      role: 'admin',
    });
    console.log('Admin account created: ' + adminEmail);
  }

  if ((await CropInfo.countDocuments()) === 0) {
    await CropInfo.insertMany(cropData);
    console.log('Crop information added');
  }

  if ((await Scheme.countDocuments()) === 0) await Scheme.insertMany(schemes);

  if ((await Price.countDocuments()) === 0) {
    const rows = [];
    Object.entries(basePrice).forEach(([crop, base], i) => {
      markets.forEach((market, j) => {
        const price = Math.round(base * (0.94 + ((i * 3 + j * 5) % 13) / 100));
        const previousPrice = Math.round(price * (0.95 + ((i + j * 2) % 9) / 100));
        rows.push({ crop, market, price, previousPrice });
      });
    });
    await Price.insertMany(rows);
    console.log('Sample market prices added (admin can update them)');
  }

  if ((await Announcement.countDocuments()) === 0) {
    await Announcement.create({ title: 'Welcome to FarmShield 🌱', message: 'Register your crops to get weather alerts, irrigation reminders and pest-risk warnings.', type: 'info' });
  }

  // Demo farmer so the dashboard is not empty on the first run
  if (!(await User.findOne({ email: 'farmer@demo.com' }))) {
    const demo = await User.create({
      name: 'Ravi Kumar', email: 'farmer@demo.com', password: await bcrypt.hash('Farmer@123', 10),
      phone: '9876543210', village: 'Annur', district: 'Coimbatore', state: 'Tamil Nadu',
      landSize: 6, soilType: 'Loamy', waterSource: 'Borewell',
    });
    const day = 864e5;
    const samples = [
      { cropName: 'Tomato', area: 1.5, ago: 30, soil: 'Loamy' },
      { cropName: 'Rice', area: 3, ago: 50, soil: 'Clay' },
      {cropName: 'anush', area: 1.5, ago: 20, soil: 'Sandy' },
    ];
    for (const s of samples) {
      const info = cropData.find((c) => c.name === s.cropName);
      const sow = new Date(Date.now() - s.ago * day);
      const crop = await Crop.create({
        user: demo._id, cropName: s.cropName, area: s.area, sowingDate: sow, soilType: s.soil,
        expectedHarvest: new Date(sow.getTime() + info.durationDays * day),
        lastIrrigated: new Date(Date.now() - 5 * day),
      });
      await Reminder.create({ user: demo._id, crop: crop._id, cropName: s.cropName, title: `Irrigate ${s.cropName}`, nextDate: new Date(), everyDays: info.irrigationIntervalDays });
    }
    console.log('Demo farmer created: farmer@demo.com / Farmer@123');
  }
};
