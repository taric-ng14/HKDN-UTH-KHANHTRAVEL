const { data, add } = require('../lib/store');
module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });
  try {
    const { nhom, to, topicId } = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const team = data.teams[`${nhom}-${to}`];
    const room = data.rooms[String(to)];           // Tổ 1 -> Lễ tân, Tổ 2 -> Lữ hành, Tổ 3 -> Vận chuyển
    const topic = room && room.topics.find(t => t.id === topicId);
    if (!team || !topic) return res.status(400).json({ ok: false, error: 'Dữ liệu không hợp lệ' });
    const r = await add({
      nhom: Number(nhom), to: Number(to), phong: room.ten, topicId: topic.id, deTai: topic.ten,
      truong: team.truong, members: team.members,
    });
    res.status(r.ok ? 200 : r.code ? 409 : 502).json(r);
  } catch (e) {
    res.status(500).json({ ok: false, error: 'Lỗi máy chủ, vui lòng thử lại' });
  }
};
