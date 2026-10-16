const { list } = require('../lib/store');
module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  try {
    const r = await list();
    res.status(r.ok ? 200 : 502).json({ ok: !!r.ok, demo: !!r.demo, selections: r.selections || [] });
  } catch (e) {
    res.status(502).json({ ok: false, error: 'Không đọc được dữ liệu', selections: [] });
  }
};
