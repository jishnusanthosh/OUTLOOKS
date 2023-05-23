import mongoose from "mongoose";
import twilioFunctions from "../config/twilio";
import User from "../models/userModels";
import Product from "../models/productModels";
import Cart from "../models/cartModels";
import Address from "../models/addressModels";
import Order from "../models/orderModels";
import Razorpay from "razorpay";

import bcrypt from "bcrypt";

import dotenv from "dotenv";
import Category from "../models/categoryModels";
import { ObjectId } from "mongodb";
import { response } from "express";
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
    try {
      const product = await Product.findById(productId);

      if (!product) {
        throw new Error("Product not found");
      }

      const quantity = product.productQuantity;

      if (quantity <= 0) {
        return false;
      }

      let cart = await Cart.findOne({ user: userId });

      if (!cart) {
        // If cart doesn't exist for the user, create a new one
        cart = new Cart({ user: userId, products: [] });
      }

      // Check if the product is already present in the cart
      const index = cart.products.findIndex((p) => p.productId == productId);

      if (index === -1) {
        // If the product is not present in the cart, add a new entry
        cart.products.push({ productId, quantity: 1 });
      } else {
        // If the product is already present, increase its quantity
        cart.products[index].quantity += 1;
      }

      await cart.save();
      return true;
    } catch (error) {
      console.error(error);
      return false;
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
      const userProduct = await Product.findById(productId).select(
        "productPrice"
      );
      if (!userProduct) {
        return { status: false, message: "product not found" };
      }

      const cart = await Cart.findOne({ user: userId });

      if (cart) {
        const itemIndex = cart.products.findIndex((item) =>
          item.productId.equals(productId)
        );

        console.log(itemIndex);

        if (itemIndex > -1) {
          cart.products.splice(itemIndex, 1);
          await cart.save();
          return { status: true, message: "product removed from cart" };
        } else {
          return { status: false, message: "product not found in cart" };
        }
      } else {
        return { status: false, message: "cart not found" };
      }
    } catch (error) {
      console.error(error);
    }
  },
  getCartCount: async (userId) => {
    try {
      const cart = await Cart.findOne({ user: userId });
      if (!cart) {
        return { status: false, message: "cart not found" };
      }
      return cart.products.length;
    } catch (error) {
      console.error(error);
      return { status: false, message: "cart not found" };
    }
  },
  updateProductQuantity: async (productId, count, userId) => {
    console.log(count);

    try {
      const cart = await Cart.findOne({ user: userId });

      const productFromCart = cart.products.find(
        (p) => p.productId.toString() === productId
      );

      if (!productFromCart) {
        console.log("product not found");
      } else {
        const product = await Product.findOne({ _id: productId });
        console.log(productFromCart);
        if (product.productQuantity >= count) {
          console.log(product.productQuantity);
          productFromCart.quantity = count;
          await cart.save();
          return { status: true, message: "product quantity updated" };
        } else {
          return { status: false, message: "product out of stock" };
        }
      }
    } catch (error) {
      console.error(error);
    }
  },

  getCartTotal: async (user) => {
    try {
      const cart = await Cart.findOne({ user: user._id }).populate(
        "products.productId"
      );
      console.log(cart);
      if (!cart) {
        return { status: false, message: "cart not found" };
      }
      let total = 0;
      cart.products.forEach((item) => {
        total += item.productId.productPrice * item.quantity;
      });
      console.log(total);
      return total;
    } catch (error) {
      console.error(error);
      return { status: false, message: "cart not found" };
    }
  },
  addAddress: async (userId, address) => {
    try {
      const result = await Address.create({
        firstname: address.firstname,
        lastname: address.lastname,
        streetname: address.streetname,
        apartmentnumber: address.apartmentnumber,
        city: address.city,
        state: address.state,
        zipcode: address.zipcode,
        phone: address.phone,
        email: address.email,
        user: userId,
        
      });
      if (result) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.log(error);
    }
  },
  placeOrder: async (order, totalAmount, cartItems, userId) => {
    console.log(order);
    const orderDate = () => {
      return new Date();
    };
  
    try {
      let status = order.payment_method === "COD" ? "placed" : "pending";
      let date = orderDate();
      let addressId = order.address_id;
      let orderedItems = cartItems.products;
      console.log(orderedItems + "orderedItems");
  
      // Create a new order document
      let ordered = new Order({
        user: userId,
        address: addressId,
        orderDate: date,
        totalAmount: totalAmount,
        paymentMethod: order.payment_method,
        orderStatus: status,
        orderedItems: orderedItems,
      });
  
      // Save the order to the database
      await ordered.save();
      console.log("uploaded to db");
  
      // Clear the user's cart if the payment method is not COD
      if (order.payment_method !== "COD") {
        // Update product quantities
        for (const item of orderedItems) {
          const productId = item.productId._id;
          const quantity = item.quantity;
  
          // Find the product in the database
          const product = await Product.findById(productId);
  
          // Decrease the product quantity by the ordered quantity
          product.productQuantity -= quantity;
  
          // Save the updated product to the database
          await product.save();
        }
      }
  
      return { ordered, orderId: ordered._id };
    } catch (error) {
      console.error(error);
      throw new Error("Failed to place the order");
    }
  },
  
  updatePaymentStatus:(orderId)=>{
   return new Promise(async(resolve, reject) => {
    const order = await Order.findByIdAndUpdate(
      orderId,
      { orderStatus },
      { new: true }
    );
   })
  }
};
