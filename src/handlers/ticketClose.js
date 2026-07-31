const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const { getTicket, updateTicket } = require('../utils/ticketManager');
const { getConfig } = require('../utils/configManager');
const { closedTicketButtons } = require('../utils/components');
const { isStaff } = require('./ticketClaim');

async function promptCloseReason(interaction) {
  const ticket = getTicket(interaction.guild.id, interaction.channel.id);
  if (!ticket) return interaction.reply({ content: '❌ هذه ليست قناة تذكرة.', ephemeral: true });
  if (ticket.status === 'closed') {
    return interaction.reply({ content: '❗ التذكرة مغلقة بالفعل.', ephemeral: true });
  }

  const config = getConfig(interaction.guild.id);
  const canClose = ticket.ownerId === interaction.user.id || isStaff(interaction.member, config);
  if (!canClose) {
    return interaction.reply({ content: '❌ ليس لديك صلاحية إغلاق هذه التذكرة.', ephemeral: true });
  }

  const modal = new ModalBuilder()
    .setCustomId('ticket_close_modal')
    .setTitle('إغلاق التذكرة')
    .addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('close_reason')
          .setLabel('سبب الإغلاق (اختياري)')
          .setStyle(TextInputStyle.Paragraph)
          .setRequired(false)
          .setMaxLength(300)
      )
    );

  await interaction.showModal(modal);
}

async function handleCloseModalSubmit(interaction) {
  const reason = interaction.fields.getTextInputValue('close_reason') || null;
  const { guild, channel, user } = interaction;

  const ticket = updateTicket(guild.id, channel.id, {
    status: 'closed',
    closedAt: Date.now(),
    closedBy: user.id,
    closeReason: reason
  });

  // منع صاحب التذكرة من الكتابة بعد الإغلاق
  await channel.permissionOverwrites.edit(ticket.ownerId, { SendMessages: false }).catch(() => {});

  if (ticket.infoMessageId) {
    const msg = await channel.messages.fetch(ticket.infoMessageId).catch(() => null);
    if (msg) await msg.edit({ components: [closedTicketButtons()] }).catch(() => {});
  }

  await interaction.reply({
    content: `🔒 تم إغلاق التذكرة بواسطة <@${user.id}>${reason ? `\n**السبب:** ${reason}` : ''}`
  });
}

module.exports = { promptCloseReason, handleCloseModalSubmit };
