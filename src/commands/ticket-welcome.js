const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { getConfig, saveConfig } = require('../utils/configManager');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket-welcome')
    .setDescription('تحديد رسالة الترحيب التي تُرسل عند فتح التذكرة')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption(o => o.setName('message').setDescription('نص رسالة الترحيب').setRequired(true)),

  async execute(interaction) {
    const message = interaction.options.getString('message');
    const config = getConfig(interaction.guild.id);
    config.welcomeMessage = message;
    saveConfig(interaction.guild.id, config);
    await interaction.reply({ content: '✅ تم تحديث رسالة الترحيب.', ephemeral: true });
  }
};
