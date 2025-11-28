import express from 'express';
import { tokenVerifier } from '../middlewares/verifyToken.js';
import { createPaymentIntent } from '../controllers/payment.js';

const router = express.Router();

router.post('/createPaymentEnv', tokenVerifier, createPaymentIntent);

export default router;