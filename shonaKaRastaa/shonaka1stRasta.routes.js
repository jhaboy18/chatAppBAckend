import express from 'express'
import { getMe, login, logout, signup, updateProfile } from '../Shona_controller/shona.controller.js';
import { shonaKoprotectkro } from '../shona_Authrization/shonaw.middleware.js';

const router = express.Router();

//
router.post('/signup', signup);

// 
router.post('/login', login);

// 
router.get('/me', shonaKoprotectkro, getMe);

// 
router.post('/logout', shonaKoprotectkro, logout);

//

router.put('/update',shonaKoprotectkro,updateProfile)

export default router;
