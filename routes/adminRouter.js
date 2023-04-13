import express from 'express';
const router = express.Router();

import adminController from '../controllers/adminController';




router.get('/', adminController.AdminHomePage);
router.get("/login",adminController.AdminloginPage);
router.post("/login",adminController.AdminloginPost);
router.get("/logout",adminController.AdminlogoutGet);


export default router;






