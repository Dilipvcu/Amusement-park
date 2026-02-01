const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./db');
const ticketRoutes = require('./routes/tickets');
const reportRoutes = require('./routes/reports');
const activityRoutes = require('./routes/activities');
const ensureColumns = require('./db/migrate');
const ensureActivities = require('./db/ensureActivities');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use('/api/tickets', ticketRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/activities', activityRoutes);

const PORT = process.env.PORT || 4000;

async function start() {

  try {
    await ensureColumns();
    console.log('DB migration completed (if needed)');
  } catch (err) {
    console.error('Migration error', err);
  }

  await db.authenticate();
  await db.sync();

  // ensure default activities
  try{
    await ensureActivities();
    console.log('Ensured activities')
  }catch(err){
    console.error('ensureActivities error', err)
  }

  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

start();