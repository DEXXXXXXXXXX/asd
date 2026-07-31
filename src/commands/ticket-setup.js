const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { ensureConfig } = require('../utils/configManager');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket-setup')
    .setDescription('تهيئة نظام التذاكر لأول مرة في السيرفر')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    ensureConfig(interaction.guild.id);
    await interaction.reply({
      content:
        '✅ تم تجهيز نظام التذاكر بنجاح!\n\nالخطوات التالية:\n1️⃣ `/ticket-department add` — إضافة الأقسام (حتى 5)\n2️⃣ `/ticket-role add` — تحديد رتب مشرفي التذاكر\n3️⃣ `/ticket-logchannel` — تحديد قناة السجلات\n4️⃣ `/ticket-panel send` — إرسال بانل التذاكر',
      ephemeral: true
    });
  }
};
