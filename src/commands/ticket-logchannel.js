const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const { getConfig, saveConfig } = require('../utils/configManager');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket-logchannel')
    .setDescription('تحديد قناة سجلات التذاكر')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption(o =>
      o
        .setName('channel')
        .setDescription('قناة السجلات')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    ),

  async execute(interaction) {
    const channel = interaction.options.getChannel('channel');
    const config = getConfig(interaction.guild.id);
    config.logChannelId = channel.id;
    saveConfig(interaction.guild.id, config);
    await interaction.reply({ content: `✅ تم تحديد قناة السجلات: <#${channel.id}>`, ephemeral: true });
  }
};
