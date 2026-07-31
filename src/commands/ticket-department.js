const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const { getConfig, saveConfig } = require('../utils/configManager');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket-department')
    .setDescription('إدارة أقسام التذاكر (حتى 5 أقسام)')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(sub =>
      sub
        .setName('add')
        .setDescription('إضافة قسم جديد')
        .addStringOption(o => o.setName('name').setDescription('اسم القسم').setRequired(true))
        .addStringOption(o => o.setName('emoji').setDescription('إيموجي القسم').setRequired(false))
        .addChannelOption(o =>
          o
            .setName('category')
            .setDescription('الكاتاقوري التي تُنشأ بها تذاكر هذا القسم')
            .addChannelTypes(ChannelType.GuildCategory)
            .setRequired(false)
        )
    )
    .addSubcommand(sub =>
      sub
        .setName('remove')
        .setDescription('حذف قسم')
        .addStringOption(o =>
          o.setName('name').setDescription('اسم القسم المراد حذفه').setRequired(true).setAutocomplete(true)
        )
    )
    .addSubcommand(sub => sub.setName('list').setDescription('عرض جميع الأقسام')),

  async autocomplete(interaction) {
    const config = getConfig(interaction.guild.id);
    const focused = interaction.options.getFocused();
    const choices = config.departments
      .filter(d => d.name.toLowerCase().includes(focused.toLowerCase()))
      .map(d => ({ name: d.name, value: d.name }))
      .slice(0, 25);
    await interaction.respond(choices);
  },

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const config = getConfig(interaction.guild.id);

    if (sub === 'add') {
      if (config.departments.length >= 5) {
        return interaction.reply({ content: '❌ لا يمكن إضافة أكثر من 5 أقسام.', ephemeral: true });
      }
      const name = interaction.options.getString('name');
      const emoji = interaction.options.getString('emoji');
      const category = interaction.options.getChannel('category');

      if (config.departments.some(d => d.name === name)) {
        return interaction.reply({ content: '❌ يوجد قسم بنفس الاسم مسبقاً.', ephemeral: true });
      }

      config.departments.push({
        id: name.toLowerCase().replace(/\s+/g, '-').slice(0, 30) + '-' + Date.now().toString(36).slice(-4),
        name,
        emoji: emoji || undefined,
        categoryId: category ? category.id : null
      });
      saveConfig(interaction.guild.id, config);
      return interaction.reply({
        content: `✅ تم إضافة قسم **${name}**. (${config.departments.length}/5)`,
        ephemeral: true
      });
    }

    if (sub === 'remove') {
      const name = interaction.options.getString('name');
      const before = config.departments.length;
      config.departments = config.departments.filter(d => d.name !== name);
      if (config.departments.length === before) {
        return interaction.reply({ content: '❌ لم يتم العثور على هذا القسم.', ephemeral: true });
      }
      saveConfig(interaction.guild.id, config);
      return interaction.reply({ content: `✅ تم حذف قسم **${name}**.`, ephemeral: true });
    }

    if (sub === 'list') {
      if (config.departments.length === 0) {
        return interaction.reply({ content: 'لا توجد أقسام مضافة بعد.', ephemeral: true });
      }
      const list = config.departments
        .map(
          (d, i) =>
            `**${i + 1}.** ${d.emoji || ''} ${d.name} — ${d.categoryId ? `<#${d.categoryId}>` : 'بدون كاتاقوري محددة'}`
        )
        .join('\n');
      return interaction.reply({ content: list, ephemeral: true });
    }
  }
};
