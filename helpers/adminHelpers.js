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
  }
  ,
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
      const newproduct = new product({
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
      await newproduct.save();
      return;
    } catch (err) {
      console.error(err);
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
};
