import express from 'express'


import {
    sign_up,
    login
} from '../controllers/auth.js'



const router = express.Router();

router.post('/signup',sign_up);
router.post('/login', login);

export default router;