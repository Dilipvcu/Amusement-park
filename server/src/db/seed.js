const db = require('./index');
const { Ticket, Activity } = db;

async function seed() {
  await db.authenticate();
  await db.sync({ force: true });

  const acts = await Activity.bulkCreate([
    { name: 'Thunder Loop', description: 'High-speed loop coaster', capacity: 24, durationMinutes: 2 },
    { name: 'Sky Screamer', description: 'Tall swing ride with panoramic views', capacity: 30, durationMinutes: 4 },
    { name: "Dragon’s Fury", description: 'Intense dragon-themed coaster', capacity: 20, durationMinutes: 3 },
    { name: 'Cyclone Twist', description: 'Spinning coaster with twists', capacity: 18, durationMinutes: 3 },
    { name: 'Phantom Drop', description: 'Drop tower with surprise element', capacity: 16, durationMinutes: 2 },
    { name: 'Galaxy Spin', description: 'High-energy spinning ride', capacity: 30, durationMinutes: 5 },
    { name: 'Wild River Rapids', description: 'Water rapids adventure', capacity: 20, durationMinutes: 7 },
    { name: 'Inferno Coaster', description: 'Fire-themed extreme coaster', capacity: 22, durationMinutes: 3 },
    { name: "Pirate’s Plunge", description: 'Splash drop with pirate theme', capacity: 20, durationMinutes: 4 },
    { name: 'Neon Night Wheel', description: 'Illuminated ferris wheel at night', capacity: 40, durationMinutes: 8 }
  ]);

  await Ticket.bulkCreate([
    { customerName: 'Alice', type: 'Adult', price: 50, ticketCategory: 'Admission' },
    { customerName: 'Bob', type: 'Child', price: 15, ticketCategory: 'Ride', rideId: acts[0].id },
    { customerName: 'Eve', type: 'Senior', price: 35, ticketCategory: 'AllRides' }
  ]);

  console.log('Seed complete');
  process.exit(0);
}

seed();