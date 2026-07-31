const { handleDepartmentSelect } = require('../handlers/ticketCreate');
const { handleClaim } = require('../handlers/ticketClaim');
const { promptCloseReason, handleCloseModalSubmit } = require('../handlers/ticketClose');
const { handleReopen } = require('../handlers/ticketReopen');
const { handleDelete } = require('../handlers/ticketDelete');
const { handleTranscriptButton } = require('../handlers/ticketTranscript');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction) {
    try {
      if (interaction.isChatInputCommand()) {
        const command = interaction.client.commands.get(interaction.commandName);
        if (!command) return;
        return command.execute(interaction);
      }

      if (interaction.isAutocomplete()) {
        const command = interaction.client.commands.get(interaction.commandName);
        if (command?.autocomplete) return command.autocomplete(interaction);
        return;
      }

      if (interaction.isStringSelectMenu() && interaction.customId === 'ticket_department_select') {
        return handleDepartmentSelect(interaction);
      }

      if (interaction.isButton()) {
        switch (interaction.customId) {
          case 'ticket_claim':
            return handleClaim(interaction);
          case 'ticket_close':
            return promptCloseReason(interaction);
          case 'ticket_reopen':
            return handleReopen(interaction);
          case 'ticket_delete':
            return handleDelete(interaction);
          case 'ticket_transcript':
            return handleTranscriptButton(interaction);
        }
      }

      if (interaction.isModalSubmit() && interaction.customId === 'ticket_close_modal') {
        return handleCloseModalSubmit(interaction);
      }
    } catch (err) {
      console.error('[interactionCreate] خطأ:', err);
      const payload = { content: '❌ حدث خطأ غير متوقع أثناء تنفيذ العملية.', ephemeral: true };
      if (interaction.deferred || interaction.replied) {
        interaction.editReply(payload).catch(() => {});
      } else if (interaction.isRepliable()) {
        interaction.reply(payload).catch(() => {});
      }
    }
  }
};
