require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { REST, Routes } = require('discord.js');

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
for (const file of fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'))) {
  const command = require(path.join(commandsPath, file));
  commands.push(command.data.toJSON());
}

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    const route = process.env.GUILD_ID
      ? Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID)
      : Routes.applicationCommands(process.env.CLIENT_ID);

    console.log(`⏳ جاري تسجيل ${commands.length} أمر...`);
    await rest.put(route, { body: commands });
    console.log('✅ تم تسجيل الأوامر بنجاح!');
    console.log(
      process.env.GUILD_ID
        ? 'ملاحظة: الأوامر مسجلة على سيرفر واحد فقط (سريعة للتجربة الفورية).'
        : 'ملاحظة: الأوامر عامة (Global) وقد تأخذ حتى ساعة لتظهر في كل السيرفرات.'
    );
  } catch (err) {
    console.error('❌ فشل تسجيل الأوامر:', err);
  }
})();
