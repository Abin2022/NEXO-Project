
const User = require("../models/userModel")
const bcrypt=require('bcrypt')
const Product=require("../models/productModel")

//multer
const multer = require("multer");
const path = require("path");
const express = require("express");
const router = express.Router();

const { userLogout } = require("./userController");

const Category = require("../models/categoryModel");
const { log } = require("handlebars/runtime");
const Order = require('../models/orderModel')
const moment = require("moment-timezone")




const loadLogin =async(req,res)=>{
    try{
        res.render('admin/login')
    }catch(error){
        console.log(error.message);
    }
}

const verifyLogin = async(req,res)=>{
    try{
       const email=req.body.email
       const password= req.body.password

        const userData=await User.findOne({email:email})
        console.log(userData);
        if(userData){
            const passwordMatch= await bcrypt.compare(password,userData.password)

              if(passwordMatch){
                  if(userData.is_admin===0){
                    res.render('admin/login')
                  }else{
                     req.session.user_id =userData._id
                    console.log(req.session.user_id);
                     res.redirect('/admin/home')
                  }
              }
        }else{
            res.render('admin/login')
        }
    }catch(error){
        console.log(error.message);
    }
}


const loadDashboard=async(req,res)=>{
    try{
        User.findById({_id:req.session.user_id})
     res.render('admin/home')
    }catch(error){
     console.log(error.message);
    }
}

const adminLogout = async(req,res)=>{
    try{
       req.session.destroy()
       res.redirect('admin')
    }catch(error){
      console.log(error.message);
    }
  }

  const loadProducts = async (req, res) => {
    try {
      const updateProducts = await Product.find().lean();
      const productWithSerialNumber = updateProducts.map((products, index) => ({
        ...products,
        serialNumber: index + 1,
      }));
      const categories = await Category.find().lean();
      res.render("admin/add-products", {
        // layout: "admin-layout",
        products: productWithSerialNumber,
        categories: categories,
      });
    } catch (error) {
      console.log(error.message);
    }
  };
  
  const insertProducts = async (req, res) => {
    try {
       var arrayImage=[]
      for (let i = 0; i < req.files.length; i++) {
        arrayImage[i] = req.files[i].filename;
      }
      

      const newProduct = new Product({
        brand: req.body.brand,
        productname: req.body.productname,
        category: req.body.category,
        price: req.body.price,
        images: arrayImage,
        // images: req.file.filename,
        // images: req.files.map(file => file.filename),
        description: req.body.description,
      });
  
      const addProductData = await newProduct.save();
      console.log(addProductData);
      if (addProductData) {
        await Category.updateOne(
          {
            category: req.body.category,
          },
          {
            $push: { products: newProduct._id },
          }
        );
        const updateProducts = await Product.find().lean();
        const productWithSerialNumber = updateProducts.map((products, index) => ({
          ...products,
          serialNumber: index + 1,
        }));
        const categories = await Category.find().lean();
        res.render("admin/add-products", {
          products: productWithSerialNumber,
          categories: categories,
        });
      }
    } catch (error) {
      console.log(error);
    }
  };









//   const editProduct = async (req, res) => {
//     try {
//       const id = req.query.id;
//       console.log(id);
//       const productData = await Product.findById({ _id: id }).lean();
//       console.log(productData);
//       if (productData) {
  
//         res.render("admin/edit-product", {
          
//           product: productData,
//         });
//       } else {
//         res.redirect("/admin/home");
//       }
//     } catch (error) {
//       console.log(error.message);
//     }
//   };

  
// const updateProduct=async(req,res)=>{
//   try {
//     const productData = await Product.findByIdAndUpdate(
//       { _id: req.body.id },
//       {
//         $set: {
//           brand: req.body.brand,
//           productname: req.body.productname,
//           category: req.body.category,
//           price: req.body.price,
//           images: req.body.images,
//           description: req.body.description,
//         },
//       }
//     );

//     res.redirect("/admin/home");

    
//   } catch (error) {
//     console.log(error.message);
//   }
// }




