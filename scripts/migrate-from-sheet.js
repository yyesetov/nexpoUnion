/**
 * Migration script: clears all bookings and imports data from Google Sheets CSV.
 *
 * Usage:  node scripts/migrate-from-sheet.js
 */

const path = require('path');
const fs = require('fs');
const initSqlJs = require('sql.js');

const DB_PATH = path.join(__dirname, '..', 'data', 'bookings.db');

const RAW_DATA = [
  // [name, apt, date, time_from]
  ['Нурасыл',    '264', '06.05.2026', ''],
  ['Аслан',      '223', '07.05.2026', '13:00'],
  ['Мужской чат','',    '08.05.2026', ''],
  ['Асланбек',   '26',  '09.05.2026', ''],
  ['Аслан',      '281', '10.05.2026', '14:00'],
  ['Майгуль',    '132', '11.05.2026', '13:00'],
  ['Beimbet',    '184', '12.05.2026', '13:00'],
  ['Жангир',     '5',   '13.05.2026', ''],
  ['Юли',        '244', '14.05.2026', '17:00'],
  ['Мужской чат','',    '15.05.2026', ''],
  ['Арман',      '35',  '16.05.2026', ''],
  ['Адилет',     '132', '17.05.2026', '15:00'],
  ['Ерген',      '238', '20.05.2026', '15:00'],
  ['Олжик',      '',    '22.05.2026', '08:00'],
  ['Мужской чат','',    '23.05.2026', ''],
  ['Максат',     '198', '24.05.2026', '12:00'],
  ['Адильжан',   '189', '26.05.2026', '18:00'],
  ['Мужской чат','',    '29.05.2026', ''],
  ['Алкар',      '178', '30.05.2026', '15:30'],
  ['Максут',     '19',  '31.05.2026', '16:00'],
  ['Мужской чат','',    '05.06.2026', ''],
  ['Мужской чат','',    '06.06.2026', ''],
  ['Максут',     '19',  '10.06.2026', '14:00'],
  ['Максут',     '19',  '11.06.2026', '15:00'],
  ['Мужской чат','',    '12.06.2026', ''],
  ['Влад',       '57',  '13.06.2026', ''],
  ['Adilet',     '132', '14.06.2026', '14:00'],
  ['Алмас',      '75',  '16.06.2026', '17:00'],
  ['Мужской чат','',    '19.06.2026', ''],
  ['Мужской чат','',    '20.06.2026', ''],
  ['Ерлан',      '87',  '21.06.2026', '14:00'],
  ['Ерлан',      '87',  '22.06.2026', '14:00'],
  ['Адильжан',   '',    '26.06.2026', ''],
  ['Алкар',      '178', '27.06.2026', '15:30'],
  ['Жангир',     '5',   '28.06.2026', '18:00'],
  ['Мужской чат','',    '03.07.2026', ''],
  ['Мужской чат','',    '04.07.2026', ''],
  ['Томирис',    '35',  '05.07.2026', '14:00'],
  ['Мужской чат','',    '10.07.2026', ''],
  ['Мужской чат','',    '11.07.2026', ''],
  ['Мужской чат','',    '17.07.2026', ''],
  ['Мужской чат','',    '18.07.2026', ''],
  ['Мужской чат','',    '24.07.2026', ''],
  ['Мужской чат','',    '25.07.2026', ''],
  ['Мужской чат','',    '31.07.2026', ''],
  ['Мужской чат','',    '01.08.2026', ''],
  ['Мужской чат','',    '07.08.2026', ''],
  ['Мужской чат','',    '08.08.2026', ''],
  ['Мужской чат','',    '14.08.2026', ''],
  ['Мужской чат','',    '15.08.2026', ''],
  ['Шолпан',     '98',  '16.08.2026', '17:00'],
  ['Салтанат',   '148', '05.06.2026', '12:00'],
  ['Мужской чат','',    '21.08.2026', ''],
  ['Мужской чат','',    '22.08.2026', ''],
  ['Мужской чат','',    '28.08.2026', ''],
  ['Мужской чат','',    '29.08.2026', ''],
];

function parseDate(s) {
  // "06.05.2026" or "08.05" → "2026-05-06"
  const parts = s.split('.');
  const day = parts[0].padStart(2, '0');
  const month = parts[1].padStart(2, '0');
  const year = parts[2] || '2026';
  return `${year}-${month}-${day}`;
}

function defaultTimeTo() {
  return '23:00'; // booking lasts until end of day
}

async function main() {
  const SQL = await initSqlJs();
  let db;

  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
    console.log('Opened existing database.');
  } else {
    db = new SQL.Database();
    console.log('Created new database.');
  }

  // Ensure table exists
  db.run(`
    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY, date TEXT NOT NULL, name TEXT NOT NULL,
      phone TEXT NOT NULL, apt TEXT NOT NULL, time_from TEXT NOT NULL,
      time_to TEXT NOT NULL, paid INTEGER DEFAULT 0, created_at INTEGER NOT NULL
    )
  `);

  // Clear all existing records
  db.run(`DELETE FROM bookings`);
  console.log('Cleared all existing bookings.');

  // Insert records
  const now = Date.now();
  let count = 0;

  // Remove duplicate Максат 198 24.05.2026 (appears twice in sheet)
  const seen = new Set();

  for (const [name, apt, rawDate, rawTime] of RAW_DATA) {
    const date = parseDate(rawDate);
    const timeFrom = rawTime || '';
    const timeTo = defaultTimeTo();
    const key = `${name}-${date}`;

    if (seen.has(key)) {
      console.log(`  Skipping duplicate: ${name} ${date}`);
      continue;
    }
    seen.add(key);

    const id = `b-${now + count}`;
    db.run(
      `INSERT INTO bookings (id, date, name, phone, apt, time_from, time_to, paid, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)`,
      [id, date, name.trim(), '', apt, timeFrom, timeTo, now]
    );
    count++;
  }

  // Save
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));

  console.log(`\nDone! Inserted ${count} bookings.`);
  db.close();
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
