import userHelper from "../helpers/userHelpers";
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
  logoutGet: (req,res)=>{
    req.session.login=false
    res.redirect("/");
  }
}














