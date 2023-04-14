import express from 'express';
const router = express.Router();

import userController from '../controllers/userController';




router.get('/', userController.homePage);
router.get("/login",userController.loginPage);      
router.post("/login",userController.loginPost);
router.get("/logout",userController.logoutGet);

router.get("/signup", userController.signUpPage);
router.post("/signup", userController.signUpPost);
router.post('/generate-otp',userController.generateOtp)
router.post('/verify-otp', userController.verifyOtp);



export default router;