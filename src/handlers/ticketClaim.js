const { getTicket, updateTicket } = require('../utils/ticketManager');
const { getConfig } = require('../utils/configManager');
const { openTicketButtons } = require('../utils/components');

function isStaff(member, config) {
  return (
    member.permissions.has('ManageChannels') ||
    config.adminRoles.some(r => member.roles.cache.has(r))
  );
}

async function handleClaim(interaction) {
  const config = getConfig(interaction.guild.id);
  if (!isStaff(interaction.member, config)) {
    return interaction.reply({ content: '❌ ليس لديك صلاحية استلام التذاكر.', ephemeral: true });
  }

  const ticket = getTicket(interaction.guild.id, interaction.channel.id);
  if (!ticket) return interaction.reply({ content: '❌ هذه ليست قناة تذكرة.', ephemeral: true });
  if (ticket.claimedBy) {
    return interaction.reply({
      content: `❗ التذكرة مستلمة بالفعل من <@${ticket.claimedBy}>.`,
      ephemeral: true
    });
  }

  updateTicket(interaction.guild.id, interaction.channel.id, { claimedBy: interaction.user.id });

  if (ticket.infoMessageId) {
    const msg = await interaction.channel.messages.fetch(ticket.infoMessageId).catch(() => null);
    if (msg) await msg.edit({ components: [openTicketButtons(true)] }).catch(() => {});
  }

  await interaction.reply({ content: `🙋 تم استلام التذكرة من قبل <@${interaction.user.id}>` });
}

module.exports = { handleClaim, isStaff };