const editProduct = async (req, res) => {
  try {
   
    const id = req.query.id;
    const productData = await Product.findById(id).lean();
    if (productData) {
      res.render("admin/edit-product", {
        product: productData,
      });
    } else {
      res.redirect("/admin/home");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const updateProduct = async (req, res) => {
  try {

     //here###
     var arrayImage=[]
     for (let i = 0; i < req.files.length; i++) {
       arrayImage[i] = req.files[i].filename;
     }
    const id = req.body.id;
    const updatedProduct = {
      brand: req.body.brand,
      productname: req.body.productname,
      category: req.body.category,
      price: req.body.price,
      images: req.body.images,
      images: arrayImage,
      description: req.body.description,
    };

    await Product.findByIdAndUpdate(id, updatedProduct);
    res.redirect("/admin/home");
  } catch (error) {
    console.log(error.message);
  }
};



const unlistProducts = async (req, res) => {
  try {
    const id = req.query.id;
    const ProductData = await Product.findByIdAndUpdate(
      id,
      { $set: { unlist: true } }
    );
    res.redirect("/admin/add-products");
  } catch (error) {
    console.log(error.message);
  }
};

const listProducts = async (req, res) => {
  try {
    const id = req.query.id;
    const ProductData = await Product.findByIdAndUpdate(
      id,
      { $set: { unlist: false } }
    );
    res.redirect("/admin/add-products");
  } catch (error) {
    console.log(error.message);
  }
};










  
  const loadCategory = async (req, res) => {
    try {
      const updatedcategory = await Category.find().lean();
      const categoryWithSerialNumber = updatedcategory.map((category, index) => ({
        ...category,
        serialNumber: index + 1,
      }));
      res.render("admin/category", {
        category: categoryWithSerialNumber,
      });
    } catch (error) {
      console.log(error.message);
    }
  };
  
  const addCategory = async (req, res) => {
    try {
      const category = req.body.category.toUpperCase();
  
      const existingCategory = await Category.findOne({
        category: { $regex: new RegExp("^" + category + "$", "i") },
      });
      if (existingCategory) {
        const errorMessage = "category already exits";
        const updatedcategory = await Category.find().lean();
        const categoryWithSerialNumber = updatedcategory.map(
          (category, index) => ({
            ...category,
            serialNumber: index + 1,
          })
        );
  
        return res.render("admin/category", {
          category: categoryWithSerialNumber,
          error: errorMessage,
        });
      }
      const newCategory = new Category({
        category: category,
      });
      const categories = await newCategory.save();
      return res.redirect("/admin/category");
    } catch (error) {
      console.log(error.message);
    }
  };

  //add user
  const addUser = async (req, res) => {
    const userData = await User.find({ is_admin: 0 }).lean();
    // console.log(userData);
    const usersWithSerialNumber = userData.map((users, index) => ({
      ...users,
      serialNumber: index + 1,
    }));
    res.render("admin/user", {
      user: usersWithSerialNumber,
    });
  };



  const editUser = async (req, res) => {
    try {
      const id = req.query.id;
      console.log(id);
      const userData = await User.findById({ _id: id }).lean();
      console.log(userData);
      if (userData) {
  
        res.render("admin/edit-user", {
          
          user: userData,
        });
      } else {
        res.redirect("/admin/home");
      }
    } catch (error) {
      console.log(error.message);
    }
  };
  
  

const updateUser=async(req,res)=>{
  try {
    const userData = await User.findByIdAndUpdate(
      { _id: req.body.id },
      {
        $set: {
          name: req.body.name,
          email: req.body.email,
          mobile: req.body.mobile,
          is_verified: req.body.verified,
        },
      }
    );

    res.redirect("/admin/home");

    
  } catch (error) {
    console.log(error.message);
  }
}

const blockUser = async (req, res) => {
  try {
    const id = req.query.id;
    console.log(id);
    const userData = await User.findByIdAndUpdate(
      { _id: id },
      { $set: { blocked: true } }
    );
    console.log(userData);
    res.redirect("/admin/user");
  } catch (error) {
    console.log(error.message);
  }
};

const blockedUserlist = async (req, res) => {
  try {
    const userData = await User.find({ blocked: true }).lean();
    const usersWithSerialNumber = userData.map((blockUser, index) => ({
      ...blockUser,
      serialNumber: index + 1,
    }));
    res.render("admin/blockeduserlist", {
     
      user: usersWithSerialNumber,
    });
  } catch (error) {
    console.log(error.message);
  }
};




const unblockUser = async (req, res) => {
  try {
    const id = req.query.id;
    // console.log(id, "id");
    const userData = await User.findByIdAndUpdate(
      { _id: id },
      { $set: { blocked: false } }
    );
    res.redirect("/admin/unblockUser");
  } catch (error) {
    console.log(error.message);
  }
};


// const getUserOrders=async(req,res)=>{
//    try {
//       res.render('admin/userOrders')
//    } catch (error) {
//     console.log(error.message);
//    }
// }

const getUserOrders = async (req, res) => {
  try {
    console.log('entered into getUSERORDERS'); 
    const orderData = await Order.find().populate("userId").lean();
    console.log(orderData, "order data coming");
    const orderHistory = orderData.map((history) => {
      let createdOnIST = moment(history.date)
        .tz("Asia/Kolkata")
        .format("DD-MM-YYYY h:mm A");

      return { ...history, date: createdOnIST, username: history.userId.name };
    });
    console.log(orderHistory, "order serial numbers");
    res.render("admin/userOrders", {
      
      orderData: orderHistory,
    });
  } catch (error) {
    console.log(error.message);
  }
};






module.exports = {
    loadLogin,
    verifyLogin,
    loadDashboard,
    adminLogout,

    loadProducts,
    insertProducts,
    loadCategory,
    addCategory,
    loadProducts,
    
     addUser,
     editUser,
     updateUser,
     blockUser,
     blockedUserlist,
     unblockUser,

     editProduct,
     updateProduct,
     unlistProducts,
     listProducts,

     getUserOrders,
    

}