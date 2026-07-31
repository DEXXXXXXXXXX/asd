const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const { getConfig, saveConfig } = require('../utils/configManager');
const { panelEmbed } = require('../utils/embeds');
const { departmentSelectMenu } = require('../utils/components');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket-panel')
    .setDescription('إرسال أو تعديل بانل التذاكر')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(sub =>
      sub
        .setName('send')
        .setDescription('إرسال بانل التذاكر لقناة')
        .addChannelOption(o =>
          o.setName('channel').setDescription('القناة').addChannelTypes(ChannelType.GuildText).setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub
        .setName('edit')
        .setDescription('تعديل شكل البانل')
        .addStringOption(o => o.setName('title').setDescription('عنوان البانل').setRequired(false))
        .addStringOption(o => o.setName('description').setDescription('وصف البانل').setRequired(false))
        .addStringOption(o => o.setName('color').setDescription('اللون (HEX مثل #2b2d31)').setRequired(false))
    ),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const config = getConfig(interaction.guild.id);

    if (sub === 'edit') {
      const title = interaction.options.getString('title');
      const description = interaction.options.getString('description');
      const color = interaction.options.getString('color');
      if (title) config.panel.title = title;
      if (description) config.panel.description = description;
      if (color) config.panel.color = color;
      saveConfig(interaction.guild.id, config);
      return interaction.reply({ content: '✅ تم تحديث شكل البانل.', ephemeral: true });
    }

    if (sub === 'send') {
      if (config.departments.length === 0) {
        return interaction.reply({
          content: '❌ أضف أقساماً أولاً باستخدام `/ticket-department add`.',
          ephemeral: true
        });
      }
      const channel = interaction.options.getChannel('channel');
      await channel.send({
        embeds: [panelEmbed(config.panel)],
        components: [departmentSelectMenu(config.departments)]
      });
      return interaction.reply({ content: `✅ تم إرسال البانل في <#${channel.id}>`, ephemeral: true });
    }
  }
};
