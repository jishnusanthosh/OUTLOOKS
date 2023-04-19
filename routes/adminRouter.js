import express from 'express';
const router = express.Router();

import adminController from '../controllers/adminController';




router.get('/', adminController.AdminHomePage);
router.get("/login",adminController.AdminloginPage);
router.post("/login",adminController.AdminloginPost);
router.get("/logout",adminController.AdminlogoutGet);
router.get("/admin-users-list",adminController.AdminUsersPage);
router.get("/admin-add-product",adminController.AdminAddProduct);
router.get("/admin-productss-list",adminController.AdminListProduct);


export default router;






