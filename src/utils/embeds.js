const { EmbedBuilder } = require('discord.js');

function ticketInfoEmbed({ owner, adminRoles, dateStr, number, departmentName }) {
  const adminMentions = adminRoles.length
    ? adminRoles.map(r => `<@&${r}>`).join(', ')
    : 'لا يوجد';

  return new EmbedBuilder()
    .setColor('#2b2d31')
    .addFields(
      { name: '👤 صاحب التذكرة', value: `<@${owner}>`, inline: true },
      { name: '🛡️ مشرفو التذكرة', value: adminMentions, inline: true },
      { name: '\u200b', value: '\u200b', inline: true },
      { name: '📅 تاريخ الفتح', value: dateStr, inline: true },
      { name: '🔢 رقم التذكرة', value: `#${number}`, inline: true },
      { name: '📂 القسم', value: departmentName, inline: true }
    );
}

function closeLogEmbed({ title, openedBy, claimedBy, closedBy, openTime, closeTime, reason }) {
  return new EmbedBuilder()
    .setColor('#e74c3c')
    .setTitle(title || '🔒 تم إغلاق التذكرة')
    .addFields(
      { name: 'فُتحت بواسطة', value: `<@${openedBy}>`, inline: true },
      { name: 'استلمها', value: claimedBy ? `<@${claimedBy}>` : 'لا أحد', inline: true },
      { name: 'أُغلقت بواسطة', value: `<@${closedBy}>`, inline: true },
      { name: 'وقت الفتح', value: openTime, inline: true },
      { name: 'وقت الإغلاق', value: closeTime, inline: true },
      { name: '\u200b', value: '\u200b', inline: true },
      { name: 'سبب الإغلاق', value: reason || 'لم يتم تحديد سبب' }
    )
    .setTimestamp();
}

function panelEmbed(panelCfg) {
  return new EmbedBuilder()
    .setColor(panelCfg.color || '#2b2d31')
    .setTitle(panelCfg.title)
    .setDescription(panelCfg.description);
}

module.exports = { ticketInfoEmbed, closeLogEmbed, panelEmbed };
