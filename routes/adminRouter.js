import express from 'express';
const router = express.Router();
import adminController from '../controllers/adminController';


router.get('/',adminController.Adminlogin);
// router.get('/home',userController.home);

// router.get('/login',userController.login);

// router.get('/otp-login',userController.getOtpLogin);

// router.get('/women',userController.women)

// router.get('/men',userController.men)

export default router;










