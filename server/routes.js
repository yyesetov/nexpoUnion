const express = require('express');
const db = require('./db');

const router = express.Router();

// GET /api/bookings — list bookings (optional filters: ?date=, ?apt=)
router.get('/', (req, res) => {
  const { date, apt } = req.query;

  if (date) {
    return res.json(db.byDate(date));
  }

  if (apt) {
    return res.json(db.byApt(String(apt).trim()));
  }

  return res.json(db.all());
});

// POST /api/bookings — create a booking
router.post('/', (req, res) => {
  const { date, name, phone, apt, from, to } = req.body;
  const errors = [];

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    errors.push('date: некорректная дата');
  }
  if (!name || !name.trim()) {
    errors.push('name: укажите имя');
  }
  if (!phone || phone.replace(/\D/g, '').length < 11) {
    errors.push('phone: некорректный номер');
  }
  if (!apt || !String(apt).trim()) {
    errors.push('apt: укажите квартиру');
  }
  if (!from) {
    errors.push('from: укажите время начала');
  }
  if (!to) {
    errors.push('to: укажите время окончания');
  }
  if (from && to && from >= to) {
    errors.push('to: время окончания должно быть позже начала');
  }

  if (errors.length) {
    return res.status(400).json({ error: 'Ошибка валидации', details: errors });
  }

  // Check date not in the past
  const today = new Date().toISOString().slice(0, 10);
  if (date < today) {
    return res.status(400).json({ error: 'Нельзя бронировать прошедшую дату' });
  }

  // Check time overlap
  if (db.hasOverlap(date, from, to)) {
    return res.status(409).json({
      error: 'Это время уже занято. Выберите другой слот.',
      bookings: db.byDate(date),
    });
  }

  const booking = db.insert({ date, name: name.trim(), phone, apt: String(apt).trim(), from, to });
  return res.status(201).json(booking);
});

// PATCH /api/bookings/:id — update booking (paid status)
router.patch('/:id', (req, res) => {
  const existing = db.byId(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: 'Бронь не найдена' });
  }

  if (req.body.paid !== undefined) {
    const updated = db.setPaid(req.params.id, !!req.body.paid);
    return res.json(updated);
  }

  return res.json(existing);
});

module.exports = router;
