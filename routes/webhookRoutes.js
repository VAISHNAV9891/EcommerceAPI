import express from 'express';
import { handleStripeWebhook } from '../controllers/payment.js';

const router = express.Router();

// Is route par express.raw() middleware zaroori hai
router.post('/', express.raw({ type: 'application/json' }), handleStripeWebhook);

export default router;