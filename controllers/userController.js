import userHelper from "../helpers/userHelpers";
import twilioFunctions from "../config/twilio";
import dotenv from "dotenv";
import userHelpers from "../helpers/userHelpers";

import User from "../models/userModels";
import Address from "../models/addressModels";
import Products from "../models/productModels";
import mongoose from "mongoose";
import Cart from "../models/cartModels";
import Category from "../models/categoryModels";
import Orders from "../models/orderModels";
import Coupon from "../models/couponModel";
const { generateRazorpay } = require("../config/razorpay");

const ObjectId = mongoose.Types.ObjectId;

dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);

export default {
  homePage: async (req, res, next) => {
    let user = req.session.user;

    try {
      const allproducts = await Products.find();
      const allcategory = await Category.find();
      const products = await Products.find();
      const Coupons= await Coupon.find()

      if (req.session.user) {
        let cartCount = await userHelpers.getCartCount(req.session.user._id);

        console.log(cartCount);
        res.render("shop/home.ejs", {
          user,
          allproducts,
          cartCount,
          allcategory,
          products,
          Coupons
        });
      } else {
        let cartCount = null;
        res.render("shop/home.ejs", {
          user: false,
          allproducts,
          cartCount,
          allcategory,
          products,
          Coupons
        });
      }
    } catch (error) {
      console.error(error);
      res.render("catchError", {
        message: err.message,
        user: req.session.user,
      });
    }
  },

  loginPage: async (req, res) => {
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
  getForgotPassword: (req, res) => {
    res.render("shop/userlogin/forgotPassword.ejs");
  },
  generateOtp: (req, res) => {
    console.log(req.body);
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

  generateOtpForPassword: async (req, res) => {
    userHelpers
      .generateOtpForPassword(req.body.phonenumber)
      .then((response) => {
        res.json(response);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).json({ status: false });
        console.error(err);
        res.render("catchError", {
          message: err.message,
        });
      });
  },

  verifyOtpForPassword: async (req, res) => {
    console.log(req.body);
    try {
      const phonenumber = req.body.phonenumber;
      const otp = req.body.otp;
      console.log(phonenumber);
      console.log(otp);

      client.verify.v2
        .services("VA90f6a161ac014c889176b5d2e630bcde")
        .verificationChecks.create({ to: `+91${phonenumber}`, code: otp })
        .then(async (verificationChecks) => {
          if (verificationChecks.status === "approved") {
            res.json({ status: "success" }); // Send success response as JSON object
          } else {
            res.json({ status: "error" }); // Send error response as JSON object
          }
        });
    } catch (err) {
      console.error(err);
      res.render("catchError", {
        message: err.message,
      });
    }
  },
  resetPassword: async (req, res) => {
    const phonenumber = req.body.phonenumber;
    const newpassword = req.body.password;
    console.log(phonenumber, newpassword + "inside reset password");

    try {
      let user = await User.findOneAndUpdate(
        { phonenumber: phonenumber },
        { password: newpassword }
      );

      if (user) {
        console.log(user + "inside reset password");
        return res.redirect("/login");
      } else {
        res.json({ status: "error", message: "User not found" });
      }
    } catch (error) {
      console.log(error);
      res.json({ status: "error", message: "Error resetting password" });
    }
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

  signUpPost: (req, res) => {
    userHelper
      .doSignUp(req.body)
      .then((userData) => {
        if (userData.emailStatus) {
          const msg = "Email already exists";
          res.render("shop/userlogin/signup", { msg });
        } else if (userData.phoneStatus) {
          const msg2 = "Phone number already exists";
          res.render("shop/userlogin/signup", { msg2 });
        } else if (userData.user) {
          req.session.login = true;
          req.session.user = userData.user;
          res.redirect("/");
        }
      })
      .catch((error) => {
        console.log(error);
        res.render("error");
      });
  },

  loginPost: async (req, res) => {
    try {
      const response = await userHelpers.doLogin(req.body);
      if (response.status && response.user.isActive) {
        req.session.user = true;
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
      res.redirect("/signup"); // Redirect to the login page
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

      let cartCount = await userHelpers.getCartCount(req.session.user._id);
      let total = await userHelpers.getCartTotal(req.session.user);
      let allcategory = await Category.find();
      const Coupons= await Coupon.find()

      const cart = await Cart.findOne({ user: user._id }).populate(
        "products.productId"
      );

      if (!cart) {
        res.render("shop/emptyCart", { user, cartCount, allcategory });
        return;
      }

      const products = cart.products;

      res.render("shop/cart", {
        user,
        products,
        cartCount: cartCount ? cartCount : 0,
        total,
        allcategory,
        Coupons
      });
    } catch (error) {
      console.error(error);
      res.render("catchError", {
        message: error.message,
        user: req.session.user,
      });
    }
  },

  // Add the toastr CSS and JavaScript files in your HTML

  // Controller
  addToCart: async (req, res) => {
    if (!req.session.user) {
      // Redirect to the login page
      return res.json({
        status: false,
        message: "User not logged in",
        redirect: "/login",
      });
    }

    try {
      let userId = req.session.user._id;
      let productId = req.params.id;
      const response = await userHelpers.addToCart(userId, productId);
      if (response) {
        console.log("Product added to cart");
        res.json({ status: true, message: "Product added to cart" });
      } else {
        console.log("Product not added");
        res.json({ status: false, message: "Product not added" });
      }
    } catch (error) {
      console.error(error);
      res.json({ status: false, message: "An error occurred" });
    }
  },

  getProductView: async (req, res) => {
    let productId = req.params.id;
    let user = req.session.user || null;
    let userId = req.session.user || null;
    let allcategory = await Category.find();
    const Coupons= await Coupon.find()
    try {
      let cartCount = await userHelpers.getCartCount(userId);

      const response = await userHelpers.getProductView(productId);
      if (response) {
        res.render("shop/product-details", {
          product: response,
          user,
          cartCount,
          allcategory,
          Coupons
        });
      } else {
        res.redirect("/shop");
      }
    } catch (error) {
      res.redirect("/shop");
      console.log(error);
    }
  },

  deleteCartProduct: async (req, res) => {
    let { productId } = req.body;
    let userId = req.session.user._id;
    try {
      const response = await userHelpers.deleteProductFromCart(
        userId,
        productId
      );
      if (response.status) {
        res.json({ success: true, message: response.message });
      } else {
        res.json({ success: false, message: response.message });
      }
    } catch (error) {
      console.log(error);
    }
  },
  updateProductQuantity: async (req, res) => {
    let productId = req.body.productId;
    let quantity = req.body.quantity;
    let userId = req.session.user._id;
    console.log(productId, quantity);
    try {
      let response = await userHelpers.updateProductQuantity(
        productId,
        quantity,
        userId
      );
      if (response.status) {
        res.json({ success: true, message: response.message });
      } else {
        res.status(400).json({ success: false, message: response.message });
      }
    } catch (error) {
      console.log(error);
    }
  },

  getCheckOut: async (req, res) => {
    let user = req.session.user;

    try {
      let userDetails = await User.findById(req.session.user._id);
      let cartCount = await userHelpers.getCartCount(req.session.user._id);
      const subtotal = await userHelpers.getCartTotal(req.session.user);
      let allcategory = await Category.find();
      let Addresses = await Address.find({ user: req.session.user._id });
      const Coupons= await Coupon.find()

      const cart = await Cart.findOne({ user: req.session.user._id }).populate(
        "products.productId"
      );

      if (!cart) {
        res.render("shop/emptyCart", { user: req.session.user, allcategory,Coupons });
        return;
      }

      const products = cart.products;

      if (cart) {
        res.render("shop/checkOut", {
          items: cart,
          subtotal,
          products,
          user,
          cartCount,
          allcategory,
          Addresses,
          userDetails,
          Coupons
        });
      } else {
        res.redirect("/shop/login");
      }
    } catch (error) {
      console.log(error);
    }
  },

  getShopView: async (req, res, next) => {
    let user = req.session.user || null;
    let catId = req.params.id;
    let userId = null;
    let cartCount = null;
    let allcategory = await Category.find();
    const Coupons= await Coupon.find()

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
      res.render("shop/shop.ejs", { products, user, allcategory, cartCount,Coupons });
    } catch (error) {
      console.error(error);
    }
  },
  addAddress: async (req, res) => {
    let userId = req.session.user._id;
    let address = req.body;
    try {
      const result = await userHelpers.addAddress(userId, address);
      if (result) {
        res.redirect("/GetcheckOut");
      } else {
        res.json({ message: "address not added" });
      }
    } catch (error) {
      console.log(error);
    }
  },
  deleteAddress: async (req, res) => {
    const addressId = req.body.addressId;

    try {
      await Address.findByIdAndUpdate(addressId, { addStatus: true });

      res.status(200).json({ message: "Address deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting address" });
    }
  },

  placeOrderPost: async (req, res) => {
    console.log(req.body + "placeOrderPost");
    try {
      let userId = req.session.user._id;
      const cartItems = await Cart.findOne({ user: req.session.user._id });
      const totalAmount = req.body.amount;
      const CouponAmount = parseInt(
        req.body.discountAmount.replace("Rs. ", "")
      );
      const RealAmount = req.body.subtotal;

      if (req.body.payment_method === "COD") {
        // Update product quantities
        const orderItems = cartItems.products;

        const placeOrder = await userHelpers.placeOrder(
          req.body,
          totalAmount,
          cartItems,
          userId,
          CouponAmount,
          RealAmount
        );

        // Clear the user's cart
        await Cart.deleteMany({ user: userId });

        return res.json({ cod_success: true, orderId: placeOrder.orderId });
      } else {
        const placeOrder = await userHelpers.placeOrder(
          req.body,
          totalAmount,
          cartItems,
          userId
        );
        const razorPayOrder = await generateRazorpay(
          placeOrder.orderId.toString(),
          totalAmount,
          userId
        );

        res.json({ ...razorPayOrder, orderId: placeOrder.orderId });
        await Cart.deleteMany({ user: userId });
      }
    } catch (error) {
      console.log(error);
      res.status(500).send("Failed to place the order: " + error.message);
    }
  },

  verifyPaymentPost: async (req, res) => {
    const userId = req.session.user._id;
    try {
      const { order_id, payment_id, razorpay_signature } = req.body;

      const isPaymentVerified = await userHelpers.verifyRazorpayPayment(
        order_id,
        payment_id,
        razorpay_signature,
        process.env.RAZORPAY_KEY_SECRET,
        userId
      );

      if (isPaymentVerified) {
        // Update the order status to "placed" or any other appropriate status
        await userHelpers.updatePaymentStatus(order_id, "placed");

        // Clear the user's cart

        await Cart.deleteMany({ user: userId });

        return res.json({
          success: true,
          message: "Payment verification successful",
        });
      } else {
        return res.json({
          success: false,
          message: "Payment verification failed",
        });
      }
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .send("Failed to verify the Razorpay payment: " + error.message);
    }
  },

  getOrderPlaced: async (req, res) => {
    let orderId = req.params.id;
    const user = req.session.user;
    let allcategory = await Category.find();
    const Coupons= await Coupon.find()

    let cartCount = await userHelpers.getCartCount(req.session.user._id);
    res.render("shop/orderPlaced", { user, cartCount, allcategory, orderId,Coupons });
  },

  getUserProfile: async (req, res) => {
    let userid = req.params.id;
    let userId = req.session.user._id;

    let cartCount = await userHelpers.getCartCount(req.session.user._id);
    let allcategory = await Category.find();

    try {
      const address = await Address.find({ user: userId });

      const orders = await Orders.find({ user: userId });
      const Coupons= await Coupon.find()

      const response = await userHelpers.getUserDetails(userid);

      if (response) {
        res.render("shop/userProfile", {
          user: response,
          cartCount,
          allcategory,
          address,
          orders,
          Coupons
        });
      } else {
        res.redirect("/shop/login");
      }
    } catch (error) {
      console.error(error);
      res.render("catchError", {
        message: err.message,
        user: req.session.user,
      });
    }
  },

  viewOrderDetails: async (req, res) => {
    const orderId = req.params.id;
    console.log(orderId + " order id in view order details");
    const Coupons= await Coupon.find()

    const user = req.session.user;
    const order = await Orders.findOne({
      _id: orderId,
      user: req.session.user._id,
    });
    const address = await Address.findOne({ _id: order.address });

    if (!order) {
      console.log("Order not found");
      return res.redirect("/"); // Redirect to home page or handle the error as needed
    }

    let orderedItems = [];
    for (let item of order.orderedItems) {
      let product = await Products.findOne({ _id: item.productId });

      // Fetch product details
      const productName = product.productName;
      const productColor = product.productColor;
      const productSize = product.productSize;
      const productBrand = product.productBrand;
      const productPrice = product.productPrice;
      const productDescription = product.productDescription;
      const productImage = product.productImage;

      orderedItems.push({
        product: {
          name: productName,
          color: productColor,
          size: productSize,
          brand: productBrand,
          price: productPrice,
          description: productDescription,
          image: productImage,
        },
        quantity: item.quantity,
        price: item.price,
      });
    }

    let allcategory = await Category.find();
    let cartCount = await userHelpers.getCartCount(req.session.user._id);

    res.render("shop/viewOrderDetails", {
      user,
      cartCount,
      allcategory,
      order,
      orderedItems,
      address,
      Coupons
    });
  },

  cancelOrderPost: async (req, res) => {
    console.log(req.params.id);
    try {
      const order = await Orders.findOne({ _id: req.params.id });
      if (!order) {
        console.log("Order not found");
        return res.redirect("/"); // Redirect to home page or handle the error as needed
      }
      if (order.orderStatus === "cancelled") {
        console.log("Order already cancelled");
        return res.redirect("/"); // Redirect to home page or handle the error as needed
      }

      // Get the canceled order's details
      const canceledItems = order.orderedItems;

      // Update the product stock for each canceled item
      for (const item of canceledItems) {
        const product = await Products.findOne({ _id: item.productId });

        // Increment the product stock by the canceled quantity
        product.productQuantity += item.quantity;

        // Save the updated product
        await product.save();
      }

      // Update the order status to "cancelled"
      const cancelOrder = await Orders.updateOne(
        { _id: req.params.id },
        { orderStatus: "cancelled" }
      );

      if (cancelOrder.nModified === 0) {
        console.log("Order not cancelled");
        return res.status(400).json({ error: "Order cancellation failed" });
      }

      // Check if paymentStatus is "paid"
      if (order.paymentStatus === "paid") {
        // Store the order total amount in the user's wallet
        const user = await User.findOne({ _id: order.userId });
        user.wallet += order.totalAmount;
        await user.save();

        // Set the order paymentStatus to "refund"
        order.paymentStatus = "refund";
        await order.save();
      }

      res.redirect(`/viewOrderDetails/${req.params.id}`);
    } catch (error) {
      console.log(error);
      res.render("catchError", {
        message: error.message,
        user: req.session.user,
      });
    }
  },

  applyCoupon: async (req, res) => {
    const subtotal = req.body.subtotal;
    const couponCode = req.body.couponCode;
    const userId = req.session.user._id;
    console.log(subtotal, couponCode, userId);
    try {
      // Find the user by userId
      const user = await User.findById(userId);

      if (!user) {
        return { success: false, message: "User not found" };
      }

      // Apply the coupon using the helper function
      const result = await userHelpers.applyCoupon(user, couponCode, subtotal);
      console.log(result);
      res.json(result);
    } catch (error) {
      console.error("Error applying coupon:", error);
      res.status(500).json({
        success: false,
        message: "An error occurred while applying the coupon",
      });
    }
  },
  search: async (req, res) => {
    let user = req.session.user || null;
    let catId = req.params.id;
    let userId = null;
    let cartCount = null;
    let allcategory = await Category.find();
    const Coupons= await Coupon.find()

    if (req.session.user) {
      userId = req.session.user._id;
      cartCount = await userHelpers.getCartCount(userId);
    }
    try {
      const search = req.query.search;
      const products = await userHelper.searchQuery(search);
      res.render("shop/searchedProducts", {
        products,
        user,
        catId,
        allcategory,
        cartCount,
        Coupons
      });
      console.log(products);
    } catch (err) {
      console.log(err);
    }
  },

  productFiltering: async (req, res) => {
    console.log(req.query);
    try {
      // Retrieve the filter parameters from the request query
      const { colors, sizes, prices } = req.query;

      // Convert colors and sizes to arrays
      const colorArray = Array.isArray(colors) ? colors : JSON.parse(colors);
      const sizeArray = Array.isArray(sizes) ? sizes : JSON.parse(sizes);
      const priceRangeArray = Array.isArray(prices)
        ? prices
        : JSON.parse(prices);

      // Build the filter query
      const filterQuery = {};

      if (priceRangeArray.length > 0) {
        const [minPrice, maxPrice] = priceRangeArray[0].split("-");
        filterQuery.productPrice = {
          $gte: parseInt(minPrice, 10),
          $lte: parseInt(maxPrice, 10),
        };
      }

      if (colorArray.length > 0) {
        filterQuery.productColor = { $in: colorArray };
      }

      if (sizeArray.length > 0) {
        filterQuery.productSize = { $in: sizeArray };
      }

      console.log(filterQuery);

      // Perform the filtering based on the received parameters
      const filteredProducts = await Products.find(filterQuery);

      console.log(filteredProducts);

      // Send the filtered products as a JSON response
      res.json(filteredProducts);
    } catch (error) {
      console.error("Error filtering products:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
  returnOrder: async (req, res) => {
    try {
      const orderId = req.params.id;
      const returnReason = req.body.reason;

      const order = await Orders.findOne({ _id: orderId });
      const returnItems = order.orderedItems;

      for (const item of returnItems) {
        const product = await Products.findOne({ _id: item.productId });
        product.productQuantity += item.quantity;
        await product.save();
      }

      await Orders.findOneAndUpdate(
        { _id: orderId },

        {
          $set: {
            orderStatus: "return",
            returnStatus: "pending",
            returnReason: returnReason,
          },
        }
      );

      res.json({ success: true });
    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false });
    }
  },
};
