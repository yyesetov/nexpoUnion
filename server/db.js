const path = require('path');
const fs = require('fs');
const initSqlJs = require('sql.js');

const DB_PATH = path.join(__dirname, '..', 'data', 'bookings.db');

let db = null;

function save() {
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

async function init() {
  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  // Migrate: drop time_from/time_to columns if old schema has them
  const tableInfo = db.exec(`SELECT sql FROM sqlite_master WHERE type='table' AND name='bookings'`);
  if (tableInfo.length && tableInfo[0].values.length) {
    const ddl = tableInfo[0].values[0][0] || '';
    if (ddl.includes('time_from')) {
      db.run(`CREATE TABLE IF NOT EXISTS bookings_new (
        id TEXT PRIMARY KEY, date TEXT NOT NULL, name TEXT NOT NULL,
        phone TEXT NOT NULL, apt TEXT NOT NULL,
        paid INTEGER DEFAULT 0, created_at INTEGER NOT NULL
      )`);
      db.run(`INSERT OR IGNORE INTO bookings_new (id, date, name, phone, apt, paid, created_at)
              SELECT id, date, name, phone, apt, paid, created_at FROM bookings`);
      db.run(`DROP TABLE bookings`);
      db.run(`ALTER TABLE bookings_new RENAME TO bookings`);
    }
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS bookings (
      id         TEXT PRIMARY KEY,
      date       TEXT NOT NULL,
      name       TEXT NOT NULL,
      phone      TEXT NOT NULL,
      apt        TEXT NOT NULL,
      paid       INTEGER DEFAULT 0,
      created_at INTEGER NOT NULL
    )
  `);
  db.run(`CREATE INDEX IF NOT EXISTS idx_apt ON bookings(apt)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_date ON bookings(date)`);
  save();
}

function rowToObj(columns, values) {
  const obj = {};
  columns.forEach((col, i) => { obj[col] = values[i]; });
  return obj;
}

function query(sql, params) {
  const stmt = db.prepare(sql);
  if (params) stmt.bind(params);
  const rows = [];
  while (stmt.step()) {
    rows.push(rowToObj(stmt.getColumnNames(), stmt.get()));
  }
  stmt.free();
  return rows;
}

function run(sql, params) {
  db.run(sql, params);
  save();
}

function toFrontend(row) {
  if (!row) return null;
  return {
    id: row.id,
    date: row.date,
    name: row.name,
    phone: row.phone,
    apt: row.apt,
    paid: !!row.paid,
    createdAt: row.created_at,
  };
}

module.exports = {
  init,

  insert(data) {
    const id = 'b-' + Date.now();
    const now = Date.now();
    run(
      `INSERT INTO bookings (id, date, name, phone, apt, paid, created_at) VALUES (?, ?, ?, ?, ?, 0, ?)`,
      [id, data.date, data.name, data.phone, data.apt, now]
    );
    return toFrontend({
      id, date: data.date, name: data.name, phone: data.phone,
      apt: data.apt, paid: 0, created_at: now,
    });
  },

  all() {
    return query(`SELECT * FROM bookings ORDER BY date ASC`).map(toFrontend);
  },

  upcoming() {
    const today = new Date().toISOString().slice(0, 10);
    return query(`SELECT * FROM bookings WHERE date >= ? ORDER BY date ASC`, [today]).map(toFrontend);
  },

  byDate(date) {
    return query(`SELECT * FROM bookings WHERE date = ?`, [date]).map(toFrontend);
  },

  isDateBooked(date) {
    const rows = query(`SELECT * FROM bookings WHERE date = ?`, [date]);
    return rows.length > 0;
  },

  byApt(apt) {
    return query(`SELECT * FROM bookings WHERE apt = ? ORDER BY date ASC`, [apt]).map(toFrontend);
  },

  byId(id) {
    const rows = query(`SELECT * FROM bookings WHERE id = ?`, [id]);
    return rows.length ? toFrontend(rows[0]) : null;
  },

  deleteById(id) {
    const before = query(`SELECT * FROM bookings WHERE id = ?`, [id]);
    if (before.length === 0) return false;
    run(`DELETE FROM bookings WHERE id = ?`, [id]);
    return true;
  },

  updateById(id, fields) {
    const existing = query(`SELECT * FROM bookings WHERE id = ?`, [id]);
    if (!existing.length) return null;
    const row = existing[0];
    const name = fields.name !== undefined ? fields.name : row.name;
    const phone = fields.phone !== undefined ? fields.phone : row.phone;
    const apt = fields.apt !== undefined ? fields.apt : row.apt;
    run(
      `UPDATE bookings SET name = ?, phone = ?, apt = ? WHERE id = ?`,
      [name, phone, apt, id]
    );
    const updated = query(`SELECT * FROM bookings WHERE id = ?`, [id]);
    return updated.length ? toFrontend(updated[0]) : null;
  },

  setPaid(id, paid) {
    run(`UPDATE bookings SET paid = ? WHERE id = ?`, [paid ? 1 : 0, id]);
    const rows = query(`SELECT * FROM bookings WHERE id = ?`, [id]);
    return rows.length ? toFrontend(rows[0]) : null;
  },
};
