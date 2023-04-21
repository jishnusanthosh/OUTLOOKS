import User from "../models/userModels";
import Category from "../models/categoryModels";
import product from "../models/productModels";

export default {
  blockUser: async (userId) => {
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

  addProductPost: async (productDetails) => {

    const category= await Category.findOne({
      categoryName:productDetails.categoryName
    })
    try {
      const newproduct = new product({
        productName: productDetails.productName,
        productColor: productDetails.productColor,
        productBrand: productDetails.productBrand,
        productDescription: productDetails.productDescription,
        productPrice: productDetails.productPrice,
        productSize: productDetails.productSize,
        category: category._id,
        productStatus: productDetails.productStatus,
        productQuantity: productDetails.productQuantity,
      });
      await newproduct.save();
      return;
    } catch (err) {
      console.error(err);
    }
  },
};
