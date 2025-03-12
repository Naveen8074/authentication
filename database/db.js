const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./users.db', (err) => {
    if (err) console.error("Database Connection Error:", err.message);
    else console.log('Connected to SQLite DB');
});

db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    email TEXT UNIQUE,
    password TEXT,
    resetToken TEXT,
    resetTokenExpiry INTEGER
)`);

module.exports = db;
