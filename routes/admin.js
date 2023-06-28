const express=require("express");
// const session = require("express-session");
const adminController = require("../controllers/adminController")
var router=express.Router();
const config = require("../config/config")
const adminAuth=require("../middlewares/adminauth")
// const sessionSecret =require("express-session");
const { Admin } = require("mongodb");



var multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../public/uploads"));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const uploads = multer({ storage: storage });
// router.use(session({ secret: config.sessionSecret }));

var router = express.Router();

var bodyParser = require("body-parser");


router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));




router.get('/',adminAuth.isLogout,adminController.loadLogin)
router.post('/',adminController.verifyLogin)
router.get('/home',adminAuth.isLogin,adminController.loadDashboard)
 router.get('/logout',adminAuth.isLogin,adminController.adminLogout)

 router.get("/add-products", adminAuth.isLogin, adminController.loadProducts);
router.post(
  "/add-products",
  uploads.array("image",4),
  adminController.insertProducts
);

router.get("/edit-product",adminAuth.isLogin,adminController.editProduct)
router.post("/edit-product",adminAuth.isLogin,adminController.updateProduct)
router.get(
  "/unlist-products",
  adminAuth.isLogin,
  adminController.unlistProducts
);
router.get("/list-products", adminAuth.isLogin, adminController.listProducts);



router.get("/category", adminAuth.isLogin, adminController.loadCategory);
router.post("/category", adminController.addCategory);

router.get("/user",adminAuth.isLogin,adminController.addUser)
router.get("/edit-user",adminAuth.isLogin,adminController.editUser)
router.post("/edit-user",adminAuth.isLogin,adminController.updateUser)



router.get("/block-user",adminAuth.isLogin,adminController.blockUser)
router.get("/blockeduserlist",adminAuth.isLogin,adminController.blockedUserlist)
router.get("/unblockUser",adminAuth.isLogin,adminController.unblockUser)









router.get('*',(req,res)=>{ 
    res.redirect('/admin')
})
module.exports=router