const express = require("express");
const { initiateStkPush, mpesaCallback } = require("../controllers/mpesaController.js");

const router = express.Router();

router.post("/stk-push", initiateStkPush);
router.post("/callback", mpesaCallback);

module.exports = router;
