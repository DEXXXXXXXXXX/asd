const { getTicket, updateTicket } = require('../utils/ticketManager');
const { getConfig } = require('../utils/configManager');
const { openTicketButtons } = require('../utils/components');
const { isStaff } = require('./ticketClaim');

async function handleReopen(interaction) {
  const config = getConfig(interaction.guild.id);
  if (!isStaff(interaction.member, config)) {
    return interaction.reply({ content: '❌ ليس لديك صلاحية إعادة فتح التذاكر.', ephemeral: true });
  }

  const ticket = getTicket(interaction.guild.id, interaction.channel.id);
  if (!ticket || ticket.status !== 'closed') {
    return interaction.reply({ content: '❌ هذه التذكرة ليست مغلقة.', ephemeral: true });
  }

  await interaction.channel.permissionOverwrites
    .edit(ticket.ownerId, { SendMessages: true })
    .catch(() => {});

  const updated = updateTicket(interaction.guild.id, interaction.channel.id, {
    status: 'open',
    closedAt: null,
    closedBy: null,
    closeReason: null
  });

  if (ticket.infoMessageId) {
    const msg = await interaction.channel.messages.fetch(ticket.infoMessageId).catch(() => null);
    if (msg) await msg.edit({ components: [openTicketButtons(!!updated.claimedBy)] }).catch(() => {});
  }

  await interaction.reply({ content: `🔓 تم إعادة فتح التذكرة بواسطة <@${interaction.user.id}>` });
}

module.exports = { handleReopen };
