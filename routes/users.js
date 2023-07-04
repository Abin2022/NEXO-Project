const express=require("express")
var router=express.Router();
const userControllers = require("../controllers/userController")
const config = require("../config/config")
const session=require("express-session")
const auth=require("../middlewares/auth")



const multer = require('multer')
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, '../public/userImage'))
    },
    filename: (req, file, cb) => {
      const name = Date.now() + '-' + file.originalname;
      cb(null, name)
    }
  })

const userUpload = multer ({storage: storage})

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

router.get('/forget-password',auth.isLogout,userControllers.forgetPasswordLoad)
router.post('/forget-password',auth.isLogout,userControllers.resetPassword)

router.get('/otp',userControllers.getOtp)
router.get('/sendOtp',userControllers.sendOtp)
router.post('/verifyOtp',userControllers.verifyOtp)

 router.get('/product-details',auth.isLogin,userControllers.singleProductDetails)

   router.get('/profile',auth.isLogin,userControllers.profilePage)
   router.post('/edit-user',userUpload.single('image'),userControllers.editUser);

   router.get('/address',userControllers.loadAddress)  
   router.post('/address',userControllers.addAddress);
   router.post('/set-as-default',userControllers.setAsDefault);
// router.post('/add-new-address',userControllers.addNewAddress)

router.get('/delete-address',auth.isLogin,userControllers.deleteAddress);
router.post('/edit-address',userControllers.editAddress);

 
 router.get('/checkout',auth.isLogin,userControllers.loadCheckout);
 router.post('/change-address',userControllers.changeAddress);

 router.post('/place-order',userControllers.placeOrder)
 router.get('/order-details',auth.isLogin,userControllers.orderDetails)
  router.get('/ordersView',auth.isLogin,userControllers.loadOrdersView)


  


 router.post('/addtocart',auth.isLogin,userControllers.addToCart)
router.get('/cart',auth.isLogin,userControllers.getCart)
router.post('/change-product-quantity',userControllers.changeQuantity)
// router.post('/delete-product-from-cart',userControllers.deleteProduct)



// router.get('/checkout',auth.isLogin,userControllers.checkoutPage)


router.get('/block',userControllers.blockUser)


module.exports=router