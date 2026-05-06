require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const express = require('express');
const path = require('path');
const db = require('./db');

async function start() {
  await db.init();
  console.log('[db] SQLite инициализирован');

  const bookingRoutes = require('./routes');

  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json());

  // API
  app.use('/api/bookings', bookingRoutes);

  // Static files — serve frontend from project root
  app.use(express.static(path.join(__dirname, '..')));

  // SPA fallback
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
  });

  app.listen(PORT, () => {
    console.log(`[server] http://localhost:${PORT}`);

    // Start Telegram bot if token is configured
    if (process.env.TELEGRAM_BOT_TOKEN) {
      try {
        require('./bot');
        console.log('[bot] Telegram бот запущен');
      } catch (err) {
        console.error('[bot] Ошибка запуска бота:', err.message);
      }
    } else {
      console.log('[bot] TELEGRAM_BOT_TOKEN не задан — бот не запущен');
    }
  });
}

start().catch((err) => {
  console.error('Ошибка запуска:', err);
  process.exit(1);
});
