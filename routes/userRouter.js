import express from 'express';
const router = express.Router();

import userController from '../controllers/userController';


router.get('/', userController.getHome); // Add this route for the home page

router.get('/signup', userController.getSignup);
router.post('/signup', userController.DosignUp);
router.get('/login', userController.getLogin);
router.post('/login', userController.DologIn);


export default router;