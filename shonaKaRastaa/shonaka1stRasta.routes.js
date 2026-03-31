import express from 'express'
import { getMe, login, logout, signup, updateProfile } from '../Shona_controller/shona.controller.js';
import { shonaKoprotectkro } from '../shona_Authrization/shonaw.middleware.js';

const router = express.Router();

// 🔐 Signup
router.post('/signup', signup);

// 🔐 Login
router.post('/login', login);

// 👤 Get current user
router.get('/me', shonaKoprotectkro, getMe);

// 🚪 Logout
router.post('/logout', shonaKoprotectkro, logout);

//shona ko update krwao

router.put('/update',shonaKoprotectkro,updateProfile)

export default router;