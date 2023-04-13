import { express } from "express";
import dotenv from "dotenv";

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
  }
}





