const User = require('../models/userModel');
const Category = require('../models/categoryModel');
const Product = require('../models/productModel');
const Coupon = require('../models/couponModel')
const mongoose = require('mongoose');
// const admin=require('../models/adminModel')
const ObjectId = mongoose.Types.ObjectId;

//manage 
const manageCoupon = async (req, res) => {
    console.log(manageCoupon,"entered into mangeCoupon section...");
    try {
     console.log("entered into manage coupon..........");
    //   const admin = req.session.is_admin;
      const adminData = await User.find({ is_admin:1});
      
      console.log(adminData, 'adminData');
  
      const activeCoupons = await Coupon.find({ activeCoupon: true }).lean();
      const inActiveCoupons = await Coupon.find({ activeCoupon: false }).lean();
      console.log(activeCoupons,"activeCoupons....");
      console.log(inActiveCoupons,"inactivecoupons....");
      const dataToRender = {
        adminData,
        activeCoupons,
        inActiveCoupons
      };
  
      res.render('admin/coupon-manage', dataToRender);
    } catch (error) {
      console.log(error);
    }
  };

  const addNewCouponPage = async(req,res)=>{
    try {
        console.log("entered into addnewcouponpage......");
        // const admin = req.session.is_admin;
        const adminData = await User.find({is_admin:1})
        
        let couponExistError = false;

        if(req.session.couponExistError){
            couponExistError = req.session.couponExistError;     
        }
  
        res.render('admin/coupon-add',{ adminData, couponExistError });

        delete req.session.couponExistError;
    } catch (error) {
        console.log("Error from addNewCouponGET couponController :", error);
    }
}



const addNewCoupon = async (req, res) => {
    try {
        console.log("Updating the coupon details......");
    //   const admin = req.session.is_admin;
      const adminData = await User.find({ is_admin:1 });
     console.log(adminData,"admindata........");
      const newCouponData = req.body;
  
      const couponExist = await Coupon.find({ couponCode: newCouponData.couponCode.toLowerCase() }).lean();
        console.log(couponExist,"couponExit.....");
      if (couponExist.length === 0) {
        const couponData = new Coupon({
          couponCode: newCouponData.couponCode.toLowerCase(),
          couponDescription: newCouponData.couponDescription,
          discountPercentage: newCouponData.discountPercentage,
          maxDiscountAmount: newCouponData.maxDiscountAmount,
          minOrderValue: newCouponData.minOrderValue,
          validFor: newCouponData.validFor,
          activeCoupon: newCouponData.activeCoupon === "true" ? true : false,
          usageCount: 0,
          createdOn: new Date()
        });
  
        const couponAddition = await couponData.save();
          console.log(couponExist,"couponexit value");
        res.redirect('/admin/add-coupon');
      } else {
        req.session.couponExistError = "Coupon code already exists, try some other code";
        res.redirect('/admin/add-coupon');
      }
    } catch (error) {
      console.log(error);
    }
  };
  

  const inactiveCouponsPage = async (req, res) => {
    try {
        console.log("entered into disablecoupon page...............");
    //   const admin = req.session.is_admin;
      console.log(admin,"Admin.....");
      const adminData = await User.find({ is_admin: 1});
  
      const inActiveCoupons = await Coupon.find({ activeCoupon: false }).lean();
  
      const dataToRender = {
        adminData,
        inActiveCoupons
      };
  
      res.render('admin/coupon-deactivated', dataToRender);
  
    } catch (error) {
      console.log(error.message);
    }
  };

  const editCouponPage = async (req, res) => {
    try {
        console.log("entered into edit coupon page.......");
    //   const admin = req.session.is_admin;
      const adminData = await User.find({ is_admin:1 });
  
      let couponExistError = false;
  
      if (req.session.couponExistError) {
        couponExistError = req.session.couponExistError;
      }
  
      const couponId = req.query.id;
      const couponData = await Coupon.findOne({ _id: new ObjectId(couponId) }).lean();
      console.log("CouponId",couponId);
       console.log("Coupondata.........",couponData);
      const dataToRender = {
       
        adminData,
        couponExistError,
        couponData
      };
      console.log("REndered data",dataToRender);
      res.render('admin/coupon-edit', dataToRender);
  
      delete req.session.couponExistError;
    } catch (error) {
      console.log("Error from editCouponPOST couponController:", error);
    }
  };
  
  

  const updateCoupon = async (req, res) => {
    try {
        console.log("Copuon is beeing updated");
    //   const admin = req.session.is_admin;
      const adminData = await User.find({ is_admin: 1 });
  
      const couponDataForUpdate = req.body;
      const couponId = couponDataForUpdate.couponId;
  
      const couponExist = await Coupon.find({ couponCode: couponDataForUpdate.couponCode.toLowerCase() }).lean();
       console.log("couponExit",couponExist);
      if (couponExist.length === 0) {
        const couponCode = couponDataForUpdate.couponCode.toLowerCase();
        const activeCoupon = couponDataForUpdate.activeCoupon === "true" ? true : false;
        const couponDescription = couponDataForUpdate.couponDescription;
        const discountPercentage = couponDataForUpdate.discountPercentage;
        const maxDiscountAmount = couponDataForUpdate.maxDiscountAmount;
        const minOrderValue = couponDataForUpdate.minOrderValue;
        const validFor = couponDataForUpdate.validFor;
  
        const couponUpdation = await Coupon.updateOne({ _id: couponId }, {
          $set: {
            couponCode: couponCode,
            couponDescription: couponDescription,
            discountPercentage: discountPercentage,
            maxDiscountAmount: maxDiscountAmount,
            minOrderValue: minOrderValue,
            validFor: validFor,
            activeCoupon: activeCoupon
          }
        });
        console.log("Couponupdation...............",couponUpdation);
  
        res.redirect('/admin/manage-coupons');
      } else {
        req.session.couponExistError = "Coupon code already exists, try some other code";
        res.redirect('/admin/edit-coupon/?id=' + couponId);
      }
    } catch (error) {
      console.log("Error from updateCouponPOST couponController:", error);
    }
  };
  
  
  
  
 
 
  

  
  module.exports = {
    manageCoupon,
    addNewCouponPage,
    addNewCoupon,
    inactiveCouponsPage,
    editCouponPage,
    updateCoupon,
  };
  










//   const inactiveCouponsGET = async(req,res)=>{
//     try {
//         const admin = req.session.is_admin;
//         const adminData = await User.find({is_admin:admin})

//         const inActiveCoupons = await couponHelpers.getInActiveCoupons();
    
//         const dataToRender = {
    
//             layout: 'admin-layout',
//             adminData,
//             inActiveCoupons
    
//         }
      
//         res.render('admin/coupon-deactivated', dataToRender );
        
    
//     } catch (error) {
//         console.log(error.message);
//     }
// }











// //below is the code for helpers
// // const config = require('../config/config');
// // const User = require('../models/userModel');
// // const Order = require('../models/ordersModel')
// // const Coupon = require('../models/couponModel')
// // const mongoose = require('mongoose');
// // const ObjectId = mongoose.Types.ObjectId;


// module.exports = {








// }