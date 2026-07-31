const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { getConfig, saveConfig } = require('../utils/configManager');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket-role')
    .setDescription('إدارة رتب مشرفي التذاكر')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(sub =>
      sub
        .setName('add')
        .setDescription('إضافة رتبة مشرف تذاكر')
        .addRoleOption(o => o.setName('role').setDescription('الرتبة').setRequired(true))
    )
    .addSubcommand(sub =>
      sub
        .setName('remove')
        .setDescription('إزالة رتبة مشرف تذاكر')
        .addRoleOption(o => o.setName('role').setDescription('الرتبة').setRequired(true))
    )
    .addSubcommand(sub => sub.setName('list').setDescription('عرض رتب مشرفي التذاكر')),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const config = getConfig(interaction.guild.id);

    if (sub === 'add') {
      const role = interaction.options.getRole('role');
      if (config.adminRoles.includes(role.id)) {
        return interaction.reply({ content: '❗ هذه الرتبة مضافة بالفعل.', ephemeral: true });
      }
      config.adminRoles.push(role.id);
      saveConfig(interaction.guild.id, config);
      return interaction.reply({ content: `✅ تم إضافة رتبة <@&${role.id}> كمشرف تذاكر.`, ephemeral: true });
    }

    if (sub === 'remove') {
      const role = interaction.options.getRole('role');
      config.adminRoles = config.adminRoles.filter(r => r !== role.id);
      saveConfig(interaction.guild.id, config);
      return interaction.reply({ content: `✅ تم إزالة رتبة <@&${role.id}>.`, ephemeral: true });
    }

    if (sub === 'list') {
      if (config.adminRoles.length === 0) {
        return interaction.reply({ content: 'لا توجد رتب مضافة بعد.', ephemeral: true });
      }
      return interaction.reply({ content: config.adminRoles.map(r => `<@&${r}>`).join('\n'), ephemeral: true });
    }
  }
};
