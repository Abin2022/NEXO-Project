const express=require("express")
var router=express.Router();
const userControllers = require("../controllers/userController")
const config = require("../config/config")
const session=require("express-session")
const auth=require("../middlewares/auth")





router.get('/signup',auth.isLogout,userControllers.loadSignup)
router.post('/signup',userControllers.insertUser)
router.get('/verify',userControllers.verifyMail)


router.get('/',auth.isLogout,userControllers.loginLoad)
router.get('/login',auth.isLogout,userControllers.loginLoad)
router.post('/login',userControllers.verifyLogin)


router.get('/home',auth.isLogin,userControllers.loadHome)
router.get('/logout',auth.isLogin,userControllers.userLogout)

router.get('/forget',auth.isLogout,userControllers.forgetLoad)
router.post('/forget',userControllers.forgetVerify)

router.get('/forget-password',
auth.isLogout,userControllers.forgetPasswordLoad)
router.post('/forget-password',
auth.isLogout,userControllers.resetPassword)







 router.get('/product-details',auth.isLogin,userControllers.singleProductDetails)


router.get('/otp',userControllers.getOtp)
router.get('/sendOtp',userControllers.sendOtp)
router.post('/verifyOtp',userControllers.verifyOtp)


 router.get('/profile',auth.isLogin,userControllers.profilePage)
router.get('/edit',auth.isLogin,userControllers.editProfile)
  router.post('/edit',userControllers.updateProfile)





// router.get('/cart',auth.isLogin,userControllers.loadCart)



 router.post('/addtocart',auth.isLogin,userControllers.addToCart)
router.get('/cart',auth.isLogin,userControllers.getCart)


// router.get("/category", adminAuth.isLogin, adminController.loadCategory);
// router.post("/category", adminController.addCategory);

router.get('/checkout',auth.isLogin,userControllers.checkoutPage)





module.exports=router