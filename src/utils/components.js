const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder
} = require('discord.js');

function openTicketButtons(claimed = false) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('ticket_claim')
      .setLabel(claimed ? 'تم الاستلام' : 'استلام')
      .setEmoji('🙋')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(claimed),
    new ButtonBuilder()
      .setCustomId('ticket_close')
      .setLabel('إغلاق')
      .setEmoji('🔒')
      .setStyle(ButtonStyle.Danger)
  );
}

function closedTicketButtons() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('ticket_reopen')
      .setLabel('إعادة فتح')
      .setEmoji('🔓')
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId('ticket_delete')
      .setLabel('حذف')
      .setEmoji('🗑️')
      .setStyle(ButtonStyle.Danger),
    new ButtonBuilder()
      .setCustomId('ticket_transcript')
      .setLabel('الترانسكريبت')
      .setEmoji('📄')
      .setStyle(ButtonStyle.Secondary)
  );
}

function departmentSelectMenu(departments) {
  return new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId('ticket_department_select')
      .setPlaceholder('اختر القسم لفتح تذكرة')
      .addOptions(
        departments.map(d => ({
          label: d.name,
          value: d.id,
          emoji: d.emoji || undefined
        }))
      )
  );
}

module.exports = { openTicketButtons, closedTicketButtons, departmentSelectMenu };
