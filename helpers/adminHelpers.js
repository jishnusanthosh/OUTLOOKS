const mongoose = require("mongoose");
import User from "../models/userModels";
import Category from "../models/categoryModels";
import product from "../models/productModels";
import Offer from "../models/offerModels";
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
  generateOffer: async (offer) => {
    console.log(offer);
    try {
      const { offerTitle, discount, category, expires } = offer;

      // Extract the date portion from the expires field
      const endDate = new Date(expires);
      endDate.setUTCHours(0, 0, 0, 0); // Set the time to midnight in UTC

      // Remove the time field from the endDate object
      const dateOnly = new Date(endDate.toISOString().split("T")[0]);

      const newOffer = new Offer({
        offerTitle: offerTitle,
        discount: discount,
        category: category,
        endDate: dateOnly,
      });
      await newOffer.save();

      return { status: true, message: "Offer added successfully" };
    } catch (err) {
      console.error(err);
      return {
        status: false,
        message: "An error occurred while adding the offer",
      };
    }
  },

  applyOffer: async (offerId) => {
    try {
      const offer = await Offer.findById(offerId);
      console.log(offer);
      if (offer) {
        // Check if offer is already applied
        if (offer.offerApplied) {
          return { success: false, message: "Another offer is already applied." };
        }
  
        const products = await product.find({ category: offer.category });
  
        for (const product of products) {
          // Decrease the offer discount from the product price
          const discountedPrice = product.productPrice - offer.discount;
  
          // Check if the product price is greater than the discounted price
          if (product.productPrice > discountedPrice) {
            // Update the product with the discounted price
            product.productPrice = discountedPrice;
            product.originalPrice = product.productPrice + offer.discount;
            await product.save();
          }
        }
  
        // Update offerApplied field in offerSchema
        offer.offerApplied = true;
        await offer.save();
  
        // Update offerApplied field in categorySchema
        const category = await Category.findById(offer.category);
        if (category) {
          category.offerApplied = true;
          await category.save();
        }
  
        return { success: true };
      } else {
        return { success: false, message: "Offer not found." };
      }
    } catch (error) {
      console.log(error);
      return { success: false, message: "An error occurred while applying the offer." };
    }
  }
  ,
  postDeleteOffer: async (offerId) => {
    try {
      const offer = await Offer.findById(offerId);

      if (offer.offerApplied) {
        return { success: false };
      }

      await Offer.findByIdAndDelete(offerId);
      return { success: true };
    } catch (error) {
      console.error("Error deleting offer:", error);
      return { success: false, message: "Failed to delete offer." };
    }
  },

  removeOffer: async (offerId) => {
    try {
      const offer = await Offer.findById(offerId);
      console.log(offer);
      if (offer) {
        const products = await product.find({ category: offer.category });

        for (const product of products) {
          // Decrease the offer discount from the product price
          const discountedPrice = product.productPrice + offer.discount;

          // Update the product with the discounted price
          product.productPrice = discountedPrice;
          product.originalPrice = product.productPrice - offer.discount;

          await product.save();
        }

        // Update offerApplied field in offerSchema
        offer.offerApplied = false;
        await offer.save();

        // Update offerApplied field in categorySchema
        const category = await Category.findById(offer.category);
        if (category) {
          category.offerApplied = false;
          await category.save();
        }

        return { success: true };
      } else {
        return { success: false, message: "Offer not found." };
      }
    } catch (error) {
      console.log(error);
      return {
        success: false,
        message: "An error occurred while applying the offer.",
      };
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

      try {
        const orders = await Order.find({
          orderDate: { $gte: formattedStartDate, $lte: formattedEndDate },
          orderStatus: "delivered",
        })
          .populate({
            path: "user",
            model: "User",
            select: "username email phonenumber", // Specify the fields to select from the user
          })
          .lean();

        console.log("Orders in range:", orders);
        console.log("getAllDeliveredOrdersByDate completed successfully.");
        resolve(orders);
      } catch (error) {
        console.error("Error in getAllDeliveredOrdersByDate:", error);
        reject(error);
      }
    });
  },
};
