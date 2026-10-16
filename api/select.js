
const { data, add } = require("../lib/store");

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store, max-age=0");

  if (req.method !== "POST") {
    return res.status(405).json({
      ok: false,
      error: "Method not allowed",
    });
  }

  try {
    const body =
      typeof req.body === "string"
        ? JSON.parse(req.body)
        : req.body || {};

    const nhom = Number(body.nhom);
    const to = Number(body.to);
    const topicId = body.topicId;

    if (
      !Number.isInteger(nhom) ||
      nhom < 1 ||
      nhom > 3 ||
      !Number.isInteger(to) ||
      to < 1 ||
      to > 3 ||
      typeof topicId !== "string"
    ) {
      return res.status(400).json({
        ok: false,
        error: "Dữ liệu không hợp lệ",
      });
    }

    const team = data.teams[`${nhom}-${to}`];
    const room = data.rooms[String(to)];
    const topic =
      room && room.topics.find((item) => item.id === topicId);

    if (!team || !topic) {
      return res.status(400).json({
        ok: false,
        error: "Dữ liệu không hợp lệ",
      });
    }

    const result = await add({
      nhom,
      to,
      phong: room.ten,
      topicId: topic.id,
      deTai: topic.ten,
      truong: team.truong,
      members: team.members,
    });

    return res
      .status(result.ok ? 200 : result.code ? 409 : 502)
      .json(result);
  } catch (error) {
    console.error("API select error:", error.name);

    return res.status(500).json({
      ok: false,
      error: "Lỗi máy chủ, vui lòng thử lại",
    });
  }
};
