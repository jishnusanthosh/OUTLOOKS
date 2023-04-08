import express from 'express';

const router = express.Router();

export default{

    getOtpLogin:async (req,res)=>{
        try {
            res.render('shop/userlogin/otp-login')
        } catch (error) {
            console.log(error);
        }
    },
    login:async(req, res, next)=> {
        res.render('shop/userlogin/login');
      
      },
    home:async(req,res,next)=>{
        try {
            res.render('shop/home')
        } catch (error) {
            
        }
      }
}