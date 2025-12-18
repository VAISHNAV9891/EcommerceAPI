import express from 'express'
import passport from 'passport';

import {
    sign_up,
    login,
    googleCallback
} from '../controllers/auth.js'



const router = express.Router();

router.post('/signup',sign_up);
router.post('/login', login);
//This endpoint hits when the user clicks the login button
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));


//Google callback here with a temporary code which is extracted by passport.js module in backend , and after that passport.js will use that code to get the user details from the google resource servers
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  googleCallback 
);

export default router;