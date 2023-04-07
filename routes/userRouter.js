var express = require('express');
var router = express.Router();
var userController=require('../controllers/userController')


// router.get('/user',userController.getOtpLogin)

/* GET users listing. */

router.get('/',userController.home)

router.get('/login',userController.login)


router.get('/otp-login',userController.getOtpLogin)

module.exports = router;
