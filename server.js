require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const seed = require('./utils/seed');

const app = express();
app.use(cors());
app.use(express.json());

// static files: frontend + uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Backend status page (the website itself is the React app in /frontend)
let dbConnected = false;
app.get('/', (req, res) => {
  res.send(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>FarmShield Backend</title></head>
  <body style="font-family:sans-serif;display:grid;place-items:center;height:100vh;margin:0;background:#f4f8f5">
  <div style="text-align:center"><div style="font-size:60px">${dbConnected ? '✅' : '⏳'}</div>
  <h1 style="color:#0a3b2b">FarmShield Backend</h1>
  <p style="font-size:20px">${dbConnected ? 'MongoDB connected successfully' : 'Connecting to MongoDB...'}</p>
  <p style="color:#666">Database: ${mongoose.connection.name || '-'} &nbsp;|&nbsp; API: <a href="/api/health">/api/health</a></p></div></body></html>`);
});
app.get('/api/health', (req, res) => res.json({ status: 'ok', mongodb: dbConnected ? 'connected' : 'not connected', database: mongoose.connection.name }));

// REST API routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api', require('./routes/farmer'));
app.use('/api', require('./routes/info'));

app.use('/api', (req, res) => res.status(404).json({ message: 'API route not found' }));

// central error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/farmshield';

mongoose
  .connect(MONGO_URI)
  .then(async () => {
    dbConnected = true;
    console.log('MongoDB connected successfully (database: ' + mongoose.connection.name + ')');
    await seed();
    app.listen(PORT, () => {
      console.log(`FarmShield backend running at http://localhost:${PORT}  (website: run the frontend on http://localhost:5173)`);
      console.log('Admin login -> ' + (process.env.ADMIN_EMAIL || 'admin@farmshield.com'));
    });
  })
  .catch((err) => {
    console.error('\nCould not connect to MongoDB: ' + err.message);
    console.error('Make sure MongoDB is installed and running, or put your Atlas link in .env (MONGO_URI).\n');
    process.exit(1);
  });
