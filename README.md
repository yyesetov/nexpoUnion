# Nexpo Union — Бронирование мангальной зоны

Веб-приложение для бронирования мангальной зоны в ЖК Nexpo Union. Включает веб-интерфейс с календарём, REST API и Telegram-бота для управления бронями.

## Быстрый старт

### 1. Установить зависимости

```bash
npm install
```

### 2. Настроить переменные окружения

Скопировать `.env.example` в `.env` и заполнить:

```bash
cp .env.example .env
```

| Переменная           | Описание                                          | По умолчанию |
|----------------------|---------------------------------------------------|--------------|
| `PORT`               | Порт сервера                                      | `3000`       |
| `TELEGRAM_BOT_TOKEN` | Токен бота от @BotFather (опционально)            | —            |
| `ADMIN_CHAT_IDS`     | ID чатов администраторов через запятую (опционально) | —          |

### 3. Запустить

**Разработка** (авто-перезапуск при изменениях):

```bash
npm run dev
```

**Продакшн** через PM2:

```bash
# Установить PM2 глобально (если ещё не установлен)
npm install -g pm2

# Запустить
pm2 start server/index.js --name mangal

# Полезные команды PM2
pm2 logs mangal      # Логи
pm2 restart mangal  # Перезапуск
pm2 stop mangal     # Остановить
pm2 delete mangal    # Удалить из PM2

# Автозапуск при перезагрузке сервера
pm2 startup
pm2 save
```

Приложение будет доступно по адресу `http://localhost:3000`.

## Структура проекта

```
├── index.html              # Главная HTML-страница (SPA)
├── styles.css              # Стили
├── src/                    # Фронтенд (React + Babel in-browser)
│   ├── app.jsx             # Точка входа React-приложения
│   ├── calendar.jsx        # Компонент календаря
│   ├── form.jsx            # Форма бронирования
│   ├── modals.jsx          # Модальные окна
│   ├── sections.jsx        # Секции страницы
│   ├── store.jsx           # Стейт-менеджмент
│   ├── i18n.jsx            # Локализация
│   └── tweaks.jsx          # Настройки внешнего вида
├── server/                 # Бэкенд (Express)
│   ├── index.js            # Точка входа сервера
│   ├── routes.js           # API-роуты
│   ├── db.js               # Работа с SQLite (sql.js)
│   └── bot.js              # Telegram-бот
├── data/
│   └── bookings.db         # Файл базы данных SQLite
├── scripts/
│   └── migrate-from-sheet.js  # Миграция данных из Google Sheets
├── uploads/                # Загруженные файлы
├── .env.example            # Шаблон переменных окружения
└── package.json
```

## API

Все эндпоинты находятся по пути `/api/bookings`.

| Метод   | Путь                  | Описание                          |
|---------|-----------------------|-----------------------------------|
| `GET`   | `/api/bookings`       | Список всех бронирований          |
| `GET`   | `/api/bookings?date=` | Бронирования на конкретную дату   |
| `GET`   | `/api/bookings?apt=`  | Бронирования по номеру квартиры   |
| `POST`  | `/api/bookings`       | Создать бронирование              |
| `PATCH` | `/api/bookings/:id`   | Обновить бронирование (оплата)    |

### Создание бронирования (POST)

```json
{
  "date": "2026-06-15",
  "name": "Имя",
  "phone": "+7 777 123 4567",
  "apt": "42"
}
```

## Telegram-бот

Бот запускается автоматически при наличии `TELEGRAM_BOT_TOKEN` в `.env`. Если указаны `ADMIN_CHAT_IDS`, доступ ограничен только этими пользователями.

## Миграция данных

Для импорта данных из Google Sheets:

```bash
node scripts/migrate-from-sheet.js
```

## SSL-сертификат (Let's Encrypt)

Сертификаты расположены в `/etc/letsencrypt/live/nexpo-union.kz/` и прописаны в конфиге Nginx `/etc/nginx/sites-enabled/mangal`.

### Проверить статус сертификата

```bash
# Срок действия сертификата
sudo certbot certificates

# Проверить через OpenSSL
openssl s_client -connect nexpo-union.kz:443 -servername nexpo-union.kz 2>/dev/null | openssl x509 -noout -dates
```

### Обновить сертификат

Certbot обновляет сертификаты автоматически по таймеру. Проверить таймер:

```bash
sudo systemctl status certbot.timer
```

Ручное обновление:

```bash
sudo certbot renew
sudo systemctl reload nginx
```

### Если Nginx не запускается из-за сертификата

Проверить конфиг:

```bash
sudo nginx -t
```

Убедиться, что в `/etc/nginx/sites-enabled/mangal` указаны правильные пути:

```nginx
ssl_certificate /etc/letsencrypt/live/nexpo-union.kz/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/nexpo-union.kz/privkey.pem;
```

Затем:

```bash
sudo nginx -t && sudo systemctl start nginx
```

## Технологии

- **Фронтенд:** React 18 (UMD, без сборки, Babel in-browser)
- **Бэкенд:** Node.js, Express
- **БД:** SQLite через sql.js (файл `data/bookings.db`)
- **Бот:** node-telegram-bot-api
- **Процесс-менеджер:** PM2
