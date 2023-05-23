import express from 'express';
const router = express.Router();
import { isloggedInUser, isLoggedIn } from '../middlewares/sessionHandling';
import userController from '../controllers/userController';

router.get('/', userController.homePage);

router.get("/login",isLoggedIn, userController.loginPage);

router.get("/logout",  userController.logoutGet);

router.get("/signup",isLoggedIn,userController.signUpPage);

router.get("/otp-login",isLoggedIn, userController.GetOtpLogin);

router.get("/otp-send", userController.GetOtpSend);

router.get("/cart", isloggedInUser, userController.GetCart);

router.get("/shopView/:id", isloggedInUser, userController.getShopView);

router.get("/viewProduct/:id", isloggedInUser, userController.getProductView);

router.get("/userProfile/:id", isloggedInUser, userController.getUserProfile);

router.post("/deleteCartProduct",isloggedInUser,userController.deleteCartProduct);

router.get("/addToCart/:id", isloggedInUser, userController.addToCart);

router.get("/GetcheckOut", isloggedInUser, userController.getCheckOut);

router.post("/signup", userController.signUpPost);

router.post('/generate-otp', userController.generateOtp);

router.post('/verify-otp', userController.verifyOtp);

router.post("/login",isLoggedIn, userController.loginPost);

router.post('/resendOtp',isLoggedIn, userController.resendOtp);

router.post('/update-product-quantity', isloggedInUser, userController.updateProductQuantity);

router.post("/addAddress", isloggedInUser, userController.addAddress);

router.get("/deleteAddress/:id",isloggedInUser,userController.deleteAddress)

router.post("/placeOrder", isloggedInUser, userController.placeOrderPost);

router.get("/orderPlaced/:id", isloggedInUser, userController.getOrderPlaced);

router.post('/verifyPayment', isloggedInUser, userController.verifyPaymentPost);

router.get("/viewOrderDetails/:id", isloggedInUser, userController.viewOrderDetails);

router.get("/cancelOrder/:id", isloggedInUser, userController.cancelOrderPost);

export default router;
