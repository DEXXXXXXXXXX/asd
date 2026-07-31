const path = require('path');
const { CONFIG_DIR, readJSON, writeJSON } = require('./storage');

const DEFAULT_CONFIG = () => ({
  logChannelId: null,
  welcomeMessage:
    'شكراً لتواصلك معنا 🎫\nسيقوم أحد أعضاء فريق الدعم بمساعدتك في أقرب وقت ممكن، برجاء التحلي بالصبر.',
  panel: {
    title: '🎫 نظام التذاكر',
    description:
      'اختر القسم المناسب من القائمة أدناه لفتح تذكرة جديدة، وسيقوم فريقنا بالرد عليك في أقرب وقت.',
    color: '#2b2d31'
  },
  departments: [],
  adminRoles: [],
  ticketCounter: 0
});

function getConfigPath(guildId) {
  return path.join(CONFIG_DIR, `${guildId}.json`);
}

function getConfig(guildId) {
  const cfg = readJSON(getConfigPath(guildId), null);
  if (!cfg) return DEFAULT_CONFIG();
  // دمج مع القيم الافتراضية لضمان وجود كل الحقول حتى لو تم تحديث النظام لاحقاً
  return { ...DEFAULT_CONFIG(), ...cfg, panel: { ...DEFAULT_CONFIG().panel, ...(cfg.panel || {}) } };
}

function saveConfig(guildId, config) {
  writeJSON(getConfigPath(guildId), config);
  return config;
}

function ensureConfig(guildId) {
  const existing = readJSON(getConfigPath(guildId), null);
  if (existing) return getConfig(guildId);
  const fresh = DEFAULT_CONFIG();
  saveConfig(guildId, fresh);
  return fresh;
}

function nextTicketNumber(guildId) {
  const cfg = getConfig(guildId);
  cfg.ticketCounter += 1;
  saveConfig(guildId, cfg);
  return cfg.ticketCounter;
}

module.exports = { getConfig, saveConfig, ensureConfig, nextTicketNumber, DEFAULT_CONFIG };
