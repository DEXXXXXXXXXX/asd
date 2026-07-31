module.exports = {
  name: 'ready',
  once: true,
  execute(client) {
    console.log(`✅ تم تسجيل الدخول باسم ${client.user.tag}`);
    client.user.setPresence({
      activities: [{ name: 'نظام التذاكر 🎫' }],
      status: 'online'
    });
  }
};
