const TelegramBot = require('node-telegram-bot-api');
const db = require('./db');

const token = process.env.TELEGRAM_BOT_TOKEN;
const adminIds = (process.env.ADMIN_CHAT_IDS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)
  .map(Number);

const bot = new TelegramBot(token, { polling: true });

function isAdmin(chatId) {
  if (adminIds.length === 0) return true; // no restriction if not configured
  return adminIds.includes(chatId);
}

function deny(chatId) {
  bot.sendMessage(chatId, '⛔ У вас нет доступа к этому боту.');
}

function formatBooking(b) {
  return [
    `📅 ${b.date}`,
    `👤 ${b.name} | кв. ${b.apt}`,
    `📞 ${b.phone}`,
    `🕐 ${b.from}–${b.to}`,
    `💰 ${b.paid ? 'Оплачено ✅' : 'Не оплачено ❌'}`,
    `🆔 \`${b.id}\``,
  ].join('\n');
}

// /start
bot.onText(/\/start/, (msg) => {
  if (!isAdmin(msg.chat.id)) return deny(msg.chat.id);
  bot.sendMessage(msg.chat.id, [
    '🔥 *Nexpo Union — Мангальная зона*',
    '',
    'Команды:',
    '/today — брони на сегодня',
    '/all — все предстоящие брони',
    '/date ГГГГ-ММ-ДД — брони на дату',
    '/find НомерКвартиры — брони по квартире',
    '/delete ID — удалить бронь',
    '/paid ID — отметить как оплачено',
    '/unpaid ID — отметить как неоплачено',
    '',
    `Ваш chat ID: \`${msg.chat.id}\``,
  ].join('\n'), { parse_mode: 'Markdown' });
});

// /today
bot.onText(/\/today/, (msg) => {
  if (!isAdmin(msg.chat.id)) return deny(msg.chat.id);
  const today = new Date().toISOString().slice(0, 10);
  const bookings = db.byDate(today);
  if (bookings.length === 0) {
    return bot.sendMessage(msg.chat.id, `📅 ${today}\nНет бронирований на сегодня.`);
  }
  const text = bookings.map((b, i) => `*${i + 1}.* ${formatBooking(b)}`).join('\n\n');
  bot.sendMessage(msg.chat.id, `*Сегодня (${bookings.length}):*\n\n${text}`, { parse_mode: 'Markdown' });
});

// /all
bot.onText(/\/all/, (msg) => {
  if (!isAdmin(msg.chat.id)) return deny(msg.chat.id);
  const bookings = db.upcoming();
  if (bookings.length === 0) {
    return bot.sendMessage(msg.chat.id, 'Нет предстоящих бронирований.');
  }
  const text = bookings.map((b, i) => `*${i + 1}.* ${formatBooking(b)}`).join('\n\n');
  bot.sendMessage(msg.chat.id, `📋 *Предстоящие брони (${bookings.length}):*\n\n${text}`, { parse_mode: 'Markdown' });
});

// /date YYYY-MM-DD
bot.onText(/\/date\s+(\d{4}-\d{2}-\d{2})/, (msg, match) => {
  if (!isAdmin(msg.chat.id)) return deny(msg.chat.id);
  const date = match[1];
  const bookings = db.byDate(date);
  if (bookings.length === 0) {
    return bot.sendMessage(msg.chat.id, `📅 ${date}\nНет бронирований.`);
  }
  const text = bookings.map((b, i) => `*${i + 1}.* ${formatBooking(b)}`).join('\n\n');
  bot.sendMessage(msg.chat.id, `📅 *${date} (${bookings.length}):*\n\n${text}`, { parse_mode: 'Markdown' });
});

// /find APT
bot.onText(/\/find\s+(\d+)/, (msg, match) => {
  if (!isAdmin(msg.chat.id)) return deny(msg.chat.id);
  const apt = match[1];
  const bookings = db.byApt(apt);
  if (bookings.length === 0) {
    return bot.sendMessage(msg.chat.id, `Бронирований по квартире ${apt} не найдено.`);
  }
  const text = bookings.map((b) => formatBooking(b)).join('\n\n');
  bot.sendMessage(msg.chat.id, `🏠 *Квартира ${apt}:*\n\n${text}`, { parse_mode: 'Markdown' });
});

// /delete ID — show confirmation
bot.onText(/\/delete\s+(b-\d+|seed-.+)/, (msg, match) => {
  if (!isAdmin(msg.chat.id)) return deny(msg.chat.id);
  const id = match[1];
  const booking = db.byId(id);
  if (!booking) {
    return bot.sendMessage(msg.chat.id, `❌ Бронь \`${id}\` не найдена.`, { parse_mode: 'Markdown' });
  }
  bot.sendMessage(msg.chat.id, `⚠️ *Удалить эту бронь?*\n\n${formatBooking(booking)}`, {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [[
        { text: '✅ Да, удалить', callback_data: `confirm_delete:${id}` },
        { text: '❌ Отмена', callback_data: 'cancel_delete' },
      ]],
    },
  });
});

// /paid ID
bot.onText(/\/paid\s+(b-\d+|seed-.+)/, (msg, match) => {
  if (!isAdmin(msg.chat.id)) return deny(msg.chat.id);
  const id = match[1];
  const updated = db.setPaid(id, true);
  if (!updated) {
    return bot.sendMessage(msg.chat.id, `❌ Бронь \`${id}\` не найдена.`, { parse_mode: 'Markdown' });
  }
  bot.sendMessage(msg.chat.id, `✅ Оплата подтверждена:\n\n${formatBooking(updated)}`, { parse_mode: 'Markdown' });
});

// /unpaid ID
bot.onText(/\/unpaid\s+(b-\d+|seed-.+)/, (msg, match) => {
  if (!isAdmin(msg.chat.id)) return deny(msg.chat.id);
  const id = match[1];
  const updated = db.setPaid(id, false);
  if (!updated) {
    return bot.sendMessage(msg.chat.id, `❌ Бронь \`${id}\` не найдена.`, { parse_mode: 'Markdown' });
  }
  bot.sendMessage(msg.chat.id, `❌ Оплата снята:\n\n${formatBooking(updated)}`, { parse_mode: 'Markdown' });
});

// Callback: confirm/cancel delete
bot.on('callback_query', (query) => {
  const chatId = query.message.chat.id;
  if (!isAdmin(chatId)) return;

  if (query.data === 'cancel_delete') {
    bot.answerCallbackQuery(query.id, { text: 'Отменено' });
    bot.editMessageText('❌ Удаление отменено.', { chat_id: chatId, message_id: query.message.message_id });
    return;
  }

  if (query.data.startsWith('confirm_delete:')) {
    const id = query.data.replace('confirm_delete:', '');
    const booking = db.byId(id);
    const deleted = db.deleteById(id);
    if (deleted) {
      bot.answerCallbackQuery(query.id, { text: 'Удалено' });
      bot.editMessageText(
        `🗑 *Бронь удалена:*\n\n📅 ${booking.date}\n👤 ${booking.name} | кв. ${booking.apt}`,
        { chat_id: chatId, message_id: query.message.message_id, parse_mode: 'Markdown' }
      );
    } else {
      bot.answerCallbackQuery(query.id, { text: 'Не найдена' });
      bot.editMessageText('❌ Бронь уже удалена.', { chat_id: chatId, message_id: query.message.message_id });
    }
  }
});

module.exports = bot;
