require('dotenv').config();
const { Telegraf } = require('telegraf');

// Инициализация бота
const bot = new Telegraf(process.env.TELEGRAM_TOKEN);

// ID групп
const GROUP_WITH_CONTACTS = process.env.GROUP_WITH_CONTACTS;
const GROUP_NO_CONTACTS = process.env.GROUP_NO_CONTACTS;

// Функция для удаления контактов
function removeContacts(text) {
  return text
    .replace(/\b\d{10,}\b/g, '[номер скрыт]') // Удаляем номера
    .replace(/\b\S+@\S+\.\S+\b/g, '[email скрыт]'); // Удаляем email
}

// Обработка входящих сообщений
bot.on('text', (ctx) => {
  const originalText = ctx.message.text;
  const noContactsText = removeContacts(originalText);

  // Отправка сообщений в группы
  bot.telegram.sendMessage(GROUP_WITH_CONTACTS, originalText); // С контактами
  bot.telegram.sendMessage(GROUP_NO_CONTACTS, noContactsText); // Без контактов
});

// Запуск бота
bot.launch().then(() => {
  console.log('Бот запущен');
});

// Остановка gracefully
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
