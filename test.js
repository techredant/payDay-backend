const axios = require("axios");
module.exports = (req, res) => {
  res.json({ ok: !!axios });
};
