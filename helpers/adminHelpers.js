const mongoose = require("mongoose");
import User from "../models/userModels";
import Category from "../models/categoryModels";
import product from "../models/productModels";
import Order from "../models/orderModels";
import Coupon from "../models/couponModel";
import moment from "moment/moment.js";
const ObjectId = require("mongoose").Types.ObjectId;

export default {
  blockUser: async (userId) => {
    console.log(userId);
    try {
      const user = await User.findById(userId);
      user.isActive = false;
      await user.save();
      console.log(`User with ID ${userId} has been blocked`);
    } catch (error) {
      console.error(error);
      throw new Error("Failed to block user");
    }
  },
  unblockUser: async (userId) => {
    try {
      const user = await User.findById(userId);
      user.isActive = true;
      await user.save();
      console.log(`User with ID ${userId} has been unblocked`);
    } catch (error) {
      console.error(error);
      throw new Error("Failed to unblock user");
    }
  },
  addCategory: async (category) => {
    try {
      const categoryName = category.CategoryName;
      const categoryDescription = category.CategoryDescription;

      const existingCategory = await Category.findOne({
        CategoryName: { $regex: `^${categoryName}$`, $options: "i" },
      });
      if (existingCategory) {
        return { success: false, message: "The category already exists." };
      }

      const newCategory = new Category({
        CategoryName: categoryName,
        CategoryDescription: categoryDescription,
      });
      await newCategory.save();

      return { success: true, message: "Category added successfully." };
    } catch (error) {
      console.error("Error adding category:", error);
      return { success: false, message: "The category already exists." };
    }
  },
  deleteCategory: async (categoryId) => {
    try {
      await Category.findByIdAndDelete(categoryId);
      return { success: true };
    } catch (error) {
      console.error("Error deleting category:", error);
      return { success: false };
    }
  },
  getAllCategory: async () => {
    try {
      let viewCategory = await Category.find({});
      return viewCategory;
    } catch (err) {
      console.error(err);
    }
  },

  blockProduct: async (product) => {
    try {
      product.productStatus = false;
      await product.save();
      console.log(`product ${product} has been blocked`);
    } catch (error) {
      console.error(error);
      throw new Error("Failed to block product");
    }
  },
  unblockProduct: async (product) => {
    try {
      product.productStatus = true;
      await product.save();
      console.log(`product ${product} has been unblocked`);
    } catch (error) {
      console.error(error);
      throw new Error("Failed to unblock product");
    }
  },

  addProductPost: async (productDetails, images) => {
    try {
      const imageFilenames = images.map((image) => image.filename);
      const newProduct = new product({
        productName: productDetails.productName,
        productColor: productDetails.productColor,
        productBrand: productDetails.productBrand,
        productDescription: productDetails.productDescription,
        productPrice: productDetails.productPrice,
        productSize: productDetails.productSize,
        category: productDetails.viewCategoryId,
        productQuantity: productDetails.productQuantity,
        productImage: imageFilenames,
      });
      await newProduct.save();
      return;
    } catch (err) {
      console.error(err);
      throw err; // Rethrow the error to be caught in the controller
    }
  },
  postEditProduct: async (productDetails, images, productId) => {
    try {
      let updatedProduct;

      if (images) {
        const imageFilenames = images.map((image) => image.filename);

        updatedProduct = await product.findByIdAndUpdate(
          productId,
          {
            productName: productDetails.productName,
            productColor: productDetails.productColor,
            productBrand: productDetails.productBrand,
            productDescription: productDetails.productDescription,
            productPrice: productDetails.productPrice,
            productSize: productDetails.productSize,
            category: productDetails.viewCategoryId,
            productQuantity: productDetails.productQuantity,
            productImage: imageFilenames,
          },
          { new: true }
        );
      } else {
        // If no image is uploaded, update the product without changing the productImage field
        updatedProduct = await product.findByIdAndUpdate(
          productId,
          {
            productName: productDetails.productName,
            productColor: productDetails.productColor,
            productBrand: productDetails.productBrand,
            productDescription: productDetails.productDescription,
            productPrice: productDetails.productPrice,
            productSize: productDetails.productSize,
            category: productDetails.viewCategoryId,
            productQuantity: productDetails.productQuantity,
          },
          { new: true }
        );
      }

      return updatedProduct;
    } catch (err) {
      console.error(err);
    }
  },
  generateCoupon: async (coupon) => {
    console.log(coupon);
    try {
      const { couponCode, couponDiscount, expiryDate, maxDiscount } = coupon;
      const newCoupon = new Coupon({
        code: couponCode,
        discount: couponDiscount,
        maxdiscount: maxDiscount,
        expirationDate: expiryDate,
      });
      await newCoupon.save();

      return { status: true, message: "Coupon added successfully" };
    } catch (err) {
      console.error(err);
      return {
        status: false,
        message: "An error occurred while adding the coupon",
      };
    }
  },
  getCoupons: async () => {
    try {
      const coupons = await Coupon.find();
      const couponsWithDaysRemaining = coupons.map((coupon) => {
        const current_date = moment();
        const expiration_date = moment(coupon.expirationDate);
        coupon.days_remaining = expiration_date.diff(current_date, "days");
        return coupon;
      });
      return couponsWithDaysRemaining;
    } catch (err) {
      console.error(err);
    }
  },
  getChartDetails: async () => {
    try {
      const orders = await Order.aggregate([
        {
          $match: { orderStatus: "delivered" },
        },
        {
          $project: {
            _id: 0,
            orderDate: "$createdAt",
          },
        },
      ]);
      let monthlyData = [];
      let dailyData = [];

      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const days = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];

      let monthlyMap = new Map();
      let dailyMap = new Map();
      //converting to monthly order array

      //taking the count of orders in each month
      orders.forEach((order) => {
        const date = new Date(order.orderDate);
        const month = date.toLocaleDateString("en-US", { month: "short" });

        if (!monthlyMap.has(month)) {
          monthlyMap.set(month, 1);
        } else {
          monthlyMap.set(month, monthlyMap.get(month) + 1);
        }
      });

      for (let i = 0; i < months.length; i++) {
        if (monthlyMap.has(months[i])) {
          monthlyData.push(monthlyMap.get(months[i]));
        } else {
          monthlyData.push(0);
        }
      }

      //taking the count of orders in each day of a week
      orders.forEach((order) => {
        const date = new Date(order.orderDate);
        const day = date.toLocaleDateString("en-US", { weekday: "long" });

        if (!dailyMap.has(day)) {
          dailyMap.set(day, 1);
        } else {
          dailyMap.set(day, dailyMap.get(day) + 1);
        }
      });

      for (let i = 0; i < days.length; i++) {
        if (dailyMap.has(days[i])) {
          dailyData.push(dailyMap.get(days[i]));
        } else {
          dailyData.push(0);
        }
      }

      return { monthlyData: monthlyData, dailyData: dailyData };
    } catch (error) {
      console.error(error);
    }
  },
  getAllOrderStatusesCount: async () => {
    try {
      const orderStatuses = await Order.find().select({
        _id: 0,
        orderStatus: 1,
      });

      const eachOrderStatusCount = Order(orderStatuses);

      return eachOrderStatusCount;
    } catch (error) {
      console.log(error);
    }
  },
  orderStatusCount: async (orderStatuses) => {
    try {
      let counts = {};

      orderStatuses.forEach((oneStatus) => {
        let status = oneStatus.orderStatus;
        if (counts[status]) {
          counts[status]++;
        } else {
          counts[status] = 1;
        }
      });

      console.log(counts);
      return counts;
    } catch (error) {
      console.error(error);
      return {};
    }
  },
  getAllDeliveredOrders: () => {
    return new Promise(async (resolve, reject) => {
      await Order.aggregate([
        {
          $match: { orderStatus: "delivered" },
        },
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "userDetails",
          },
        },
      ]).then((result) => {
        resolve(result);
      });
    });
  },
  getAllDeliveredOrdersByDate: (startDate, endDate) => {
    return new Promise(async (resolve, reject) => {
      // Convert startDate and endDate to appropriate format
      const formattedStartDate = new Date(startDate);
      formattedStartDate.setHours(0, 0, 0, 0); // Set time to the beginning of the day
      const formattedEndDate = new Date(endDate);
      formattedEndDate.setHours(23, 59, 59, 999); // Set time to the end of the day
  
      await Order.find({
        orderDate: { $gte: formattedStartDate, $lte: formattedEndDate },
        orderStatus: "delivered",
      })
        .lean()
        .then((result) => {
          console.log("orders in range", result);
          resolve(result);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
  
};
