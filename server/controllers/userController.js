const User = require("../models/User");

exports.upsert = async (req, res) => {
  try {
    const { cflow_id, name, email, avatar_url } = req.body;
    if (!cflow_id || !name || !email) {
      return res.status(400).json({ error: "cflow_id, name, and email are required." });
    }
    const user = await User.upsert({ cflow_id, name, email, avatar_url });
    return res.json(user);
  } catch (err) {
    console.error("[UserCtrl] upsert:", err.message);
    return res.status(500).json({ error: "Failed to sync user." });
  }
};

exports.search = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 1) return res.json([]);
    const users = await User.search(q);
    return res.json(users);
  } catch (err) {
    console.error("[UserCtrl] search:", err.message);
    return res.status(500).json({ error: "Search failed." });
  }
};

exports.listAll = async (_req, res) => {
  try {
    const users = await User.listAll();
    return res.json(users);
  } catch (err) {
    console.error("[UserCtrl] listAll:", err.message);
    return res.status(500).json({ error: "Failed to list users." });
  }
};
