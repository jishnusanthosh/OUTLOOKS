import express from 'express';
const router = express.Router();

import userController from '../controllers/userController';




router.get('/', userController.homePage);

router.get("/login",userController.loginPage); 

router.get("/logout",userController.logoutGet);  

router.get("/signup", userController.signUpPage);

router.get("/otp-login",userController.GetOtpLogin);

router.get("/otp-send",userController.GetOtpSend);


router.get("/cart",userController.GetCart)

router.get("/shopView/:id",userController.getShopView)


router.get("/viewProduct/:id",userController.getProductView)

router.get("/userProfile/:id",userController.getUserProfile);

router.post("/deleteCartProduct",userController.deleteCartProduct)


router.get("/addToCart/:id",userController.addToCart);

router.get("/GetcheckOut",userController.getCheckOut);



router.post("/signup", userController.signUpPost);

router.post('/generate-otp',userController.generateOtp)

router.post('/verify-otp', userController.verifyOtp);

router.post("/login",userController.loginPost);


 router.post('/resendOtp',userController.resendOtp )

 router.post('/update-product-quantity',userController.updateProductQuantity)

 router.post("/addAddress",userController.addAddress)

 router.post("/placeOrder",userController.placeOrderPost)

 router.get("/orderPlaced",userController.getOrderPlaced)

export default router;









