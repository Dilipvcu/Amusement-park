const sqlite3 = require('sqlite3').verbose();
const path = require('path');

module.exports = function ensureColumns() {
  return new Promise((resolve, reject) => {
    const dbPath = path.join(__dirname, '../../data/amusent-park.db');
    const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
      if (err) return reject(err);
    });

    db.serialize(() => {
      db.all("PRAGMA table_info('Tickets')", (err, rows) => {
        if (err) {
          db.close();
          return reject(err);
        }
        const cols = rows.map(r => r.name);
        const tasks = [];

        if (!cols.includes('ticketCategory')) {
          tasks.push(new Promise((res, rej) => {
            db.run("ALTER TABLE Tickets ADD COLUMN ticketCategory TEXT DEFAULT 'Admission'", function(e) {
              if (e) return rej(e);
              res();
            });
          }));
        }

        if (!cols.includes('rideId')) {
          tasks.push(new Promise((res, rej) => {
            db.run("ALTER TABLE Tickets ADD COLUMN rideId INTEGER", function(e) {
              if (e) return rej(e);
              res();
            });
          }));
        }

        Promise.all(tasks).then(() => {
          db.close();
          resolve({ added: tasks.length });
        }).catch(err => {
          db.close();
          reject(err);
        });
      });
    });
  });
}
