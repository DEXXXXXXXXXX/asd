const { ChannelType, PermissionFlagsBits } = require('discord.js');
const { getConfig, nextTicketNumber } = require('../utils/configManager');
const { createTicket, updateTicket, findOpenTicketByUser } = require('../utils/ticketManager');
const { ticketInfoEmbed } = require('../utils/embeds');
const { openTicketButtons } = require('../utils/components');

async function handleDepartmentSelect(interaction) {
  const { guild, user } = interaction;
  const config = getConfig(guild.id);

  const existing = findOpenTicketByUser(guild.id, user.id);
  if (existing) {
    return interaction.reply({
      content: `❗ لديك تذكرة مفتوحة بالفعل: <#${existing[0]}>`,
      ephemeral: true
    });
  }

  const deptId = interaction.values[0];
  const department = config.departments.find(d => d.id === deptId);
  if (!department) {
    return interaction.reply({ content: '❌ هذا القسم لم يعد متاحاً.', ephemeral: true });
  }

  await interaction.deferReply({ ephemeral: true });

  const number = nextTicketNumber(guild.id);
  const channelName = `ticket-${number}-${user.username}`.slice(0, 90).toLowerCase();

  const overwrites = [
    { id: guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] },
    {
      id: user.id,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.ReadMessageHistory,
        PermissionFlagsBits.AttachFiles
      ]
    },
    {
      id: guild.members.me.id,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.ManageChannels,
        PermissionFlagsBits.ReadMessageHistory
      ]
    }
  ];

  for (const roleId of config.adminRoles) {
    overwrites.push({
      id: roleId,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.ReadMessageHistory,
        PermissionFlagsBits.ManageMessages
      ]
    });
  }

  const channel = await guild.channels.create({
    name: channelName,
    type: ChannelType.GuildText,
    parent: department.categoryId || undefined,
    permissionOverwrites: overwrites
  });

  createTicket(guild.id, channel.id, {
    number,
    ownerId: user.id,
    department: department.id
  });

  const mentionRoles = config.adminRoles.map(r => `<@&${r}>`).join(' ');
  const dateStr = new Date().toLocaleString('ar-SA', { hour12: true });

  const infoMessage = await channel.send({
    content: `<@${user.id}> ${mentionRoles}`.trim(),
    embeds: [
      ticketInfoEmbed({
        owner: user.id,
        adminRoles: config.adminRoles,
        dateStr,
        number,
        departmentName: department.name
      })
    ],
    components: [openTicketButtons(false)]
  });

  updateTicket(guild.id, channel.id, { infoMessageId: infoMessage.id });

  if (config.welcomeMessage) {
    await channel.send({ content: config.welcomeMessage });
  }

  await interaction.editReply({ content: `✅ تم إنشاء تذكرتك: <#${channel.id}>` });
}

module.exports = { handleDepartmentSelect };
