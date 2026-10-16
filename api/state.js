
const { list } = require("../lib/store");

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store, max-age=0");

  try {
    const result = await list();

    return res
      .status(result.ok ? 200 : 502)
      .json({
        ok: Boolean(result.ok),
        demo: Boolean(result.demo),
        selections: result.selections || [],
      });
  } catch (error) {
    console.error("API state error:", error.name);

    return res.status(502).json({
      ok: false,
      error: "Không đọc được dữ liệu",
      selections: [],
    });
  }
};
