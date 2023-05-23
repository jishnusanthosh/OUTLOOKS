const mongoose = require('mongoose');
import User from "../models/userModels";
import Category from "../models/categoryModels";
import product from "../models/productModels";
import Order from "../models/orderModels";
const ObjectId = require('mongoose').Types.ObjectId;




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
      const newCategory = new Category({
        CategoryName: category.CategoryName,
        CategoryDescription: category.CategoryDescription,
      });
      await newCategory.save();
      return;
    } catch (error) {
      console.error("Error adding category:", error);
    }
  },
  deleteCategory: async (categoryId) => {
    try {
      await Category.findByIdAndDelete(
        categoryId,
        { isListed: true },
        { new: true }
      );
      return;
    } catch (error) {
      console.error("Error updating category:", error);
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


  addProductPost: async (productDetails,images) => {

    try {
      const imageFilenames = images.map(image => image.filename);
      const newproduct = new product({
        productName: productDetails.productName,
        productColor: productDetails.productColor,
        productBrand: productDetails.productBrand,
        productDescription: productDetails.productDescription,
        productPrice: productDetails.productPrice,
        productSize: productDetails.productSize,
        category: productDetails.viewCategoryId,
        productQuantity: productDetails.productQuantity,
        productImage:imageFilenames
        
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
        const imageFilenames = images.map(image => image.filename);
        // If an image is uploaded, update the product with the image filename
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
 
};
