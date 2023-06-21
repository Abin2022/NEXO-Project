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


router.get('/home',userControllers.loadHome)
router.get('/logout',auth.isLogin,userControllers.userLogout)

router.get('/forget',auth.isLogout,userControllers.forgetLoad)
router.post('/forget',userControllers.forgetVerify)

router.get('/forget-password',
auth.isLogout,userControllers.forgetPasswordLoad)
router.post('/forget-password',
auth.isLogout,userControllers.resetPassword)




router.get('/about',userControllers.aboutPage)
// router.get('/quickview',userControllers.productDetails)
// router.get('/otplogin',userControllers.otpLogin)

module.exports=router