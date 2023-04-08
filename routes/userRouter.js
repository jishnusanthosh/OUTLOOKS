import express from 'express';
const router = express.Router();

import userController from '../controllers/userController';



router.get('/',userController.home);

router.get('/login',userController.login);

router.get('/otp-login',userController.getOtpLogin);

export default router;
