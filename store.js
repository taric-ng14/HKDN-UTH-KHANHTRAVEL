// Lớp lưu trữ: Google Sheet (qua Apps Script). Nếu chưa cấu hình -> chế độ DEMO lưu tạm trong bộ nhớ.
const data = require('./data.json');
const URL_ = process.env.APPS_SCRIPT_URL;
const SECRET = process.env.APPS_SCRIPT_SECRET || '';
const mem = (globalThis.__khanhMem = globalThis.__khanhMem || []);

async function list() {
  if (!URL_) return { ok: true, demo: true, selections: mem };
  const r = await fetch(`${URL_}?secret=${encodeURIComponent(SECRET)}`, { redirect: 'follow' });
  const j = await r.json();
  return j;
}

async function add(record) {
  if (!URL_) {
    if (mem.some(s => s.topicId === record.topicId)) return { ok: false, code: 'TOPIC_TAKEN', error: 'Đề tài này vừa được tổ khác chọn.', selections: mem };
    if (mem.some(s => s.nhom === record.nhom && s.to === record.to)) return { ok: false, code: 'TEAM_DONE', error: 'Tổ của bạn đã chọn đề tài rồi.', selections: mem };
    mem.push({ ...record, time: new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }) });
    return { ok: true, demo: true, selections: mem };
  }
  const r = await fetch(URL_, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ secret: SECRET, record }),
    redirect: 'follow',
  });
  return r.json();
}

module.exports = { data, list, add };
