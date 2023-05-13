import userHelper from "../helpers/userHelpers";
import twilioFunctions from "../config/twilio";
import dotenv from "dotenv";
import userHelpers from "../helpers/userHelpers";
import User from "../models/userModels";
import Products from "../models/productModels";
import mongoose from "mongoose";
import Cart from "../models/cartModels";
import Category from "../models/categoryModels"

dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);

export default {
  homePage: async (req, res, next) => {
    let user = req.session.user;
    const allproducts = await Products.find();
    const allcategory=await Category.find();
   
 

    try {
      if (user) {
        let cartCount= await userHelpers.getCartCount(req.session.user._id)
        
        console.log(cartCount);
        res.render("shop/home.ejs", { user, allproducts ,cartCount,allcategory});
      } else {
        let cartCount=null
        res.render("shop/home.ejs", { user: false, allproducts,cartCount,allcategory});
      }
    } catch (error) {
      console.error(error);
    }
  },

  loginPage: (req, res) => {
    res.render("shop/userlogin/login");
  },
  GetOtpLogin: (req, res) => {
    res.render("shop/userlogin/otp-login.ejs");
  },
  GetOtpSend: (req, res) => {
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

      if (userData.emailStatus) {
        const msg = "Email already exists";
        res.render("shop/userlogin/signup", { msg });
      } else if (userData.emailStatus == false) {
        const msg = "phonenumber already exists";
        res.render("shop/userlogin/signup", { msg });
      } else {
        if (userData.user) {
          req.session.login = true;
          req.session.user = userData.user;
          res.redirect("/");
        }
      }
    });
  },
  loginPost: async (req, res) => {
    try {
      const response = await userHelper.doLogin(req.body);
      if (response.status && response.user.isActive) {
        req.session.login = true;
        req.session.user = response.user;
        res.redirect("/");
      } else {
        if (response.status == false) {
          const blockmsg = "Incorrect Password or Email...!!";
          res.render("shop/userlogin/login.ejs", { blockmsg });
        } else {
          const blockmsg = "Account is blocked...Unable to login";
          res.render("shop/userlogin/login.ejs", { blockmsg });
        }
      }
    } catch (err) {
      console.error(err);
      res.status(500).send("Internal Server Error");
    }
  },
  

  generateOtp: (req, res) => {
    userHelpers.generateOtp(req.body.phonenumber).then((user) => {
      let response = user;
      if (response.status) {
        const msg1 = "OTP SENT!!";
        res.render("shop/userlogin/verify-otp", {
          msg1,
          phonenumber: req.body.phonenumber,
        });
      } else {
        res.render("shop/userlogin/signup");
      }
    });
  },

  verifyOtp: async (req, res) => {
    try {
      const phonenumber = req.body.phone;
      console.log(phonenumber);
      const otp = req.body.otpValues;
      console.log(otp);
      client.verify.v2
        .services("VAd7d72ed7e0d900851e1b08c0bffc1f65")
        .verificationChecks.create({ to: `+91${phonenumber}`, code: otp })
        .then(async (verificationChecks) => {
          if (verificationChecks.status === "approved") {
            let user = await User.findOne({ phonenumber: phonenumber });

            if (user.isActive == false) {
              let blockmsg = "Account is blocked...Unable to login";
              res.render("shop/userlogin/login.ejs", { blockmsg });
            } else {
              req.session.login = true;
              req.session.user = user;
              res.redirect("/");
            }
          } else {
            const msg2 = "INCORRECT OTP!!";
            res.render("shop/userlogin/verify-otp", {
              msg2: msg2,
              phonenumber,
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

  resendOtp: (req, res) => {
    let phone = req.query.phone;
    console.log(phone);
    twilioFunctions.generateOTP(phone);
  },

  logoutGet: (req, res) => {
    req.session.user = false;
    res.redirect("/");
  },

  GetCart: async (req, res) => {
    
    let allcategory = await Category.find()

    try {
      const user = req.session.user;
    
      let cartCount= await userHelpers.getCartCount(req.session.user._id)
      let total= await userHelpers.getCartTotal(req.session.user)
   
  
     
      const cart = await Cart.findOne({ user: user._id }).populate(
        "products.productId"
      );

      if (!cart) {
        res.render("shop/emptyCart", { user });
        return;
      }

      const products = cart.products;

      res.render("shop/cart", { user, products,cartCount,total,allcategory});
    } catch (error) {
      console.error(error);
      res.render("catchError", {
        message: error.message,
        user: req.session.user,
      });
    }
  },

  
  addToCart: async (req, res) => {
    let user = req.session.user._id;
    let productId = req.params.id;
    console.log(productId);
    console.log("api call");

    try {
      const response = await userHelpers.addToCart(user, productId);
      if (response) {
        console.log("product added to cart");
        res.json({status:true})
      } else {
      res.redirect("/cart");
        console.log("product not added");
      }
    } catch (error) {}
  },

  getProductView: async (req, res) => {
    let productId = req.params.id;
    let user = req.session.user || null;
    try {
      
      let cartCount= await userHelpers.getCartCount(req.session.user._id)
     
      const response = await userHelpers.getProductView(productId);
      if (response) {
        res.render("shop/product-details", { product: response, user,cartCount });
      } else {
        res.redirect("/shop");
      }
    } catch (error) {
      res.redirect("/shop");
      console.log(error);
    }
  },

  getUserProfile: async (req, res) => {
    let userid = req.params.id;
   
    let cartCount= await userHelpers.getCartCount(req.session.user._id)
    let allcategory = await Category.find()
    try {
      const response = await userHelpers.getUserDetails(userid);
      if (response) {
        res.render("shop/userProfile", { user: response ,cartCount,allcategory});
      } else {
        res.redirect("/shop/login");
      }
    } catch (error) {
      console.error(error);
    }
  },
  deleteCartProduct: async (req, res) => {
    let { productId }= req.body;
    let userId = req.session.user._id;
    try{
      const response = await userHelpers.deleteProductFromCart(userId, productId);
      if(response.status){
        res.json({success:true,message:response.message})
      }else{
        res.json({success:false,message:response.message})
      }
    
    }catch(error){
      console.log(error);
    }

  },
  updateProductQuantity: async (req, res) => {
    let productId = req.body.productId;
    let quantity = req.body.quantity;
    let userId = req.session.user._id;
    console.log(productId,quantity);
    try {
        let response = await userHelpers.updateProductQuantity(productId, quantity,userId)
        if(response.status){
            res.json({success:true,message:response.message})
        } else {
            res.json({success:false,message:response.message})
        }
    } catch (error) {
        console.log(error);
    }
},

getCheckOut : async (req,res)=>{
  let user = req.session.user;

  try{
    let cartCount= await userHelpers.getCartCount(req.session.user._id)
    const subtotal= await userHelpers.getCartTotal(req.session.user)
    let allcategory = await Category.find()
  
      const cart = await Cart.findOne({ user: req.session.user._id }).populate(
        "products.productId"
      );

      if (!cart) {
        res.render("shop/emptyCart", { user: req.session.user ,allcategory });
        return;
      }

      const products = cart.products;

    if(cart){
      res.render("shop/checkOut", { items: cart ,subtotal,products,user,cartCount ,allcategory});
      }else{
        res.redirect("/shop/login");
        }
      }
      catch(error){
        console.log(error);
        }
  },

  getShopView: async (req, res, next) => {
    let user = req.session.user || null;
    let catId = req.params.id;
    let userId = null;
    let cartCount = null;
    let allcategory = await Category.find();
  
    if (req.session.user) {
      userId = req.session.user._id;
      cartCount = await userHelpers.getCartCount(userId);
    }
  
    console.log(catId);
  
    try {
      const products = await Products.find({ category: catId }).populate(
        "category"
      );
      console.log(products);
      res.render("shop/shop.ejs", { products, user, allcategory, cartCount });
    } catch (error) {
      console.error(error);
    }
  },
  

  


};
