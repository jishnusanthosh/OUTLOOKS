import dotenv from "dotenv";
import adminHelper from "../helpers/adminHelpers";
const mongoose = require("mongoose");
import { generateSalesReport } from "../config/pdfKit";
const ObjectId = mongoose.Types.ObjectId;
import Offer from "../models/offerModels";
import User from "../models/userModels";
import Product from "../models/productModels";
import Order from "../models/orderModels";
// import Address from "../models/addressModels";
import Coupon from "../models/couponModel";
import Category from "../models/categoryModels";

dotenv.config();

export default {
  AdminHomePage: async (req, res) => {
    try {
      if (req.session.admin) {
        const allorder = await Order.find();
        const allproducts = await Product.find();
        const allusers = await User.find();
        const productCount = allproducts.length;
        const userCount = allusers.length;
        const orderCount = allorder.length;
        const chartData = await adminHelper.getChartDetails();
        const orderStatus = await adminHelper.getAllOrderStatusesCount();

        let revenue = 0;
        for (const order of allorder) {
          if (order.orderStatus === "delivered") {
            revenue += order.totalAmount;
          }
        }
        res.render("admin/admin-home", {
          chartData,
          productCount,
          userCount,
          revenue,
          orderCount,
          allusers,
          allorder,
          orderStatus,
        });
      } else {
        res.redirect("/admin/login");
      }
    } catch (err) {
      console.log(err);
    }
  },
  AdminUsersPage: async (req, res) => {
    try {
      const users = await User.find();

      if (req.session.admin) {
        res.render("admin/admin-users-list", { users: users });
      } else {
        res.redirect("/admin/login");
      }
    } catch (err) {
      console.log(err);
    }
  },
  AdminAddProduct: async (req, res) => {
    try {
      if (req.session.admin) {
        const viewCategory = await adminHelper.getAllCategory();
        res.render("admin/admin-add-product", { viewCategory });
      } else {
        res.redirect("/admin/login");
      }
    } catch (err) {
      console.log(err);
    }
  },
  AdminListProduct: async (req, res) => {
    const products = await Product.aggregate([
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "category",
        },
      },
    ]);

    try {
      if (req.session.admin) {
        res.render("admin/admin-products-list", { product: products });
      } else {
        res.redirect("/admin/login");
      }
    } catch (err) {
      console.log(err);
    }
  },

  blockProduct: async (req, res) => {
    let proId = req.params.id;

    let product = await Product.findById(proId);

    try {
      if (req.session.admin) {
        await adminHelper.blockProduct(product);
        res.status(200).json("done");
        // res.redirect("/admin/admin-productss-list");
      } else {
        res.redirect("/admin/login");
      }
    } catch (err) {
      console.log(err);
    }
  },
  unblockProduct: async (req, res) => {
    let proId = req.params.id;
    console.log(proId);
    let product = await Product.findById(proId);

    try {
      if (req.session.admin) {
        await adminHelper.unblockProduct(product);
        res.status(200).json("done");
        // res.redirect("/admin/admin-productss-list");
      } else {
        res.redirect("/admin/login");
      }
    } catch (err) {
      console.log(err);
    }
  },

  AdminCategoriesPage: async (req, res) => {
    try {
      if (req.session.admin) {
        const viewCategory = await adminHelper.getAllCategory();
        res.render("admin/admin-categories", { viewCategory });
      } else {
        res.redirect("/admin/login");
      }
    } catch (err) {
      console.log(err);
    }
  },

  AdminloginPage: (req, res) => {
    if (req.session.admin) {
      res.redirect("/admin");
    } else {
      res.render("admin/admin-account-login.ejs");
    }
  },

  AdminloginPost: (req, res) => {
    if (
      req.body.email === process.env.ADMIN_EMAIL &&
      req.body.password === process.env.ADMIN_PASSWORD
    ) {
      req.session.admin = true;
      res.redirect("/admin");
    } else {
      res.redirect("/admin/login");
    }
  },

  AdminlogoutGet: (req, res) => {
    req.session.admin = false;
    res.redirect("/admin");
  },

  BlockUser: async (req, res) => {
    if (req.session.admin) {
      let userId = req.params.id;
      try {
        await adminHelper.blockUser(userId);

        res.status(200).json("done");
        // res.redirect("/admin/admin-users-list");
      } catch (error) {
        console.error(error);
      }
    }
  },

  unblockUser: async (req, res) => {
    if (req.session.admin) {
      let userId = req.params.id;
      try {
        await adminHelper.unblockUser(userId);
        res.status(200).json("done");
        // res.redirect("/admin/admin-users-list");
      } catch (err) {
        console.error(err);
      }
    }
  },

  addCategory: async (req, res) => {
    try {
      const response = await adminHelper.addCategory(req.body);
      if (response.success) {
        res.status(200).json({ success: true, message: response.message });
      } else {
        res.status(400).json({ success: false, message: response.message });
      }
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ success: false, message: "Failed to add category." });
    }
  },
  deleteCategory: async (req, res) => {
    let categoryId = req.params.id;
    try {
      const response = await adminHelper.deleteCategory(categoryId);
      if (response.success) {
        return res
          .status(200)
          .json({ success: true, message: "Category deleted successfully." });
      } else {
        return res
          .status(500)
          .json({ success: false, message: "Failed to delete category." });
      }
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ success: false, message: "Failed to delete category." });
    }
  },
  addProductPost: async (req, res) => {
    let productDetails = req.body;
    let images = req.files;
    console.log(req.body);

    try {
      await adminHelper.addProductPost(productDetails, images);
      res.json({ success: true }); // Send a JSON response indicating success
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false }); // Send a JSON response indicating failure
    }
  },
  getEditProduct: async (req, res) => {
    let productId = req.params.id;

    try {
      if (req.session.admin) {
        let viewCategory = await adminHelper.getAllCategory();
        let product = await Product.findById(productId);
        res.locals.notificationMessage = "Product updated successfully";
        res.render("admin/admin-edit-product", { viewCategory, product });
      } else {
        res.redirect("/admin/login");
      }
    } catch (err) {
      console.log(err);
    }
  },

  postEditProduct: async (req, res) => {
    try {
      // get the product id, details, and image from the request
      const productId = req.params.id;
      const productDetails = req.body;
      const image = req.files;

      // call the editProductPost function to update the product details
      const updatedProduct = await adminHelper.postEditProduct(
        productDetails,
        image,
        productId
      );

      // redirect to the updated product page
      res.redirect(`/admin/admin-edit-product/${productId}`);
    } catch (error) {
      console.error(error);
    }
  },

  AdminViewProduct: async (req, res) => {
    let productId = req.params.id;
    try {
      const product = await Product.findById(productId);

      res.render("admin/admin-product-details", { product });
    } catch (error) {
      console.error(error);
    }
  },

  AdminViewUser: async (req, res) => {
    let userId = req.params.id;
    try {
      const user = await User.findById(userId);

      res.render("admin/admin-users-detail", { user });
      console.log(user);
    } catch (error) {
      console.error(error);
    }
  },
  GetAllOrder: async (req, res) => {
    try {
      const Orders = await Order.aggregate([
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "user",
          },
        },
      ]);

      if (req.session.admin) {
        res.render("admin/admin-orders", { Orders: Orders });
      } else {
        res.redirect("/admin/login");
      }
    } catch (err) {
      console.log(err);
    }
  },

  getOneOrderDetails: async (req, res) => {
    let orderId = req.params.id;

    try {
      const order = await Order.aggregate([
        { $match: { _id: new ObjectId(orderId) } },
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" },
        {
          $lookup: {
            from: "products",
            localField: "orderedItems.productId",
            foreignField: "_id",
            as: "orderedItems.productId",
          },
        },
        {
          $lookup: {
            from: "addresses",
            localField: "address",
            foreignField: "_id",
            as: "address",
          },
        },
      ]);

      res.render("admin/admin-orders-detail", { Order: order[0] });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: "An error occurred" });
    }
  },
  updateOrderStatus: async (req, res) => {
    try {
      const orderId = req.params.id;
      const { orderStatus } = req.body;
      console.log(orderStatus);
      console.log(orderId);

      const order = await Order.findByIdAndUpdate(
        orderId,
        { orderStatus },
        { new: true }
      );
      if (order.orderStatus === "returned") {
        order.returnStatus = "return accepted";
        await order.save();
      }

      if (order.paymentStatus === "pending" && order.paymentMethod === "COD") {
        order.paymentStatus = "paid";
        await order.save();
      }
      if (
        order.paymentStatus === "paid" &&
        order.returnStatus === "return accepted"
      ) {
        const existingOrder = await Order.findById(orderId);
        const refund = existingOrder.totalAmount;
        const user = await User.findById(existingOrder.user);
        user.wallet += refund;
        await user.save();
      }

      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      res.redirect(`/admin/getOneOrderDetail/${orderId}`);
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: "An error occurred" });
    }
  },

  getAddNewCoupon: async (req, res) => {
    try {
      res.render("admin/admin-add-coupon");
    } catch (err) {
      console.log(err);
    }
  },
  addCouponPost: async (req, res) => {
    console.log(req.body);
    try {
      const response = await adminHelper.generateCoupon(req.body);
      res.json(response);
    } catch (err) {
      console.log(err);
      res.json({ status: false, message: "An error occurred" });
    }
  },

  GetCouponList: async (req, res) => {
    try {
      const coupons = await adminHelper.getCoupons();

      console.log(coupons);

      res.render("admin/admin-coupon-list", { coupons });
    } catch (err) {
      console.log(err);
    }
  },
  deleteCoupon: async (req, res) => {
    const couponId = req.params.id;
    console.log(couponId);

    try {
      // Use the findByIdAndDelete method provided by Mongoose to delete the coupon
      const coupon = await Coupon.findByIdAndDelete(couponId);

      res.json({ success: true }); // Return a success response
    } catch (error) {
      res.json({ success: false }); // Return an error response
    }
  },
  // Controller function to fetch coupon data
  getCoupon: async (req, res) => {
    const couponId = req.params.id;

    try {
      // Use the findById method provided by Mongoose to find the coupon by ID
      const coupon = await Coupon.findById(couponId);

      if (!coupon) {
        // If coupon is not found, return a 404 error
        return res
          .status(404)
          .json({ success: false, message: "Coupon not found" });
      }

      res.json({ success: true, data: coupon }); // Return the coupon data
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },

  updateCoupon: async (req, res) => {
    const couponId = req.params.id;
    const updatedCouponData = req.body;

    try {
      // Use the findByIdAndUpdate method provided by Mongoose to update the coupon
      const updatedCoupon = await Coupon.findByIdAndUpdate(
        couponId,
        updatedCouponData,
        { new: true }
      );

      if (updatedCoupon) {
        res.json({ success: true });
      } else {
        res.json({ success: false });
      }
    } catch (error) {
      res.json({ success: false });
    }
  },

  GetOfferList: async (req, res) => {
    try {
      const categories = await Category.find();
      const offers = await Offer.aggregate([
        {
          $lookup: {
            from: "categories",
            localField: "category",
            foreignField: "_id",
            as: "categoryData",
          },
        },
        {
          $unwind: "$categoryData",
        },
        {
          $project: {
            offerTitle: 1,
            discount: 1,
            category: "$categoryData.CategoryName",
            endDate: {
              $dateToString: { format: "%d-%m-%Y", date: "$endDate" },
            },
            offerApplied: 1,
          },
        },
      ]);

      console.log(offers);
      console.log(categories);

      res.render("admin/admin-offers-list", { categories, offers });
    } catch (err) {
      console.log(err);
    }
  },

  deleteOffer: async (req, res) => {
    try {
      const offerId = req.params.id;
      const response = await adminHelper.postDeleteOffer(offerId);

      if (response.success) {
        res.json({ message: "Offer deleted successfully." });
      } else {
        res.json({ message: "Please remove the offer before deleting it." });
      }
    } catch (error) {
      console.error("Error deleting offer:", error);
      res.json({ status: false, message: "Failed to delete offer." });
    }
  },

  addOfferPost: async (req, res) => {
    console.log(req.body);
    try {
      const response = await adminHelper.generateOffer(req.body);
      res.json(response);
    } catch (err) {
      console.log(err);
      res.json({ status: false, message: "An error occurred" });
    }
  },

  applyOffer: async (req, res) => {
    let offerId = req.params.id;
    try {
      const response = await adminHelper.applyOffer(offerId);
      if (response.success) {
        res.json({ status: true, message: "Offer applied successfully." });
      } else {
        res.json({ status: false, message: "Failed to apply offer." });
      }
    } catch (error) {
      console.log(error);
      res.json({
        status: false,
        message: "An error occurred while applying the offer.",
      });
    }
  },
  removeOffer: async (req, res) => {
    let offerId = req.params.id;
    try {
      const response = await adminHelper.removeOffer(offerId);
      if (response.success) {
        res.json({ status: true, message: "Offer removed successfully." });
      } else {
        res.json({ status: false, message: "Failed to remove offer." });
      }
    } catch (error) {
      console.log(error);
      res.json({
        status: false,
        message: "An error occurred while removing the offer.",
      });
    }
  },
  GetSalesReport: async (req, res) => {
    try {
      const orders = await Order.find({ orderStatus: "placed" })
        .populate({
          path: "orderedItems.productId",
          model: Product,
        })
        .populate("address");

      const reportData = [];
      for (const order of orders) {
        for (const item of order.orderedItems) {
          const { productId, quantity } = item;
          console.log(item);
          const product = productId;

          const entry = {
            date: order.orderDate,
            product: product.productName,
            quantity,
            price: product.productPrice,
          };

          reportData.push(entry);
        }
      }

      generateSalesReport(reportData, res);
    } catch (error) {
      console.log(error);
      res.status(500).json({
        error: "Oops! Something went wrong while fetching order data",
      });
    }
  },

  salesReportPage: async (req, res) => {
    const sales = await adminHelper.getAllDeliveredOrders();
    console.log("sales", sales);

    sales.forEach((order) => {
      // Format the orderDate using built-in JavaScript methods or a date formatting library like Moment.js
      const formattedDate = new Date(order.orderDate).toLocaleDateString(
        "en-US",
        {
          year: "numeric",
          month: "long",
          day: "numeric",
        }
      );

      order.orderDate = formattedDate;
    });

    res.render("admin/admin-sales-report", { sales });
  },

  salesReport: async (req, res) => {
    try {
      console.log(req.body);
      let { startDate, endDate } = req.body;

      startDate = new Date(startDate);
      endDate = new Date(endDate);

      const salesReport = await adminHelper.getAllDeliveredOrdersByDate(
        startDate,
        endDate
      );
      for (let i = 0; i < salesReport.length; i++) {
        salesReport[i].orderDate =
          salesReport[i].orderDate.toLocaleDateString(); // Format the orderDate using toLocaleDateString
        salesReport[i].totalAmount = salesReport[i].totalAmount.toLocaleString(
          "en-IN",
          { style: "currency", currency: "INR" }
        ); // Format totalAmount as currency (INR)
      }
      res
        .status(200)
        .json({ sales: salesReport, startDate: startDate, endDate: endDate });
    } catch (error) {
      console.log(error);
    }
  },

  salesReportExcel: async (req, res) => {
    try {
      console.log(
        "salesReportExcelsalesReportExcel",
        req.body,
        "salesReportExcelsalesReportExcel"
      );
      let salesData = [];
      let { startDate, endDate } = req.body;

      startDate = new Date(startDate);
      endDate = new Date(endDate);

      const salesReport = await adminHelper.getAllDeliveredOrdersByDate(
        startDate,
        endDate
      );

      for (let i = 0; i < salesReport.length; i++) {
        // Convert the orderDate to a valid date format
        salesReport[i].orderDate = dateFormat(
          new Date(salesReport[i].orderDate)
        );
        salesReport[i].totalAmount = currencyFormat(salesReport[i].totalAmount);
      }

      console.log(salesReport);
      salesReport.forEach((sale) => {
        const { _id, orderDate, totalAmount, paymentMethod, orderStatus } =
          sale;
        const userName = sale.userDetails[0].name;
        salesData.push({
          _id,
          userName,
          orderDate,
          totalAmount,
          paymentMethod,
          orderStatus,
        });
      });

      const csvFields = [
        "No",
        "Order Id",
        "Customer Id",
        "Order Date",
        "Payment Method",
        "Order Status",
        "Total Amount",
      ];
      const csvData = await csvParser.json2csv(salesData, {
        fields: csvFields,
      });

      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        "attachment: filename=Sales-Report.csv"
      );
      res.status(200).end(csvData);
    } catch (error) {
      console.log(error);
    }
  },
};
