import express from 'express';

const router = express.Router();

export default{

    Adminlogin:async (req,res)=>{
        try {
            res.render('admin/admin-blank')
        } catch (error) {
            console.log(error);
        }
    },
    // login:async(req, res, next)=> {
    //     res.render('shop/userlogin/login');
      
    //   },
    // home:async(req,res,next)=>{
    //     try {
    //         res.render('shop/home')
    //     } catch (error) {
            
    //     }
    //   },
    // women:async(req,res,next)=>{
    //     try {
    //         res.render('shop/women')
    //     } catch (error) {
            
    //     }
    //   },
    //   men:async(req,res,next)=>{
    //     try {
    //         res.render('shop/men')
    //     } catch (error) {
            
    //     }
    //   },
      
}