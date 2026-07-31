const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const CONFIG_DIR = path.join(DATA_DIR, 'config');
const TICKETS_DIR = path.join(DATA_DIR, 'tickets');

for (const dir of [DATA_DIR, CONFIG_DIR, TICKETS_DIR]) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function readJSON(filePath, fallback) {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error(`[storage] فشل قراءة الملف ${filePath}:`, err);
    return fallback;
  }
}

function writeJSON(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

module.exports = { CONFIG_DIR, TICKETS_DIR, readJSON, writeJSON };
