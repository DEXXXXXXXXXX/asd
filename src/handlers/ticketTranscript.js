const { getTicket } = require('../utils/ticketManager');
const { getConfig } = require('../utils/configManager');
const { generateTranscript } = require('../utils/transcript');

async function handleTranscriptButton(interaction) {
  const ticket = getTicket(interaction.guild.id, interaction.channel.id);
  if (!ticket) return interaction.reply({ content: '❌ هذه ليست قناة تذكرة.', ephemeral: true });

  await interaction.deferReply({ ephemeral: true });

  const config = getConfig(interaction.guild.id);
  const guild = interaction.guild;
  const owner = await guild.members.fetch(ticket.ownerId).catch(() => null);
  const claimer = ticket.claimedBy ? await guild.members.fetch(ticket.claimedBy).catch(() => null) : null;
  const department = config.departments.find(d => d.id === ticket.department);

  const transcriptFile = await generateTranscript(interaction.channel, {
    number: ticket.number,
    ownerTag: owner ? owner.user.tag : ticket.ownerId,
    claimedByTag: claimer ? claimer.user.tag : null,
    departmentName: department ? department.name : ticket.department,
    openTime: new Date(ticket.openedAt).toLocaleString('ar-SA', { hour12: true }),
    closeTime: ticket.closedAt
      ? new Date(ticket.closedAt).toLocaleString('ar-SA', { hour12: true })
      : null
  });

  await interaction.editReply({
    content: '📄 هذا ملف الترانسكريبت، افتحه في متصفحك لعرضه بشكل كامل.',
    files: [transcriptFile]
  });
}

module.exports = { handleTranscriptButton };
