const { Activity } = require('./index');

const rides = [
  'Thunder Loop',
  'Sky Screamer',
  "Dragon’s Fury",
  'Cyclone Twist',
  'Phantom Drop',
  'Galaxy Spin',
  'Wild River Rapids',
  'Inferno Coaster',
  "Pirate’s Plunge",
  'Neon Night Wheel'
];

module.exports = async function ensureActivities() {
  for (const name of rides) {
    const [a, created] = await Activity.findOrCreate({ where: { name }, defaults: { description: name, capacity: 20, durationMinutes: 4 } });
  }
}
