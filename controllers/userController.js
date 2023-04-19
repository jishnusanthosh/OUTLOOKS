import userHelper from "../helpers/userHelpers";
import twilioFunctions from "../config/twilio";
import dotenv from "dotenv";
import userHelpers from "../helpers/userHelpers";
import User from "../models/userModels";

dotenv.config();


export default {
  homePage: async (req, res) => {
    // console.log(req);
 
  
    let user=req.session?.user;

    console.log(user);

    try {
      if (req.session?.login) {
        res.render("shop/home.ejs",{user})
      }else{
        res.render("shop/home.ejs",{user:false})
      }
    } catch (err) {
      console.error(err);
    }
  },

  loginPage:(req, res) => {
    res.render("shop/userlogin/login.ejs");
  },
  GetOtpLogin:(req, res) => {
    res.render("shop/userlogin/otp-login.ejs");
  },
  GetOtpSend:(req, res) => {
    res.render("shop/userlogin/otp-send.ejs");
  },
  //signup
  signUpPage: (req, res) => {
    res.render("shop/userlogin/signup.ejs");
  },
  signUpPost: (req, res) => {
    userHelper.doSignUp(req.body).then((userData) => {
      let user = userData.user;
      console.log(user);
      
      if (userData.status) {
        const msg='Email  already exist'
        
          res.render('shop/userlogin/signup',{msg})
      } else {
        const msg='account created succesfully'
        res.render("shop/userlogin/login.ejs",{msg});
          
      }
        // res.redirect("/");rs

    });
},
  loginPost: (req, res) => {

    userHelper.doLogin(req.body).then((user) => {
      console.log(req.body);
      let response = user;
      if (response.status) {
        req.session.login=true
        req.session.user=user;
        res.redirect("/");
      } else {
        res.render("shop/userlogin/login.ejs");
      }
    });
  },


generateOtp: (req,res)=>{

userHelpers.generateOtp(req.body.phonenumber).then((user)=>{
  let response = user;
  if (response.status) {
    const msg1="OTP SENT!!"
    res.render("shop/userlogin/verify-otp",{msg1,phonenumber:req.body.phonenumber})
  }
  else
  {
    res.render("shop/userlogin/signup",)
  }
})
  


  },

  verifyOtp: async (req, res) => {
    
    try {
      const phonenumber=req.body.phone
      console.log(phonenumber);
      const otp = req.body.otpValues
      console.log(otp);
      twilioFunctions.client.verify.v2
        .services(twilioFunctions.verifySid)
        .verificationChecks.create({ to: `+91${phonenumber}`, code: otp })
        .then(async (verification_check) => {
          if (verification_check.status === "approved") {
            var user =  await User.findOne({ phonenumber: phonenumber });
              req.session.login=true;
              req.session.user=user;
              res.redirect("/")
            
          } else {
            const msg2="OTP not VERIFIED !!"
            res.render("shop/userlogin/verify-otp", {
              msg2:msg2,
          
            });
          }
        })
        .catch((error) => {
          console.error(error);
          res.render("catchError", {
            message: error.message,
          
          });
        });
    } catch (err) {
      console.error(err);
      res.render("catchError", {
        message: err.message,
       
      });
    }
  },

  logoutGet: (req,res)=>{
    req.session.login=false
    res.redirect("/");
  }
}