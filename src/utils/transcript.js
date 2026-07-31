const { AttachmentBuilder } = require('discord.js');

async function fetchAllMessages(channel) {
  let messages = [];
  let lastId;
  while (true) {
    const options = { limit: 100 };
    if (lastId) options.before = lastId;
    const batch = await channel.messages.fetch(options);
    if (batch.size === 0) break;
    messages = messages.concat(Array.from(batch.values()));
    lastId = batch.last().id;
    if (batch.size < 100) break;
  }
  return messages.reverse(); // من الأقدم للأحدث
}

function escapeHtml(str = '') {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function renderAttachments(msg) {
  if (!msg.attachments || msg.attachments.size === 0) return '';
  return Array.from(msg.attachments.values())
    .map(att => {
      if (att.contentType && att.contentType.startsWith('image/')) {
        return `<div class="attachment"><img src="${att.url}" alt="${escapeHtml(att.name)}"></div>`;
      }
      return `<div class="attachment file"><a href="${att.url}" target="_blank">📎 ${escapeHtml(att.name)}</a></div>`;
    })
    .join('');
}

function renderEmbeds(msg) {
  if (!msg.embeds || msg.embeds.length === 0) return '';
  return msg.embeds
    .map(e => {
      const color = e.color ? `#${e.color.toString(16).padStart(6, '0')}` : '#2b2d31';
      const title = e.title ? `<div class="embed-title">${escapeHtml(e.title)}</div>` : '';
      const desc = e.description ? `<div class="embed-desc">${escapeHtml(e.description)}</div>` : '';
      const fields = (e.fields || [])
        .map(f => `<div class="embed-field"><b>${escapeHtml(f.name)}</b><br>${escapeHtml(f.value)}</div>`)
        .join('');
      return `<div class="embed" style="border-color:${color}">${title}${desc}${fields}</div>`;
    })
    .join('');
}

async function generateTranscript(channel, ticketMeta) {
  const messages = await fetchAllMessages(channel);

  const rows = messages
    .map(msg => {
      const avatar = msg.author.displayAvatarURL({ size: 64 });
      const time = new Date(msg.createdTimestamp).toLocaleString('ar-SA', { hour12: true });
      const content = msg.content ? `<div class="content">${escapeHtml(msg.content)}</div>` : '';
      return `
      <div class="message">
        <img class="avatar" src="${avatar}">
        <div class="body">
          <div class="meta"><span class="username">${escapeHtml(msg.author.username)}</span><span class="time">${time}</span></div>
          ${content}
          ${renderEmbeds(msg)}
          ${renderAttachments(msg)}
        </div>
      </div>`;
    })
    .join('\n');

  const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<title>ترانسكريبت التذكرة #${ticketMeta.number}</title>
<style>
  :root { color-scheme: dark; }
  * { box-sizing: border-box; }
  body {
    margin: 0; padding: 0;
    background: #313338; color: #dbdee1;
    font-family: 'Segoe UI', Tahoma, Arial, sans-serif;
  }
  header { background: #232428; padding: 20px 28px; border-bottom: 1px solid #1e1f22; }
  header h1 { margin: 0 0 6px 0; font-size: 20px; color: #fff; }
  header .sub { color: #949ba4; font-size: 13px; }
  .info-grid {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;
    background: #2b2d31; margin: 16px 28px; padding: 16px; border-radius: 8px;
    border: 1px solid #1e1f22;
  }
  .info-grid div span.label { display:block; color:#949ba4; font-size:12px; margin-bottom:4px; }
  .info-grid div span.value { color:#fff; font-size:14px; font-weight:600; }
  .messages { padding: 10px 28px 40px; }
  .message { display:flex; gap:14px; padding:10px 0; }
  .message .avatar { width:40px; height:40px; border-radius:50%; flex-shrink:0; }
  .message .body { flex:1; min-width:0; }
  .meta { display:flex; gap:10px; align-items:baseline; }
  .username { font-weight:700; color:#fff; }
  .time { font-size:11px; color:#949ba4; }
  .content { margin-top:2px; white-space:pre-wrap; word-wrap:break-word; line-height:1.45; }
  .embed { border-right:4px solid #2b2d31; background:#2b2d31; padding:10px 14px; border-radius:6px; margin-top:8px; max-width:520px; }
  .embed-title { font-weight:700; color:#fff; margin-bottom:4px; }
  .embed-desc { color:#dbdee1; font-size:14px; margin-bottom:6px; }
  .embed-field { font-size:13px; margin-top:6px; }
  .attachment { margin-top:8px; }
  .attachment img { max-width:400px; border-radius:6px; display:block; }
  .attachment.file a { color:#00a8fc; text-decoration:none; }
  footer { text-align:center; color:#6d6f78; font-size:12px; padding:20px; }
</style>
</head>
<body>
  <header>
    <h1>🎫 ترانسكريبت التذكرة #${ticketMeta.number}</h1>
    <div class="sub">${escapeHtml(channel.name)} — تم الإنشاء بواسطة نظام التذاكر</div>
  </header>
  <div class="info-grid">
    <div><span class="label">صاحب التذكرة</span><span class="value">${escapeHtml(ticketMeta.ownerTag)}</span></div>
    <div><span class="label">القسم</span><span class="value">${escapeHtml(ticketMeta.departmentName)}</span></div>
    <div><span class="label">استلمها</span><span class="value">${escapeHtml(ticketMeta.claimedByTag || 'لا أحد')}</span></div>
    <div><span class="label">وقت الفتح</span><span class="value">${ticketMeta.openTime}</span></div>
    <div><span class="label">وقت الإغلاق</span><span class="value">${ticketMeta.closeTime || '—'}</span></div>
    <div><span class="label">عدد الرسائل</span><span class="value">${messages.length}</span></div>
  </div>
  <div class="messages">
    ${rows || '<p style="color:#949ba4">لا توجد رسائل.</p>'}
  </div>
  <footer>تم إنشاء هذا الترانسكريبت تلقائياً • ${new Date().toLocaleString('ar-SA')}</footer>
</body>
</html>`;

  return new AttachmentBuilder(Buffer.from(html, 'utf8'), {
    name: `transcript-${ticketMeta.number}.html`
  });
}

module.exports = { generateTranscript };
