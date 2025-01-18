require('dotenv').config(); // Загружаем переменные окружения из .env
const { Telegraf, Markup } = require('telegraf');

// Токен второго бота
const bot = new Telegraf(process.env.TELEGRAM_TOKEN);

// ID группы с контактами
const groupWithContacts = process.env.GROUP_WITH_CONTACTS;
// ID группы без контактов
const groupNoContacts = process.env.GROUP_NO_CONTACTS;
// PIN-код
const pinCode = '6932';
// Ссылка на оформление подписки
const subscriptionLink = 'https://t.me/YourTelegramAccount';

// Храним авторизованных пользователей
const authorizedUsers = new Set();

// Функция для удаления контактов из текста
function sanitizeMessage(text) {
  // Удаляем телефоны и email
  text = text.replace(/\b((00420|\+420)[\s\d]{5,}|\d{6,})\b/g, '[Доступно по подписке]');
  text = text.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, '[Доступно по подписке]');
  return text;
}

// Команда /start
bot.start((ctx) => {
  ctx.reply('Введите пин-код для работы с ботом:');
});

// Обработка текстовых сообщений
bot.on('text', async (ctx) => {
  const userId = ctx.from.id;
  const text = ctx.message.text;

  // Проверка авторизации
  if (!authorizedUsers.has(userId)) {
    if (text === pinCode) {
      authorizedUsers.add(userId);
      return ctx.reply('Вы успешно авторизованы!');
    } else {
      return ctx.reply('Неверный пин-код. Попробуйте снова.');
    }
  }

  // Обработка сообщения после авторизации
  const sanitizedMessage = sanitizeMessage(text);

  // Отправляем сообщение в группу с контактами
  if (groupWithContacts) {
    await ctx.telegram.sendMessage(groupWithContacts, text);
  }

  // Отправляем сообщение в группу без контактов
  if (groupNoContacts) {
    await ctx.telegram.sendMessage(
      groupNoContacts,
      sanitizedMessage,
      Markup.inlineKeyboard([Markup.button.url('Оформить подписку', subscriptionLink)])
    );
  }

  // Уведомляем отправителя
  await ctx.reply(
    'Сообщение отправлено.',
    Markup.inlineKeyboard([Markup.button.url('Оформить подписку', subscriptionLink)])
  );
});

// Обработчик ошибок
bot.catch((err) => {
  console.error('Ошибка бота:', err);
});

// Запуск бота
bot.launch().then(() => {
  console.log('Второй бот запущен!');
});

// Остановка бота
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
