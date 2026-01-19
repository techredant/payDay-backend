const express = require("express");
import { initiateStkPush, mpesaCallback } from "../controllers/mpesaController.js";

const router = express.Router();

// Initiate payment
router.post("/stk", initiateStkPush);

// M-Pesa callback
router.post("/callback", mpesaCallback);

export default router;
