import { express } from "express";
import dotenv from "dotenv";
import adminHelper from "../helpers/adminHelpers";

import  User  from "../models/userModels";



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
     
      const users= await User.find()

      if (req.session.admin) {
        res.render("admin/admin-users-list",{ users: users });
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
        const viewCategory=await adminHelper.getAllCategory()
        res.render("admin/admin-add-product",{viewCategory});
      } else {
        res.redirect("/admin/login");
      }
    } catch (err) {
      console.log(err);
    }
  },
  AdminListProduct: async (req, res) => {
    try {
      if (req.session.admin) {
        res.render("admin/admin-productss-list");
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
        const viewCategory=await adminHelper.getAllCategory()
        res.render("admin/admin-categories",{viewCategory});
      } else {
        res.redirect("/admin/login");
      }
    } catch (err) {
      console.log(err);
    }
  },

  AdminloginPage: (req, res) => {
    if (req.session.admin) {
      res.redirect('/admin')
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
  
  AdminlogoutGet: (req,res) => {
    req.session.admin = false;
    res.redirect("/admin");
  },

  BlockUser: async (req, res) => {
    if (req.session.admin) {
      let userId =req.params.id;
      try {
        await adminHelper.blockUser(userId);
        res.redirect("/admin/admin-users-list");
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
        res.redirect("/admin/admin-users-list");
      } catch (err) {
        console.error(err);
      }
    }
},

addCategory: async (req,res)=>{
  try {
    await adminHelper.addCategory(req.body);
    res.redirect("/admin/admin-categories")
  } catch (error) {
    console.error(error);
  }
},
deleteCategory: async (req,res)=>{
  let categoryId = req.params.id;
  try {
    await adminHelper.deleteCategory();
    res.redirect("/admin/admin-categories")
  } catch (error) {
    console.error(error);
  }
},

AdminViewUser: async (req,res)=>{
   let userId = req.params.id;
  try {
    const user= await User.findById(userId)
     
    res.render("admin/admin-users-detail",{user})
    console.log(user);
  } catch (error) {
    console.error(error);
  }

}
}
