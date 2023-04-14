import userHelper from "../helpers/userHelpers";
import twilioFunctions from "../config/twillio";
import dotenv from "dotenv";

dotenv.config();


export default {
  homePage: async (req, res) => {
    // console.log(req);
 
      
    let user=req.session?.user;

    console.log(user);

    try {
      if (req.session?.login) {
        res.render("shop/home.ejs",{user:user.user})
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
  //signup
  signUpPage: (req, res) => {
    res.render("shop/userlogin/signup.ejs");
  },
  signUpPost: (req, res) => {
    userHelper.doSignUp(req.body).then((userData) => {
      let user = userData.user;
      
      if (userData.status) {
        const msg='account already exist'
        
          res.render('shop/userlogin/login.ejs',{msg})
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

  const {phonenumber} =req.body
  
  
  twilioFunctions.generateOTP(phonenumber,"sms")

  res.send('OTP sent');
  },

  verifyOtp: async (req, res) => {
    
    try {
      const{ phonenumber}=req.body
console.log(phonenumber);
      const otpArray = Object.values(req.body).slice(1); 
      const otp = otpArray.join('').slice(0, 6);
      console.log(otp);
      twilioFunctions.client.verify.v2
        .services(twilioFunctions.verifySid)
        .verificationChecks.create({ to: `+91${phonenumber}`, code: otp })
        .then((verification_check) => {
          if (verification_check.status === "approved") {
              //res.redirect("/");
              res.send('OTP verified');
            
          } else {
            res.render("signup", {
              loginErr: true,
              user: false,
              phonenumber: phonenumber,
            });
          }
        })
        .catch((error) => {
          console.error(error);
          res.render("catchError", {
            message: error.message,
            user: req.session.user,
          });
        });
    } catch (err) {
      console.error(err);
      res.render("catchError", {
        message: err.message,
        user: req.session.user,
      });
    }
  },

  logoutGet: (req,res)=>{
    req.session.login=false
    res.redirect("/");
  }
}