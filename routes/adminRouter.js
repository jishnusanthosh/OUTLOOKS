import express from 'express';


import adminController from '../controllers/adminController';
import {isloggedInadmin} from '../middlewares/sessionHandling'



const router = express.Router();

//base route 

router.get('/',isloggedInadmin,adminController.AdminHomePage);

router.get("/login",adminController.AdminloginPage);

router.post("/login",adminController.AdminloginPost);

router.get("/logout",isloggedInadmin,adminController.AdminlogoutGet);


//users
router.get("/admin-users-list", isloggedInadmin,adminController.AdminUsersPage);

router.get("/viewUser/:id",isloggedInadmin,adminController.AdminViewUser);

router.put("/blockuser/:id",isloggedInadmin,adminController.BlockUser)

router.put("/unblockuser/:id",isloggedInadmin,adminController.unblockUser)

//category
router.get("/admin-categories",isloggedInadmin,adminController.AdminCategoriesPage);

router.post("/createCategory",isloggedInadmin,adminController.addCategory)

router.get("/deleteCategory/:id",isloggedInadmin,adminController.deleteCategory)


//product
router.get("/viewProduct/:id",isloggedInadmin,adminController.AdminViewProduct);

router.get("/admin-add-product",isloggedInadmin,adminController.AdminAddProduct);

router.get("/admin-productss-list",isloggedInadmin,adminController.AdminListProduct);

router.put("/blockProduct/:id",isloggedInadmin,adminController.blockProduct)

router.put("/unblockProduct/:id",isloggedInadmin,adminController.unblockProduct)

router.get("/admin-edit-product/:id",isloggedInadmin,adminController.getEditProduct)

router.post("/edit-product-post/:id",isloggedInadmin,adminController.postEditProduct)


router.post("/add-product",isloggedInadmin,adminController.addProductPost)


//orders

router.get("/getOrders",isloggedInadmin,adminController.GetAllOrder)

router.get("/getOneOrderDetail/:id",isloggedInadmin,adminController.getOneOrderDetails)

router.post("/updateOrderStatus/:id",isloggedInadmin,adminController.updateOrderStatus);



//coupon
router.get("/getAddNewCoupon",isloggedInadmin,adminController.getAddNewCoupon)

router.post("/addCouponPost",isloggedInadmin,adminController.addCouponPost)

router.get("/admin-coupon-list",isloggedInadmin,adminController.GetCouponList)

//offer
router.get("/admin-offer-list",isloggedInadmin,adminController.GetOfferList)

router.post("/createOffer",isloggedInadmin,adminController.addOfferPost)

router.get("/deleteOffer/:id", isloggedInadmin,adminController.deleteOffer);


router.post("/applyOffer/:id",isloggedInadmin,adminController.applyOffer)

router.post("/removeOffer/:id",isloggedInadmin,adminController.removeOffer)


//sales
router.get("/getSalesReport",isloggedInadmin,adminController.GetSalesReport)

router.get("/sales-report-page",isloggedInadmin,adminController.salesReportPage)

router.post("/sales-report",isloggedInadmin,adminController.salesReport)

router.post("/sales-report-excel",isloggedInadmin,adminController.salesReportExcel)




export default router;






