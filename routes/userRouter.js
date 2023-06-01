import express from 'express';
const router = express.Router();
import { isloggedInUser, isLoggedIn } from '../middlewares/sessionHandling';
import userController from '../controllers/userController';
import {isUserActive} from "../middlewares/customMiddleware"


router.get('/',userController.homePage);

router.get("/login",isLoggedIn,userController.loginPage);

router.get("/forgotPassword",isLoggedIn,userController.getForgotPassword)

router.get("/logout", userController.logoutGet);

router.get("/signup",isLoggedIn,userController.signUpPage);

router.get("/otp-login",isLoggedIn, userController.GetOtpLogin);

router.get("/otp-send", userController.GetOtpSend);

router.get("/cart", isloggedInUser,isUserActive,userController.GetCart);

router.get("/shopView/:id",userController.getShopView);

router.get("/viewProduct/:id", userController.getProductView);

router.get("/userProfile/:id", isloggedInUser,isUserActive, userController.getUserProfile);

router.post("/deleteCartProduct",isloggedInUser,isUserActive,userController.deleteCartProduct);

router.get("/addToCart/:id",userController.addToCart);

router.get("/GetcheckOut", isloggedInUser,isUserActive, userController.getCheckOut);

router.post("/signup", userController.signUpPost);

router.post('/generate-otp', userController.generateOtp);

 router.post('/verify-otp', userController.verifyOtp);

router.post("/login",isLoggedIn, userController.loginPost);

router.post('/resendOtp',isLoggedIn, userController.resendOtp);


router.post("/generate-otp-password",isLoggedIn,userController.generateOtpForPassword)

router.post("/verify-otp-password",isLoggedIn,userController.verifyOtpForPassword)

router.post("/resetPassword",isLoggedIn,userController.resetPassword)


router.get("/productFiltering", isLoggedIn, userController.productFiltering);


router.post('/update-product-quantity', isloggedInUser,isUserActive, userController.updateProductQuantity);

router.post("/addAddress", isloggedInUser,isUserActive, userController.addAddress);

router.post("/deleteAddress", isloggedInUser,isUserActive, userController.deleteAddress);


router.post("/placeOrder", isloggedInUser,isUserActive, userController.placeOrderPost);

router.get("/orderPlaced/:id", isloggedInUser,isUserActive, userController.getOrderPlaced);

router.post('/verifyPayment', isloggedInUser,isUserActive, userController.verifyPaymentPost);

router.get("/viewOrderDetails/:id", isloggedInUser,isUserActive, userController.viewOrderDetails);

router.get("/cancelOrder/:id", isloggedInUser,isUserActive, userController.cancelOrderPost);

router.post('/applyCoupon', isloggedInUser,isUserActive, userController.applyCoupon);

router.get("/product-search", userController.search);

router.post("/returnOrder/:id",isloggedInUser,isUserActive,userController.returnOrder)

export default router;
