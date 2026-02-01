const db = require('./index');

async function run() {
  try {
    await db.authenticate();
    await db.sync({ force: true });
    console.log('Database synced');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();