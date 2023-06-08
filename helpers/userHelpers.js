import twilioFunctions from "../config/twilio";
import twilioFunctionsForpassword from "../config/twilioFunctionsForpassword";
import User from "../models/userModels";
import Product from "../models/productModels";
import Cart from "../models/cartModels";
import Address from "../models/addressModels";
import Order from "../models/orderModels";
import Coupon from "../models/couponModel";

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
          resolve({ emailStatus: true, phoneNumberStatus: false, user: null });
        } else if (oldPhoneNumberUser) {
          resolve({ emailStatus: false, phoneNumberStatus: true, user: null });
        } else {
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
        throw new Error("User not found");
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

  generateOtpForPassword: async (phonenumber) => {
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    try {
      let customer = await User.findOne({ phonenumber });
      if (customer) {
        try {
          await twilioFunctionsForpassword.generateOtpForPassword(
            customer.phonenumber
          );
          return { status: true, body: phonenumber };
        } catch (error) {
          // Check if the error is due to rate limiting (error code 20429)
          if (error.code === 20429) {
            console.log("Too many requests. Retrying after a delay...");
            await delay(3000); // Add a delay of 3 seconds (adjust as needed)
            return generateOtpForPassword(phonenumber); // Retry the request
          } else {
            console.error(error);
            throw new Error("Failed to generate OTP for password");
          }
        }
      } else {
        console.log("No User Found!");
        return { status: false };
      }
    } catch (error) {
      console.error(error);
      throw new Error("Failed to generate OTP for password");
    }
  },

  generateOtpForSignup: async (phonenumber) => {
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    try {
      let customer = await User.findOne({ phonenumber });
      if (customer) {
        // Show toastr message indicating phone number is already used with another account
        return {
          status: false,
          message: "Phone number is already used with another account",
        };
      } else {
        try {
          await twilioFunctionsForpassword.generateOtpForPassword(phonenumber);
          return { status: true, body: phonenumber };
        } catch (error) {
          // Check if the error is due to rate limiting (error code 20429)
          if (error.code === 20429) {
            console.log("Too many requests. Retrying after a delay...");
            await delay(3000); // Add a delay of 3 seconds (adjust as needed)
            return generateOtpForPassword(phonenumber); // Retry the request
          } else {
            console.error(error);
            throw new Error("Failed to generate OTP for password");
          }
        }
      }
    } catch (error) {
      console.error(error);
      throw new Error("Failed to generate OTP for password");
    }
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
        cart = new Cart({ user: userId, products: [] });
      }

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
  placeOrder: async (
    order,
    totalAmount,
    cartItems,
    userId,
    CouponAmount,
    RealAmount
  ) => {
    console.log(order);
    const orderDate = () => {
      return new Date();
    };
  
    try {
      let paymentMethod = order.payment_method;
      let status;
      let paymentStatus;
  
      if (paymentMethod === "COD" || paymentMethod === "wallet") {
        status = "placed";
        if (paymentMethod === "COD") {
          paymentStatus = "pending";
        } else {
          paymentStatus = "paid";
          const user = await User.findById(userId);
          if (user.wallet >= totalAmount) {
            user.wallet -= totalAmount;
            await user.save();
          } else {
            throw new Error("Not enough money in your wallet");
          }
        }
      } else if (paymentMethod === "RazorPay") {
        status = "placed";
        paymentStatus = "paid";
      } else {
        status = "pending";
        paymentStatus = "pending";
      }
      
      let currentDate = new Date();
      let date = {
        month: currentDate.getMonth() + 1, // Adding 1 since getMonth() returns values from 0 to 11
        year: currentDate.getFullYear(),
      };
      
      let addressId = order.address_id;
      let orderedItems = cartItems.products;
      let orderDate = new Date(date.year, date.month - 1);
      console.log(orderedItems + "orderedItems");
  
      // Create a new order document
      let ordered = new Order({
        user: userId,
        address: addressId,
        orderDate: orderDate,
        totalAmount: totalAmount,
        paymentMethod: paymentMethod,
        orderStatus: status,
        paymentStatus: paymentStatus,
        orderedItems: orderedItems,
        couponAmount: CouponAmount,
        realAmount: RealAmount,
      });
  
      // Save the order to the database
      await ordered.save();
      console.log("uploaded to db");
  
      // Update product quantities and delete the cart
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
  
      // Delete the user's cart
      await Cart.findOneAndDelete({ user: userId });
  
      return { ordered, orderId: ordered._id };
    } catch (error) {
      console.error(error);
      throw new Error("Failed to place the order: " + error.message);
    }
  },
  
  updatePaymentStatus: (orderId) => {
    return new Promise(async (resolve, reject) => {
      const order = await Order.findByIdAndUpdate(
        orderId,
        { orderStatus },
        { new: true }
      );
    });
  },
  applyCoupon: async (user, couponCode, subtotal) => {
    try {
      const coupon = await Coupon.findOne({ code: couponCode });

      if (!coupon) {
        return { success: false, message: "Coupon not found" };
      }
      if (coupon.expirationDate < Date.now()) {
        return { success: false, message: "Coupon has expired" };
      }
      if (coupon.usedBy.includes(user._id)) {
        var discountAmount = {};
        discountAmount.status = false;
        return {
          success: false,
          message: "Coupon has already Used",
          discountAmount,
        };
      }
      let discount = (subtotal / coupon.discount) * 100;
      let maxdiscount = coupon.maxdiscount;
      if (maxdiscount < discount) {
        var discountAmount = {};
        let disPrice = subtotal - maxdiscount;
        discountAmount.couponCode = coupon.code;
        discountAmount.disAmount = maxdiscount;
        discountAmount.disPrice = disPrice;
        discountAmount.status = true;
        coupon.usedBy.push(user._id);
        await coupon.save();
        return {
          success: true,
          message: "Coupon applied successfully",
          discountAmount,
        };
      } else {
        var discountAmount = {};
        let disPrice = subtotal - discount;
        discountAmount.couponCode = coupon.code;
        discountAmount.disAmount = maxdiscount;
        discountAmount.disPrice = disPrice;
        discountAmount.status = true;

        coupon.usedBy.push(user._id);
        await coupon.save();
        return {
          success: true,
          message: "Coupon applied successfully",
          discountAmount,
        };
      }
    } catch (error) {
      console.error("Error applying coupon:", error);
      return {
        success: false,
        message: "An error occurred while applying the coupon",
      };
    }
  },
  searchQuery: async (query) => {
    try {
      const products = await Product.find({
        $or: [
          { productName: { $regex: query, $options: "i" } },
          { productModel: { $regex: query, $options: "i" } },
          { productDescription: { $regex: query, $options: "i" } },
        ],
      }).populate("category");
      if (products.length > 0) {
        return products;
      }
      return [];
    } catch (err) {
      console.error(err);
    }
  },
};
