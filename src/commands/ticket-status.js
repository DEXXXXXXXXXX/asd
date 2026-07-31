const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder().setName('ticket-status').setDescription('عرض حالة البوت'),

  async execute(interaction) {
    const client = interaction.client;
    const uptimeSec = Math.floor(client.uptime / 1000);
    const h = Math.floor(uptimeSec / 3600);
    const m = Math.floor((uptimeSec % 3600) / 60);
    const s = uptimeSec % 60;

    const embed = new EmbedBuilder()
      .setColor('#2b2d31')
      .setTitle('📊 حالة البوت')
      .addFields(
        { name: '🏓 البينق', value: `${client.ws.ping}ms`, inline: true },
        { name: '⏱️ مدة التشغيل', value: `${h}س ${m}د ${s}ث`, inline: true },
        { name: '🖥️ عدد السيرفرات', value: `${client.guilds.cache.size}`, inline: true }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};
