import express from 'express';
const router = express.Router();

import userController from '../controllers/userController';




router.get('/', userController.homePage);

router.get("/login",userController.loginPage); 

router.get("/logout",userController.logoutGet);  

router.get("/signup", userController.signUpPage);

router.get("/otp-login",userController.GetOtpLogin);

router.get("/otp-send",userController.GetOtpSend);

router.get("/women",userController.GetWomenCategory)

router.get("/men",userController.GetMenCategory)




router.post("/signup", userController.signUpPost);

router.post('/generate-otp',userController.generateOtp)

router.post('/verify-otp', userController.verifyOtp);

router.post("/login",userController.loginPost);

// router.post('/resendOtp',userController.resendOtp )




export default router;