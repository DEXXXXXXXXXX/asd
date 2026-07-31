const path = require('path');
const { TICKETS_DIR, readJSON, writeJSON } = require('./storage');

function getTicketsPath(guildId) {
  return path.join(TICKETS_DIR, `${guildId}.json`);
}

function getAllTickets(guildId) {
  return readJSON(getTicketsPath(guildId), {});
}

function saveAllTickets(guildId, tickets) {
  writeJSON(getTicketsPath(guildId), tickets);
}

function getTicket(guildId, channelId) {
  const tickets = getAllTickets(guildId);
  return tickets[channelId] || null;
}

function createTicket(guildId, channelId, data) {
  const tickets = getAllTickets(guildId);
  tickets[channelId] = {
    number: data.number,
    ownerId: data.ownerId,
    department: data.department,
    infoMessageId: null,
    claimedBy: null,
    status: 'open', // open | closed
    openedAt: Date.now(),
    closedAt: null,
    closedBy: null,
    closeReason: null
  };
  saveAllTickets(guildId, tickets);
  return tickets[channelId];
}

function updateTicket(guildId, channelId, patch) {
  const tickets = getAllTickets(guildId);
  if (!tickets[channelId]) return null;
  tickets[channelId] = { ...tickets[channelId], ...patch };
  saveAllTickets(guildId, tickets);
  return tickets[channelId];
}

function deleteTicket(guildId, channelId) {
  const tickets = getAllTickets(guildId);
  delete tickets[channelId];
  saveAllTickets(guildId, tickets);
}

function findOpenTicketByUser(guildId, userId) {
  const tickets = getAllTickets(guildId);
  return Object.entries(tickets).find(
    ([, t]) => t.ownerId === userId && t.status === 'open'
  );
}

module.exports = {
  getAllTickets,
  getTicket,
  createTicket,
  updateTicket,
  deleteTicket,
  findOpenTicketByUser
};
