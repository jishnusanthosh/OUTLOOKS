import dotenv from "dotenv";
import adminHelper from "../helpers/adminHelpers";

import User from "../models/userModels";
import Product from "../models/productModels";

dotenv.config();



export default {
  AdminHomePage: async (req, res) => {
    
    try {
      if (req.session.admin) {
        res.render("admin/admin-home");
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
    console.log(proId);
    console.log('👶👶👶');
    let product = await Product.findById(proId);

    try {
      if (req.session.admin) {
        await adminHelper.blockProduct(product);
        res.redirect("/admin/admin-productss-list");
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
        res.redirect("/admin/admin-productss-list");
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
      
        res.status(200).json("done")
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
        res.status(200).json("done")
       // res.redirect("/admin/admin-users-list");
      } catch (err) {
        console.error(err);
      }
    }
  },

  addCategory: async (req, res) => {
    try {
      await adminHelper.addCategory(req.body);
      res.redirect("/admin/admin-categories");
    } catch (error) {
      console.error(error);
    }
  },
  deleteCategory: async (req, res) => {
    let categoryId = req.params.id;
    try {
      await adminHelper.deleteCategory(categoryId);
      res.redirect("/admin/admin-categories");
    } catch (error) {
      console.error(error);
    }
  },
  addProductPost: async (req, res) => {
    let productDetails = req.body;
    let image = req.file;
    console.log(image);

    try {
      await adminHelper.addProductPost(productDetails, image);
      res.redirect("/admin/admin-add-product");
    } catch (error) {
      console.error(error);
    }
  },
  getEditProduct: async (req, res) => {
    let productId = req.params.id;
   
    try {
      if (req.session.admin) {
        let viewCategory = await adminHelper.getAllCategory();
        let product = await Product.findById(productId)
        res.locals.notificationMessage = 'Product updated successfully';
        res.render("admin/admin-edit-product",{viewCategory,product});
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
      const image = req.file;
  
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
};
