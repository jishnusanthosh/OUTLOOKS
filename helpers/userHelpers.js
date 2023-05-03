import mongoose from "mongoose";
import twilioFunctions from "../config/twilio";
import User from "../models/userModels";
import Product from "../models/productModels";
import Cart from "../models/cartModels";

import bcrypt from "bcrypt";

import dotenv from "dotenv";
import Category from "../models/categoryModels";
dotenv.config();

export default {
  doSignUp: (body) => {
    return new Promise(async (resolve, reject) => {
      try {
        var oldUser = await User.findOne({ email: body.email });
        var oldPhoneNumberUser = await User.findOne({
          phonenumber: body.phonenumber,
        });

        if (oldUser) {
          // If an existing user with the same email is found, return an object with emailStatus=true
          resolve({ emailStatus: true, phoneNumberStatus: false, user: null });
        } else if (oldPhoneNumberUser) {
          // If an existing user with the same phone number is found, return an object with phoneNumberStatus=true
          resolve({ emailStatus: false, phoneNumberStatus: true, user: null });
        } else {
          // Otherwise, create a new user, save it to the database, and return an object with emailStatus=false, phoneNumberStatus=false, and the saved user object
          const saltRounds = 10;
          let password = body.password.toString();
          let newpassword = await bcrypt.hash(password, saltRounds);
          const newUser = new User({
            username: body.username,
            email: body.email,
            password: newpassword,
            phonenumber: body.phonenumber,
          });
          var savedUser = await newUser.save();
          resolve({
            emailStatus: false,
            phoneNumberStatus: false,
            user: savedUser,
          });
        }
      } catch (err) {
        console.error(err);
        reject(err);
      }
    });
  },

  doLogin: async (user) => {
    try {
      const validUser = await User.findOne({ email: user.email });
      if (validUser) {
        const isPasswordMatch = await bcrypt.compare(
          user.password,
          validUser.password
        );
        if (isPasswordMatch) {
          return { status: true, user: validUser };
        } else {
          console.log("Invalid Password");
          return { status: false };
        }
      } else {
        console.log("User not found");
        return { status: false };
      }
    } catch (err) {
      console.error(err);
      throw err;
    }
  },
  generateOtp: (body) => {
    console.log(body);
    return new Promise(async (resolve, reject) => {
      try {
        let customer = await User.findOne({ phonenumber: body });
        console.log(customer);
        if (customer) {
          twilioFunctions.generateOTP(customer.phonenumber);
          // const msg1 = "OTP SENT!!";
          resolve({ status: true, body });
        } else {
          console.log("No User Found!");
          resolve({ status: false });
        }
      } catch (err) {
        console.error(err);
        reject(err);
      }
    });
  },
  addToCart: async (userId, productId) => {
    // Find product

    try {
      const product = await Product.findById(productId);

      if (!product) {
        throw new Error("Product not found");
      }

      const quantity = product.productQuantity;

      if (quantity <= 0) {
        return false;
      }

      await Cart.updateOne(
        { user: userId },
        { $push: { products: { productId, quantity: 1 } } },
        { upsert: true }
      );

      return true;
    } catch (error) {
      console.error(error);
    }
  },
  getCartProducts: async (userId) => {
    try {
      const cart = await Cart.findOne({ user: userId });
      if (!cart) {
        return false;
      }

      return cart.products;
    } catch (error) {
      console.error(error);
    }
  },
  getProductView: async (productId) => {
    try {
      const product = await Product.findById(productId);
      const category = await Category.findById(product.category);
      product.category = category;
      if (!product) {
        throw new Error("Product not found");
      } else {
        return product;
      }
    } catch (error) {
      console.error(error);
    }
  },
  getUserDetails: async (userId) => {
    try {
      const user = await User.findById(userId);

      if (!user) {
        throw new Error("User not found");
      } else {
        return user;
      }
    } catch (error) {
      console.error(error);
    }
  },

  deleteProductFromCart: async (userId, productId) => {
    try {
      const userProduct = await Product.findById(productId).select("productPrice");
      if (!userProduct) {
        return { status: false, message: "product not found" };
      }

      const cart = await Cart.findOne({ user: userId });
      console.log(cart);
      if (cart) {
        const itemIndex = cart.products.findIndex((item) =>
          item.productId.equals(productId)
        );

        console.log(itemIndex);

        if (itemIndex > -1) {
          
          cart.products.splice(itemIndex, 1);
          await cart.save();
          return { status: true, message: 'product removed from cart' };
        } else {
          return { status: false, message: 'product not found in cart' };
        }
  
      }  else {
        return { status: false, message: 'cart not found' };
      }
  
    } catch (error) {
      console.error(error);
    }
  },
};
