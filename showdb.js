// Shows what is stored in your MongoDB.   Run:  npm run db
require('dotenv').config();
const mongoose = require('mongoose');
const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/farmshield';

mongoose.connect(uri).then(async () => {
  const db = mongoose.connection.db;
  console.log('\n Connected to MongoDB');
  console.log('   Connection : ' + uri);
  console.log('   Database   : ' + db.databaseName + '\n');
  const cols = (await db.listCollections().toArray()).map((c) => c.name).sort();
  if (!cols.length) console.log('No collections yet - start the server once with "npm start".');
  for (const name of cols) {
    const count = await db.collection(name).countDocuments();
    const one = await db.collection(name).findOne({}, { projection: { password: 0, __v: 0 } });
    console.log(` ${name.padEnd(14)} ${String(count).padStart(4)} document(s)   fields: ${one ? Object.keys(one).join(', ') : '-'}`);
  }
  console.log('\nTo SEE the data visually: open MongoDB Compass -> connect to the connection above -> database "' + db.databaseName + '".\n');
  await mongoose.disconnect();
}).catch((e) => { console.error(' Could not connect to MongoDB: ' + e.message); process.exit(1); });
