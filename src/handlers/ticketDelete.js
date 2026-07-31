const { getTicket, deleteTicket } = require('../utils/ticketManager');
const { getConfig } = require('../utils/configManager');
const { generateTranscript } = require('../utils/transcript');
const { closeLogEmbed } = require('../utils/embeds');
const { isStaff } = require('./ticketClaim');

async function handleDelete(interaction) {
  const config = getConfig(interaction.guild.id);
  if (!isStaff(interaction.member, config)) {
    return interaction.reply({ content: '❌ ليس لديك صلاحية حذف التذاكر.', ephemeral: true });
  }

  const ticket = getTicket(interaction.guild.id, interaction.channel.id);
  if (!ticket) return interaction.reply({ content: '❌ هذه ليست قناة تذكرة.', ephemeral: true });

  await interaction.reply({ content: '🗑️ جاري إنشاء الترانسكريبت وحذف التذكرة...' });

  const guild = interaction.guild;
  const owner = await guild.members.fetch(ticket.ownerId).catch(() => null);
  const claimer = ticket.claimedBy ? await guild.members.fetch(ticket.claimedBy).catch(() => null) : null;
  const department = config.departments.find(d => d.id === ticket.department);

  const meta = {
    number: ticket.number,
    ownerTag: owner ? owner.user.tag : ticket.ownerId,
    claimedByTag: claimer ? claimer.user.tag : null,
    departmentName: department ? department.name : ticket.department,
    openTime: new Date(ticket.openedAt).toLocaleString('ar-SA', { hour12: true }),
    closeTime: ticket.closedAt
      ? new Date(ticket.closedAt).toLocaleString('ar-SA', { hour12: true })
      : new Date().toLocaleString('ar-SA', { hour12: true })
  };

  const transcriptFile = await generateTranscript(interaction.channel, meta);

  if (config.logChannelId) {
    const logChannel = await guild.channels.fetch(config.logChannelId).catch(() => null);
    if (logChannel) {
      await logChannel
        .send({
          embeds: [
            closeLogEmbed({
              openedBy: ticket.ownerId,
              claimedBy: ticket.claimedBy,
              closedBy: ticket.closedBy || interaction.user.id,
              openTime: meta.openTime,
              closeTime: meta.closeTime,
              reason: ticket.closeReason
            })
          ],
          files: [transcriptFile]
        })
        .catch(() => {});
    }
  }

  if (owner) {
    await owner
      .send({
        content: `📄 هذه نسخة كاملة (ترانسكريبت) من تذكرتك رقم #${ticket.number} في سيرفر **${guild.name}**.\nيمكنك فتح الملف في متصفحك لعرض كل الرسائل التي جرت في التذكرة.`,
        files: [transcriptFile]
      })
      .catch(() => {});
  }

  deleteTicket(guild.id, interaction.channel.id);
  setTimeout(() => interaction.channel.delete().catch(() => {}), 3000);
}

module.exports = { handleDelete };
