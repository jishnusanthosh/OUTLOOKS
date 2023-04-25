import express from 'express';
const router = express.Router();


import adminController from '../controllers/adminController';




router.get('/', adminController.AdminHomePage);

router.get("/login",adminController.AdminloginPage);

router.post("/login",adminController.AdminloginPost);

router.get("/logout",adminController.AdminlogoutGet);

router.get("/admin-users-list",adminController.AdminUsersPage);

router.get("/viewUser/:id",adminController.AdminViewUser);

router.get("/admin-add-product",adminController.AdminAddProduct);

router.get("/admin-productss-list",adminController.AdminListProduct);

router.get("/blockProduct/:id",adminController.blockProduct)

router.get("/unblockProduct/:id",adminController.unblockProduct)

router.get("/admin-categories",adminController.AdminCategoriesPage);

router.get("/blockuser/:id",adminController.BlockUser)

router.get("/unblockuser/:id",adminController.unblockUser)

router.post("/createCategory",adminController.addCategory)

router.get("/deleteCategory/:id",adminController.deleteCategory)


router.post("/add-product",adminController.addProductPost)


















export default router;






