import userHelper from "../helpers/userHelpers";
import twilioFunctions from "../config/twilio";
import dotenv from "dotenv";
import userHelpers from "../helpers/userHelpers";
import User from "../models/userModels";
import Products from "../models/productModels";
import mongoose from "mongoose";
import  Cart  from "../models/cartModels";


dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);

export default {
  homePage: async (req, res, next) => {
    let user = req.session.user;
    const allproducts = await Products.find();
    console.log(req.session.login);

    try {
      if (user) {
        res.render("shop/home.ejs", { user, allproducts });
      } else {
        res.render("shop/home.ejs", { user: false, allproducts });
      }
    } catch (error) {
      console.error(err);
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
  GetMenCategory: async (req, res, next) => {
    let user = req.session.user || null;
    try {
      const products = await Products.aggregate([
        {
          $lookup: {
            from: "categories",
            localField: "category",
            foreignField: "_id",
            as: "category",
          },
        },
      ]);

      let categoryProducts = products.filter(
        (product) => product.category[0].CategoryName === "MEN"
      );
      console.log(categoryProducts);
      res.render("shop/men.ejs", { products: categoryProducts, user });
    } catch (error) {
      console.error(error);
      // const msg="An error occurred"

      // res.render("error.ejs",{ msg});
    }
  },
  GetWomenCategory: async (req, res, next) => {
    let user = req.session.user || null;

    try {
      const products = await Products.aggregate([
        {
          $lookup: {
            from: "categories",
            localField: "category",
            foreignField: "_id",
            as: "category",
          },
        },
      ]);

      let categoryProducts = products.filter(
        (product) => product.category[0].CategoryName === "WOMEN"
      );
      console.log(categoryProducts);
      res.render("shop/women.ejs", { products: categoryProducts, user });
    } catch (error) {
      console.error(error);
      // const msg="An error occurred"

      // res.render("error.ejs",{ msg});
    }
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
        const msg = "Email already exists";
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
    try {
      const user = req.session.user;
      const cart = await Cart.findOne({ user: user._id }).populate(
        "products.productId"
      );
  
      if (!cart) {
        res.render("shop/emptyCart", { user });
        return;
      }
    
      const products = cart.products;
  
      res.render("shop/cart", { user, products });
    } catch (error) {
      console.error(error);
      res.render("catchError", { message: error.message, user: req.session.user });
    }
  },

  addToCart: async (req, res) => {
    let user = req.session.user._id
    let productId=req.params.id
    console.log(productId);
    console.log(user);
    try {
      const response =await userHelpers.addToCart(user,productId);
      if (response) {
        console.log("product added");
        res.redirect("/cart")
      } else {
        res.redirect("/cart")
        console.log("product not added");
      }
    } catch (error) {
      
    } 
  }

};
