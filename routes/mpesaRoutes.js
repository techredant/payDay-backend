import express from "express";
import { initiateStkPush, mpesaCallback } from "../controllers/mpesaController";


const router = express.Router();

router.post("/stk-push", initiateStkPush);
router.post("/callback", mpesaCallback);

export default router;
