const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('dev.db');
db.all("PRAGMA table_info('Offer')", (err, rows) => {
  if (err) return console.error(err);
  console.log(rows);
  db.all("SELECT * FROM Offer LIMIT 1", (err2, rows2) => {
    if (err2) return console.error(err2);
    console.log('sample row', rows2);
    db.close();
  });
});
