import express from 'express';
const router = express.Router();
import adminController from '../controllers/adminController';


router.get('/',adminController.Adminlogin);

export default router;










