import user from "../models/userModels";

export async function isUserActive(req, res, next) {
 
    const userActive = await user
      .findById(req.session.user._id)
      .select("isActive");
      
    if (userActive.isActive) {
      next();
    }else{
        res.render("shop/userlogin/login");
    }
 
}



