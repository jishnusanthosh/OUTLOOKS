import express from 'express';


import adminController from '../controllers/adminController';
import {isloggedInadmin} from '../middlewares/sessionHandling'



const router = express.Router();

router.get('/',isloggedInadmin,adminController.AdminHomePage);

router.get("/login",adminController.AdminloginPage);

router.post("/login",adminController.AdminloginPost);

router.get("/logout",isloggedInadmin,adminController.AdminlogoutGet);

router.get("/admin-users-list", isloggedInadmin,adminController.AdminUsersPage);

router.get("/viewUser/:id",isloggedInadmin,adminController.AdminViewUser);

router.get("/viewProduct/:id",isloggedInadmin,adminController.AdminViewProduct);

router.get("/admin-add-product",isloggedInadmin,adminController.AdminAddProduct);

router.get("/admin-productss-list",isloggedInadmin,adminController.AdminListProduct);

router.put("/blockProduct/:id",isloggedInadmin,adminController.blockProduct)

router.put("/unblockProduct/:id",isloggedInadmin,adminController.unblockProduct)

router.get("/admin-categories",isloggedInadmin,adminController.AdminCategoriesPage);

router.put("/blockuser/:id",isloggedInadmin,adminController.BlockUser)

router.put("/unblockuser/:id",isloggedInadmin,adminController.unblockUser)

router.post("/createCategory",isloggedInadmin,adminController.addCategory)

router.get("/deleteCategory/:id",isloggedInadmin,adminController.deleteCategory)


router.get("/admin-edit-product/:id",isloggedInadmin,adminController.getEditProduct)

router.post("/edit-product-post/:id",isloggedInadmin,adminController.postEditProduct)


router.post("/add-product",isloggedInadmin,adminController.addProductPost)


export default router;






