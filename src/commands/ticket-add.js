const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { getTicket } = require('../utils/ticketManager');
const { getConfig } = require('../utils/configManager');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket-add')
    .setDescription('إضافة عضو إلى التذكرة الحالية')
    .addUserOption(o => o.setName('user').setDescription('العضو').setRequired(true)),

  async execute(interaction) {
    const ticket = getTicket(interaction.guild.id, interaction.channel.id);
    if (!ticket) {
      return interaction.reply({ content: '❌ هذا الأمر يعمل فقط داخل قناة تذكرة.', ephemeral: true });
    }

    const config = getConfig(interaction.guild.id);
    const isStaffMember =
      interaction.member.permissions.has(PermissionFlagsBits.ManageChannels) ||
      config.adminRoles.some(r => interaction.member.roles.cache.has(r));

    if (!isStaffMember && interaction.user.id !== ticket.ownerId) {
      return interaction.reply({ content: '❌ ليس لديك صلاحية لإضافة أعضاء.', ephemeral: true });
    }

    const user = interaction.options.getUser('user');
    await interaction.channel.permissionOverwrites.edit(user.id, {
      ViewChannel: true,
      SendMessages: true,
      ReadMessageHistory: true
    });
    await interaction.reply({ content: `✅ تم إضافة <@${user.id}> إلى التذكرة.` });
  }
};
