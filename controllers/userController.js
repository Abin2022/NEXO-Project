
const User = require("../models/userModel")
const mongoose=require("mongoose")
const bcrypt=require('bcrypt')
const nodemailer= require('nodemailer')
const randomstring=require("randomstring")
const config=require('../config/config')
const { log } = require("handlebars/runtime")

const categoryModel = require("../models/categoryModel");
const Product=require("../models/productModel")
const Cart= require("../models/cartModel")
const Addresses = require("../models/addressesModel")
var Address=require("../models/addressesModel")
const Order = require('../models/orderModel')
const moment = require("moment-timezone")
// const EventEmitter = require('events');

const accountSid = "ACa547f4ad75438fee11d6c1f2b5cc0a4a";
const authToken = 'b4f8c60f86294106865dc4400a08c08f';
const verifySid = "VAb65553a60d1c6c15f8fb69e14c75d2f9";
const client = require("twilio")(accountSid, authToken);

 const Razorpay = require("razorpay");
var instance = new Razorpay({
    key_id: 'rzp_test_vohNN97b9WnKIu',
    key_secret: 'yXjHwM7lO6wpSg5aVdD6tsbF',
});

//helpers
// const userHelpers=require("../helpers/userHelpers")
const productHelper=require("../helpers/productHelper")

const userHelpers = require('../helpers/userHelpers')
const couponHelper = require("../helpers/couponHelper")
// const couponHelpers = require('../helpers/couponHelpers')









const ObjectId = mongoose.Types.ObjectId;


const securePassword =async(password)=>{
  try{
 const passwordHash=await  bcrypt.hash(password,10)
 return passwordHash;
  }catch(error){
    console.log(error.message);
  }
}

//send mail
const sendVerifyMail = async(name,email,user_id)=>{
  try{
   
   const transporter=nodemailer.createTransport({
    host:'smtp.ethereal.email',
    port: 587,
    secure:false,
    requireTls:true,
    auth:{
      user:config.emailUser,
      pass:config.emailpassword,
    }
   })
  const mailOptions={
    
    from:config.emailUser,
    to:email,
    subject:'For Verification Purpose....',
    html:'<p>Hi '+name+',Please Click Here to <a href="http://127.0.0.1:3000/verify?id='+user_id+'">verify</a> your mail.</p>'
  }
  transporter.sendMail(mailOptions,function(error,info){
    if(error){
      console.log(error);
    }else{
      console.log("Email has been Send:-",info.response);
    }
  })
  }catch(error){
    console.log(error.message);
  }
}

const loadSignup=async(req,res)=>{
    try{
       res.render('users/signup')
    }catch(error){
      console.log(error.message);
    }
}
const insertUser=async(req,res)=>{
  try{
    const safePassword=await securePassword(req.body.password)
   const  user=new User({
    name:req.body.name,
    email:req.body.email,
    mobile:req.body.mobile,
    password:safePassword
    
    })
    const userData=await user.save();
    console.log(userData);

    // const existingUser = await User.findOne({ $or: [{ email }, { mobile }] });
    // if (existingUser) {
    //   res.render("users/signup", {
    //     message: "Email or mobile number already exists",
    //   });
    // }
    
    if(userData){
      sendVerifyMail(req.body.name,req.body.email,userData._id)
      res.render('users/emailVerificationNotation' ,{
        message:"You signup is sucessfull pls check the mail"
      })

    }else{
      res.render('users/signup',{message:"Error"})
    }

  }catch(error){
   console.log(error.message);
  }
}


const mailNotification=async(req,res)=>{
  try{
     res.render('users/login')
  }catch(error){
    console.log(error.message);
  }
}


const verifyMail = async(req,res)=>{
  try{
  
    const updateInfo= await User.updateOne({_id:req.query.id},{ $set: { is_verified:1 }
      
    });console.log(updateInfo);
    res.render("users/email-verified")
  }catch(error){
    console.log(error.message);
  }
}

//login user 


const loginLoad=async(req,res)=>{
  try{ 
     res.render('users/login')
  }catch(error){
    console.log(error.message);
  }
}

const verifyLogin=async(req,res)=>{
  try{
   const email=req.body.email;
   const password=req.body.password
   const userData=await User.findOne({
   email:email
   })
    
   if(userData){
    const passwordMatch=await bcrypt.compare(password,userData.password)
    if(passwordMatch){
      if(userData.is_verified === 0){
   res.render('users/login')

   console.log("message printed.......................")
      }else if(userData.blocked ===true){
         res.render('users/block')
      }
      else{
        req.session.user_id=userData._id
        res.redirect('/home')
      }

    }else{
      res.render('users/login',{message:"Email and Password do not match"})
    }
   }else{
    res.render('users/login',{message:"Email and Password do not match"})
   }

  }catch(error){
    console.log(error.message);
  }
}



const loadHome =async(req,res)=>{

  try{
    const userData = await User.findById({ _id: req.session.user_id});
    const productData = await Product.find({unlist:false}).lean();
    const categoryData = await categoryModel.find({unlist:false }).lean();

  res.render("users/home", {
     user: userData,
    Product: productData,
    category: categoryData,
  });
  
  }catch(error){
   res.render(error.message + "rendering issue")
  }
}

//forget password

const forgetLoad = async(req,res)=>{
  try{
    res.render('users/forget')

  }catch(error){
    console.log(error.message);
  }
}

//forget verify

const forgetVerify =async(req,res)=>{
  try{
    const email=req.body.email;
    const userData = await User.findOne({email:email})
    if(userData){
       if(userData.is_verified === 0){
        res.render('users/forget',{message:"Please verify your mail"})
       }else{
        const randomString= randomstring.generate();
       const updateData=await User.updateOne({email:email},{$set:{token:randomString}})
       sendResetPasswordMail(userData.name,userData.email,randomString)
       res.render('users/forgetPassPage',{message:"Please Check your Mail to reset your password"})

       }
    }else{
      res.render('users/forget',{message:"User email is incorrect Or Please enter a valid mail"})
    }
  }catch(error){
    console.log(error.message);
  }
}




const notifyForPassReset=async(req,res)=>{
  try{
     res.render('users/forgetPassPage')
  }catch(error){
    console.log(error.message);
  }
}


//for reset password send mail

//send mail
const sendResetPasswordMail = async(name,email,token)=>{
  try{
   
   const transporter=nodemailer.createTransport({
    host:'smtp.ethereal.email',
    port: 587,
    secure:false,
    requireTls:true,
    auth:{
      user:config.emailUser,

      pass:config.emailpassword,
    }
   })
  const mailOptions={
    //here ----
    from:config.emailUser,
    to:email,
    subject:'To Reset Your Password',
    html:'<p>Hi '+name+',Please Click Here to <a href="http://127.0.0.1:3000/forget-password?token='+token+'">Reset </a> your password.</p>'
  }
  transporter.sendMail(mailOptions,function(error,info){
    if(error){
      console.log(error);
    }else{
      console.log("Email has been Send:-",info.response);
    }
  })
  }catch(error){
    console.log(error.message);
  }
}


const forgetPasswordLoad=async(req,res)=>{ 
  try{
    const token = req.query.token
    const tokenData=await User.findOne({token:token})
    if(tokenData){
      res.render('users/forget-password',{user_id:tokenData._id})

    }else{
      res.render('users/404',{message:"Token is Invalid"})
    }
  }catch(error){
    console.log(error.message);
  }
}

//reset button functionality

const resetPassword=async(req,res)=>{
  try{
    const password=req.body.password;
    const user_id=req.body.user_id
    const secure_password= await securePassword(password)
    const updateData=await User.findByIdAndUpdate({_id:user_id},{$set:{password:secure_password,token:''}})
    res.redirect("/")
  }catch(error){
    console.log(error.message);
  }
}






const singleProductDetails=async(req,res)=>{
  try{
    const productId =req.query.id
    const  singleProduct= await Product.findOne({_id:productId}).lean();
    
    res.render('users/product-details',{
            singleProduct:singleProduct
         })
  }catch(error){
    console.log(error.message);
   
  }
}



const getOtp=(req,res)=>{
  res.render('users/otp')
}

// const sendOtp=(req,res)=>{
// client.verify.v2
// .services(verifySid)
// .verifications.create({ to: "+916235095693", channel: "sms" })
// .then((verification) => console.log(verification.status))
// res.render('users/otpVerification')
// }

const sendOtp= async (req, res) => {
  try {

      console.log(req.body.number,"requiring mobile no");
      let mobile = req.body.number;

      console.log(mobile ,'mobile no');
req.session.userMobileForOtp = mobile;
const userData = await User.findOne({ mobile: mobile })
console.log(userData);
if (userData) {
  if (userData.is_verified === 1) {
      const userMobile = "+91" + mobile;
      console.log(userMobile,"userMobile...");
      client.verify.v2
          .services(verifySid)
          .verifications.create({ to: userMobile, channel: "sms" })
          .then((verification) => {
            console.log(verification.status,'staus..........');
              if (verification.status === "pending") {

                  res.render('users/otpVerification')

              } else {
                  res.render('users/otp', { message: "OTP sending failed"  })
              }
          })

  } else {
      res.render('users/otp', { message: "You have to verify email before OTP login"  })
  }

} else {
  res.render('users/otp', { message: "You have to signup before OTP login"  })
}
} catch (error) {
throw new Error(error.message);
}
}








// const verifyOtp=(req,res)=>{
//   otpCode=req.body.otp
//   client.verify.v2
//     .services(verifySid)
//     .verificationChecks.create({ to: "+916235095693", code: otpCode })
//     .then((verification_check) => console.log(verification_check.status))
//     res.render('users/home')
  
// }




const verifyOtp= async (req, res) => {
  try {
      const userMobile = "+91" + req.session.userMobileForOtp
      console.log(userMobile);
      const otp = req.body.otp;
      client.verify.v2
          .services(verifySid)
          .verificationChecks.create({ to: userMobile, code: otp })
          .then(async (verification_check) => {
              if (verification_check.status === 'approved') {
                  console.log(verification_check.status)
                  let user = await User.findOne({ mobile: req.session.userMobileForOtp })

                  req.session.user_id = user._id;

                  console.log(req.session.user_id);

                  res.redirect('/home');
              } else {
                  res.render('users/otpVerification', { message: "invalid OTP"})
              }

          });
  } catch (error) {

      throw new Error(error.message);
  }
}





const mobilePage = async(req,res)=>{
  try{
    const userData = await User.findById({ _id: req.session.user_id});
    const productData = await Product.find({unlist:false}).lean();
    const categoryData = await categoryModel.find({unlist:false }).lean();

  res.render("users/mobile", {
     user: userData,
    Product: productData,
    category: categoryData,
  });
    
  }catch(error){
    console.log(error.message);
  }
}






const aboutPage = async(req,res)=>{
  try{
    // console.log('users/about');
    res.render('users/about')
  }catch(error){
    console.log(error.message);
  }
}

const userLogout = async(req,res)=>{
  try{
     req.session.destroy()
     res.redirect('/')
  }catch(error){
    console.log(error.message);
  }
}









//address for checckout Page



// const addressList = async (req, res) => {
//   try {
//     const userId = req.session.user_id;

//     const name = req.body.name;

//     const city = req.body.city;
//     const state = req.body.state;
//     const pincode = req.body.pincode;
//     const address = req.body.address;
//     console.log(name,"name");

//     console.log(city,"city");
//     console.log('state',state);
//     console.log('pincode',pincode);
//     const newAddress = {
//       name: name,

//       address: address,
//       city: city,
//       state: state,
//       pincode: pincode,
//       is_default: false,
//     };

//     let userAddress = await Addresses.findOne({ user_id: userId });

//     if (!userAddress) {
//       newAddress.is_default = true;
//       userAddress = new Addresses({ user_id: userId, addresses: [newAddress] });
//     } else {
//       userAddress.addresses.push(newAddress);
//       if (userAddress.addresses.length === 1) {
//         userAddress.addresses[0].is_default = true;
//       }
//     }

//     await userAddress.save();
//     console.log(userAddress, "useraddress");

//     res.redirect("/address");
//   } catch (error) {
//     throw new Error(error.message+"Issue","HEllle");
//   }
// };











const  addToCart= async (req, res) => {
    try {
      
      const proId = req.body.productId;
      console.log(proId,"is here");
            
      let cart = await Cart.findOne({ user_id: req.session.user_id });
    
      if (!cart) {
        let newCart = new Cart({ user_id: req.session.user_id, products: [] });
        await newCart.save();
        cart = newCart;
      }
     
      const existingProductIndex = cart.products.findIndex((product) => {0
        return product.productId.toString() === proId;
      });

      if (existingProductIndex === -1) {
        const product = await Product.findById(proId).lean();
        console.log(proId);
        const total = product.price; 
        cart.products.push({
          productId: proId,
          quantity: 1,
          total, 
        });
      } else {
        cart.products[existingProductIndex].quantity += 1;
        const product = await Product.findById(proId).lean();

        // Update the total by adding the price of the product
        cart.products[existingProductIndex].total += product.price; 
      }

      // Calculate the updated total amount for the cart
      cart.total = cart.products.reduce((total, product) => {
        return total + product.total;
      }, 0);
      

      await cart.save();
     

      res.status(200).json({ message: "Product added to cart successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  
     







const getCart=async(req,res)=>{
  
  try{
    // console.log("entered loading cart page");
      const check = await Cart.findOne({ user_id: req.session.user_id });
    
        // console.log("checking no 1", check, "this is cart");
        if (check) {
          const cart = await Cart.findOne({ user_id: req.session.user_id })
            .populate({
              path: "products.productId",
            })
            .lean()
            .exec();
          // console.log(cart, "checking no 2");
          // console.log("products", cart.products);
          const products = cart.products.map((product) => {
            const total =
              Number(product.quantity) * Number(product.productId.price);
            return {
              _id: product.productId._id.toString(),
              brand: product.productId.brand,
              productname: product.productId.productname,
              images: product.productId.images,
              price: product.productId.price,
              description: product.productId.description,
              quantity: product.quantity,
              total,
              user_id: req.session.user_id,
            };
          });
          // console.log("passing products data is :", products);
    
          const total = products.reduce(
            (sum, product) => sum + Number(product.total),
            0
          );
          // console.log(total,"total ");
    
          const finalAmount = total;
    
          // Get the total count of products
          const totalCount = products.length;
          // console.log(totalCount);
          res.render("users/cart", {
            products,
            total,
            totalCount,
            subtotal: total,
            finalAmount,
          });
          // console.log(products,total,totalCount,finalAmount);
        } else {
          res.render("users/cart");
        }

  }catch(error){

  
    console.log(error.message);
  }
}





  const changeQuantity = async (req, res) => {
    
    try {

         const userId = new mongoose.Types.ObjectId(req.body.userId);
        const productId = new mongoose.Types.ObjectId(req.body.productId);
        const quantity = req.body.quantity;

        console.log("Hello there",userId,productId,quantity);

        const cartFind = await Cart.findOne({user_id: userId});
        const cartId = cartFind._id;
        const count = req.body.count;
        console.log(userId, "userId");
        console.log(productId, 'productid');
        console.log(quantity, 'quantity');
        console.log(cartId, 'cartId');
        console.log(count, 'count');

        // Find the cart for the given user and product
        const cart = await Cart.findOneAndUpdate(
            { user_id: userId, 'products.productId': productId },
            { $inc: { 'products.$.quantity': count } },
            { new: true }
        ).populate('products.productId');

        // Update the total for the specific product in the cart
        const updatedProduct = cart.products.find(product => product.productId._id.equals(productId));
        updatedProduct.total = updatedProduct.productId.price * updatedProduct.quantity;
        console.log("getttttttt",updatedProduct.total);
        productTotal= updatedProduct.total
        await cart.save();

        // Check if the quantity is 0 or less
        if (updatedProduct.quantity <= 0) {
            // Remove the product from the cart
            cart.products = cart.products.filter(product => !product.productId._id.equals(productId));
            await cart.save();
            const response = { deleteProduct: true };
            console.log(response);
            return res.json(response);
        }

        // Calculate the new subtotal for all products in the cart
        const subtotal = cart.products.reduce((acc, product) => {
            return acc + product.total;
        }, 0);

        // Prepare the response object
        const response = {
            quantity: updatedProduct.quantity,
            productTotal:productTotal,
            subtotal: subtotal
        };

        console.log(response);
        return res.json(response);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
};

const deleteProduct= async (req, res) => {
  try {
      const userId = new mongoose.Types.ObjectId(req.body.userId);
      const productId = new mongoose.Types.ObjectId(req.body.productId);

      // Find the cart with the specified user ID and product ID
      const cart = await Cart.findOneAndUpdate(
          { user_id: userId },
          { $pull: { products: { productId: productId } } },
          { new: true } // To return the updated cart document
      );

      if (cart) {
          console.log(cart, 'updated cart');

          // Product successfully removed from the cart
          const response = { deleteProductFromCart: true };
          console.log(response, 'response from userhelper');
          return response;
      } else {
          // Cart or product not found
          const response = { deleteProductFromCart: false };
          console.log(response, 'response from userhelper');
          return response;
      }

  } catch (error) {
      console.log(error);
      res.status(500).json({ error: error.message });
  }
}

    




// var checkoutPage=async(req,res)=>{
//   try{
//     res.render('users/checkout')
//   }catch(error){
//     console.log(error.message);
//   }
// }

const blockUser=async(req,res)=>{
  try{
    
  res.render('users/block')

  }catch(error){
    console.log(error.message);
  }
}






  //user-profile
const profilePage = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.session.user_id);
    console.log(userId, "user id.....");
    const userData = await User.findOne({ _id: userId }).lean();
    const defaultAddress = await Address.findOne(
      { user_id: userId, "addresses.is_default": true },
      { "addresses.$": 1 }
    ).lean();
    console.log(defaultAddress, "defaultAddress");
    if (defaultAddress) {
      res.render("users/profile", {
        userData,
        defaultAddress: defaultAddress.addresses,
      });
    } else {
      res.render("users/profile", { userData});
    }
  } catch (error) {
    console.log(error.message);
  }
};

  



const editUser= async (req, res) => {
  try {
      // console.log(req.file, 'userimage');
      const id = new mongoose.Types.ObjectId(req.session.user_id);
      const userData = await User.findById({ _id: id }).lean();

      if (!userData) {
          throw new Error('User data not found');
      }

      let updatedUserData = {
          // image:req.body.images,
          name: req.body.name,
          email: req.body.email,
           mobile: req.body.mobile,
          // address:req.body.address,
          // city:req.body.city,
          // state: req.body.state,
          // pincode:req.body.pincode,
      };
      // if (req.file) {
      //     // Check if a new image file is uploaded
      //     updatedUserData.image = req.file.filename; // Update with the new image filename

      // }

      const updatedUser = await User.findByIdAndUpdate({ _id: id }, { $set: updatedUserData }, { new: true });
      res.redirect('/profile');
  } catch (error) {
      throw new Error(error.message);
  }
}


  


const loadAddress = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const userAddress = await Address.findOne({user_id: userId })
      .lean()
      .exec();
  console.log(userAddress,"Useraddress.........................");

    if (userAddress) {
      if (userAddress.addresses.length === 1) {
        userAddress.addresses[0].is_default = true; 
      }

      const addressDetails = userAddress.addresses.map((address) => {
        return {
          name: address.name,
          mobile:address.mobile,
          address: address.address,
          city: address.city,
          state: address.state,
          pincode: address.pincode,
          _id: address._id,
          is_default: address.is_default,
          // image:address.images,

        }; 
      });

      console.log(addressDetails, "addressdetails");
      res.render("users/address", {  addressDetails });
    } else {
      res.render("users/address", {
        addressDetails: [],
      });

    }
  } catch (error) {

    throw new Error(error.message);
  }


};



const addAddress = async (req, res) => {
  try {
    // const userId = new mongoose.Types.ObjectId(req.session.user_id);
    // const userData = await User.findOne({ _id: userId }).lean();

     const userId = req.session.user_id;
    //      const id = new mongoose.Types.ObjectId(req.session.user_id);
  
    const name = req.body.name;
   const mobile=req.body.mobile;
    const city = req.body.city;
    const state = req.body.state;
    const pincode = req.body.pincode;
    const address = req.body.address;

    

    console.log(name,"name");
    
    console.log(city,"city");
    console.log(state,'state');
    console.log(address,'address');
    console.log(pincode,"pincod");

    const newAddress = {
      name: name,
      mobile:mobile,
      address: address,
      city: city,
      state: state,
      pincode: pincode,
      is_default: false,
    };

    let userAddress = await Address.findOne({ user_id: userId });




    if (!userAddress) {
      // If the user doesn't have any address, create a new document
      newAddress.is_default = true;
      userAddress = new Address({ user_id: userId, address: [newAddress] });
    } else {
      // If the user already has an address, push the new address to the array
      userAddress.addresses.push(newAddress);
      // Check if there is only one address in the array
      if (userAddress.addresses.length === 1) {
        // If there is only one address, set it as the default
        userAddress.addresses[0]. is_default = true;
      }
    }

    await userAddress.save(); // Save the updated address document
    console.log(userAddress, 'useraddress');

    res.redirect('/address');
  } catch (error) {
    throw new Error(error.message);
  }
};






const setAsDefault= async (req, res) => {
  try {
      const addressId = req.body.addressId;
      const userId = req.session.user_id;
      // console.log(addressId,userId,"address and user id ");

      // Find the current default address and unset its "isDefault" flag
      await Address.findOneAndUpdate(
          { user_id: userId, 'addresses.is_default': true },
          { $set: { 'addresses.$.is_default': false } }
      );
      // console.log(addressId,userId,"address and user id ");

      // Set the selected address as the new default address
      const defaultAddress = await Address.findOneAndUpdate(
          { user_id: userId, 'addresses._id': addressId },
          { $set: { 'addresses.$.is_default': true } }
      );
      // console.log(addressId,userId,"address and user id ");

      // console.log(defaultAddress," def addres ");

      const response = {
          setDefault: true
      }
       console.log(response);
      return response

  } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to set address as default' });
  }
}


const addNewAddress = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const { name, mobile, address, city, state, pincode } = req.body;
    // console.log(name);
    // console.log(mobile);
    // console.log(city);
    // console.log(state);
    // console.log(pincode);
    const newAddress = {
      name: name,
      mobile: mobile,
      address: address,
      city: city,
      state: state,
      pincode: pincode,
      is_default: false, // Set the default flag to false by default
    };

    // Find the user's address document based on the user_id
    let userAddress = await Address.findOne({ user_id: userId });

    if (!userAddress) {
      // If the user doesn't have any address, create a new document
      newAddress.is_default = true;
      userAddress = new Address({ user_id: userId, address: [newAddress] });
    } else {
      // If the user already has an address, push the new address to the array
      userAddress.addresses.push(newAddress);
      // Check if there is only one address in the array
      if (userAddress.addresses.length === 1) {
        // If there is only one address, set it as the default
        userAddress.addresses[0].is_default = true;
      }
    }

    await userAddress.save(); // Save the updated address document
    console.log(userAddress, 'useraddress');

    res.redirect('/checkout');

  } catch (error) {
    console.log(error.message);
  }
};











const deleteAddress= async (req, res) => {
  try {
      const id = req.query.id;
      const userId = req.session.user_id;

      // Find the address with the specified address ID
      const address = await Address.findOne({ user_id: userId });

      // Find the deleted address and check if it is the default address
      const deletedAddress = address.addresses.find((addr) => addr._id.toString() === id);
      // console.log(deletedAddress, 'deletedAddress');
      const isDefaultAddress = deletedAddress && deletedAddress.is_default;
      // console.log(isDefaultAddress, 'isDefaultAddress');

      // Remove the address with the specified ID from the address array
      address.addresses = address.addresses.filter(addr => addr._id.toString() !== id);

      // If the deleted address was the default address, set the next available address as the new default
      if (isDefaultAddress && address.addresses.length > 0) {
          // Find the first non-deleted address and set it as the new default
          const newDefaultAddress = address.addresses.find(addr => addr._id.toString() !== id);
          if (newDefaultAddress) {
              newDefaultAddress.is_default = true;
          }
          // console.log(newDefaultAddress, 'newDefaultAddress');
      }

      // Save the updated address
      await address.save();
      res.redirect('/address');
  } catch (error) {
      throw new Error(error.message);
  }
}


const editAddress= async (req, res) => {
  try {
    
      const userId = req.session.user_id;
      const { _id, name, mobile, address, city, state, pincode } = req.body;

      // console.log(_id, 'id');
      // console.log(name, 'name');
      // console.log(mobile, 'mobile');
      // console.log(address, 'address');
      // console.log(city, 'city');
      // console.log(state, 'state');
      // console.log(pincode, 'pincode');   

      const updatedAddress = await Address.findOneAndUpdate (
          {  user_id: userId, 'addresses._id': _id },
        
          {
              $set: {
                  'addresses.$.name': name,
                  'addresses.$.mobile': mobile,
                  'addresses.$.address': address,
                  'addresses.$.city': city,
                  'addresses.$.state': state,
                  'addresses.$.pincode': pincode,
              }
          },
          { new: true }
      );
      // console.log(address._id,"addid");
      // console.log(userId,_id);
      // console.log(updatedAddress,"updated address.........................................................................................");

      if (updatedAddress) {
          // console.log('Address updated successfully:', updatedAddress);
          // Redirect or send a response indicating the update was successful
          res.redirect('/address');
      } else {
          // console.log('Address not found or not updated');
          // Redirect or send a response indicating the address was not found or not updated
          res.redirect('/address');
      }
  } catch (error) {
      // console.error('Error updating address:', error);
      // Handle the error appropriately
      res.redirect('/address');
  }
}




const loadCheckout= async (req, res) => {
  try {
    
      const userId = req.session.user_id;
      // console.log(userId, 'id');
      // Find the default address for the user
      const defaultAddress = await Address.findOne({ user_id: userId, 'addresses.is_default': true }, { 'addresses.$': 1 }).lean();

      // console.log(defaultAddress, 'default address');
      if(defaultAddress===null){
        res.redirect('/address')
       }else{

      

      // Find the user document and extract the address array
      const userDocument = await Address.findOne({ user_id: userId }).lean();
      const addressArray = userDocument.addresses;
      // console.log(addressArray, 'addressArray');

      // Filter the addresses where isDefault is false
      const filteredAddresses = addressArray.filter(address => !address.is_default);
      // console.log(filteredAddresses, 'filteredAddresses');

     


      // finding cart products //
    
      const cart = await Cart.findOne({ user_id: req.session.user_id })
          .populate({
              path: 'products.productId',
              populate: { path: 'category', select: 'category' },
          })
          .lean()

          .exec();

      const products = cart.products.map((product) => {
          const total =
              Number(product.quantity) * Number(product.productId.price);
          return {
              _id: product.productId._id.toString(),
              name: product.productId.name,
              category: product.productId.category.category, // Access the category field directly
              images: product.productId.images,
              price: product.productId.price,
              description: product.productId.description,
              quantity: product.quantity,
              total,
              user_id: req.session.user_id,

          };
      });

      const total = products.reduce(
          (sum, product) => sum + Number(product.total),
          0
      );
      let finalAmount = total;
      // Get the total count of products
      let totalCount = products.length;

      //coupon requested by user 
      let couponError=false;
      let couponApplied= false;

      if (req.session.couponInvalidError){
        couponError = req.session.couponInvalidError;

      }else if(req.session.couponApplied){

           couponApplied = req.session.couponApplied
        }

      //valid coupon check and discount amount calculation with the helper-coupon
      let couponDiscount = 0;
      const eligibleCoupon = await couponHelper.checkCurrentCouponValidityStatus(userId,finalAmount);

      if(eligibleCoupon.status){
        couponDiscount= eligibleCoupon.couponDiscount
      }else{
        couponDiscount=0;
      }
     

      finalAmount=finalAmount-couponDiscount

      res.render('users/checkout',
          {
              defaultAddress: defaultAddress.addresses[0],
              filteredAddresses: filteredAddresses,
              products,
              total,
              totalCount,
              couponApplied,
              couponError,
              couponDiscount,
              subtotal: finalAmount,
              // finalAmount,
          });
          delete req.session.couponApplied;
          delete req.session.couponInvalidError

        }

  } catch (error) {
      throw new Error(error.message);
  }
}



const changeAddress= async (req, res) => {
  try {

    
      const addressId = req.body.addressId;
      const userId = req.session.user_id;

      // Find the current default address and unset its "isDefault" flag
      await Address.findOneAndUpdate(
          { user_id: userId, 'addresses.is_default': true },
          { $set: { 'addresses.$.is_default': false } }
      );
      // console.log(defaultAddress,"old default address");


      // Set the selected address as the new default address
      const defaultAddress = await Address.findOneAndUpdate(
          { user_id: userId, 'addresses._id': addressId },
          { $set: { 'addresses.$.is_default': true } }
      );
      console.log(defaultAddress,"new Default address");

      res.redirect('/checkout')





  } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to set address as default' });
  }
}












// const placeOrder= async (req, res) => {
//   try {
//       const paymentMethod = req.body.paymentMethod;
//       console.log(paymentMethod, 'paymentMethod');

//       const orderData = req.body;
//            console.log("orderData",orderData);

//       const userId = req.session.user_id;
//       console.log(userId, 'id from placeOrderMeth');
      
//       const orderStatus = orderData['paymentMethod'] === "COD" ? "Placed" : "Pending";
//       console.log(orderStatus, "orderStatus");

//       // Find the default address for the user
//       const defaultAddress = await Address.findOne(
//           { user_id: userId, 'addresses.is_default': true },
//           { 'addresses.$': 1 }
//       ).lean();
//       console.log(defaultAddress, 'default address');

//       if (!defaultAddress) {
//           console.log('Default address not found');
//           return res.redirect('/address');
//       }

//       const productDetails = await Cart.findOne({ user_id: userId }).lean();
//       console.log(productDetails, 'productDetails');

//       // Calculate the new subtotal for all products in the cart
//       const subtotal = productDetails.products.reduce((acc, product) => {
//           return acc + product.total;
//       }, 0);

//       console.log(subtotal, 'subtotal');

//       const products = productDetails.products.map((product) => ({
//           productId: product.productId,
//           quantity: product.quantity,
//           total: product.total
//       }));
//       const defaultAddressDetails = defaultAddress.addresses[0];
//       const address = {
//           name: defaultAddressDetails.name,
//           mobile: defaultAddressDetails.mobile,
//           address: defaultAddressDetails.address,
//           city: defaultAddressDetails.city,
//           state: defaultAddressDetails.street,
//           pincode: defaultAddressDetails.pincode
//       };
//       console.log(address, 'address');

//       const orderDetails = new Order({
//           userId: userId,
//           date: Date(),
//           orderValue: subtotal,
//           paymentMethod: orderData['paymentMethod'],
//           orderStatus: orderStatus,
//           products: products,
//           addressDetails: address
//       });

//       const placedOrder = await orderDetails.save();

//       console.log(placedOrder, 'placedOrder');

//       // Remove the products from the cart
//       await Cart.deleteMany({ user_id: userId });

//       res.render('users/orderPlaced');
//   } catch (error) {
//       console.error(error);
//       res.redirect('/home');
//   }
// }



//place oreder

// const placeOrder= async (req, res) => {
//   try {
//     console.log("entered placed order routeeeee");
//     let userId = req.session.user_id;
//     let orderDetails = req.body;
//     console.log(orderDetails, "ordeerdetails have reached here");

//     let productsOrdered = await productHelper.getProductListForOrders(userId);
//     console.log(productsOrdered, "products that are ordered");

//     if (productsOrdered) {
//       let totalOrderValue = await productHelper.getCartValue(userId);
//       console.log(totalOrderValue, "this is the total order value");

//       productHelper.placingOrder(userId, orderDetails, productsOrdered, totalOrderValue).then((orderId) => {
//           console.log("successfully reached hereeeeeeeeee");
//           if (req.body["paymentMethod"] === "COD") {
//             console.log("cod_is true here");
//             res.json({ COD_CHECKOUT: true });
//           } else if (req.body["paymentMethod"] === "ONLINE") {
             
//             productHelper
//               .generateRazorpayOrder(orderId, totalOrderValue)
//               .then(async (razorpayOrderDetails) => {
//                 const user = await User.findById({ _id: userId }).lean();
//                 res.json({
//                   ONLINE_CHECKOUT: true,
//                   userDetails: user,
//                   userOrderRequestData: orderDetails,
//                   orderDetails: razorpayOrderDetails,
//                   razorpayKeyId: "rzp_test_vohNN97b9WnKIu",
//                 });
//               });
//           } else {
//             res.json({ paymentStatus: false });
//           }
//         });
//     } else {
//       res.json({ checkoutStatus: false });
     
//     }
//     console.log(checkoutStatus);
//   } catch (error) {
//     console.log(error.message);
//   }
// }


const placeOrder = async (req, res) => {
  try {
    console.log("entered placed order routeeeee");
    let userId = req.session.user_id;
    let orderDetails = req.body;
    console.log(orderDetails, "ordeerdetails have reached here");

    let productsOrdered = await productHelper.getProductListForOrders(userId);
    console.log(productsOrdered, "products that are ordered");

    if (productsOrdered) {
      let totalOrderValue = await productHelper.getCartValue(userId);
      console.log(totalOrderValue, "this is the total order value");

      const availableCouponData = await couponHelper.checkCurrentCouponValidityStatus(userId, totalOrderValue);
      if (availableCouponData.status) {
        const couponDiscountAmount = availableCouponData.couponDiscount;

        // Inserting the value of coupon discount into the order details object created above
        orderDetails.couponDiscount = couponDiscountAmount;

        // Updating the total order value with coupon discount applied
        totalOrderValue = totalOrderValue - couponDiscountAmount;

        const updateCouponUsedStatusResult = await couponHelper.updateCouponUsedStatus(userId, availableCouponData.couponId);
      }

      productHelper.placingOrder(userId, orderDetails, productsOrdered, totalOrderValue).then((orderId) => {
        console.log("successfully reached hereeeeeeeeee");
        if (req.body["paymentMethod"] === "COD") {
          console.log("cod_is true here");
          res.json({ COD_CHECKOUT: true });
        } else if (req.body["paymentMethod"] === "ONLINE") {

          productHelper
            .generateRazorpayOrder(orderId, totalOrderValue)
            .then(async (razorpayOrderDetails) => {
              const user = await User.findById({ _id: userId }).lean();
              res.json({
                ONLINE_CHECKOUT: true,
                userDetails: user,
                userOrderRequestData: orderDetails,
                orderDetails: razorpayOrderDetails,
                razorpayKeyId: "rzp_test_vohNN97b9WnKIu",
              });
            });
        } else {
          res.json({ paymentStatus: false });
        }
      });
    } else {
      res.json({ checkoutStatus: false });

    }
    console.log(checkoutStatus);
  } catch (error) {
    console.log(error.message);
  }
}


const orderPlaced = async (req, res) => {
  try {
      res.render('users/orderPlaced')
  } catch (error) {
      console.log(error.message);
  }
}


const orderFailed = async (req, res) => {
  try {
      res.render('users/orderFailed')
  } catch (error) {
      console.log(error.message);
  }
}

//verify payement
const verifyPayment = async (req, res) => {
  userHelpers.verifyOnlinePayment(req.body).then(() => {
      let receiptId = req.body['serverOrderDetails[receipt]'];

      let paymentSuccess = true;
      userHelpers.updateOnlineOrderPaymentStatus(receiptId, paymentSuccess).then(() => {
          // Sending the receiptId to the above userHelper to modify the order status in the DB
          // We have set the Receipt Id is same as the orders cart collection ID

          res.json({ status: true });
      })

  }).catch((err) => {
      if (err) {
          console.log(err);

          let paymentSuccess = false;
          userHelpers.updateOnlineOrderPaymentStatus(receiptId, paymentSuccess).then(() => {
              // Sending the receiptId to the above userHelper to modify the order status in the DB
              // We have set the Receipt Id is same as the orders cart collection ID

              res.json({ status: false });
          })
      }
  })
}




const orderDetails= async (req, res) => {
  try {
    console.log("entered into order details page..");
      const userId = req.session.user_id
      console.log(userId);
      const orderDetails = await Order.find({ userId: userId }).lean()
      orderHistory = orderDetails.map(history => {
          let createdOnIST = moment(history.date)
              .tz('Asia/kolkata')
              .format('DD-MM-YYYY h:mm A');

          return { ...history, date: createdOnIST };
      })

      console.log(orderDetails, 'orderDetails');

      res.render('users/ordersList', {  orderDetails: orderHistory });


  } catch (error) {
      throw new Error(error.message);
  }
}




const loadOrdersView = async (req, res) => {
  try {
      const orderId = req.query.id;
      
      const userId = req.session.user_id

      console.log(orderId, 'orderId when loading page');
      const order = await Order.findOne({ _id: orderId })
          .populate({
              path: 'products.productId',
              select: 'productname price images',
          })



      const createdOnIST = moment(order.date).tz('Asia/Kolkata').format('DD-MM-YYYY h:mm A');
      order.date = createdOnIST;

      const orderDetails = order.products.map(product => {
          const images = product.productId.images || []; // Set images to an empty array if it is undefined
          const image = images.length > 0 ? images[0] : ''; // Take the first image from the array if it exists

          return {
              name: product.productId.productname,
              image: images,
              price: product.productId.price,

              total: product.total,
              quantity: product.quantity,
              status : order.orderStatus,
             
          };
      });
      

      const deliveryAddress = {

        name: order.addressDetails.name,
        address: order.addressDetails.address,
        city: order.addressDetails.city,
        state: order.addressDetails.state,
        pincode: order.addressDetails.pincode,
    };

    const subtotal = order.orderValue;
    const cancellationStatus = order.cancellationStatus
    // console.log(cancellationStatus,'cancellationStatus');
   
    console.log(subtotal, 'subtotal');
    

    console.log(orderDetails, 'orderDetails');
    console.log(deliveryAddress, 'deliveryAddress');

    res.render('users/ordersView', {
        orderDetails: orderDetails,
        deliveryAddress: deliveryAddress,
        subtotal: subtotal,
       
        orderId: orderId,
        orderDate: createdOnIST,
        cancellationStatus:cancellationStatus,
       

    });
} catch (error) {
    throw new Error(error);
}
}


const cancelOrder = async (req, res) => {
  try {
    const id = req.body.orderId;
    const url = '/ordersView?id=' + id;

    const updateOrder = await Order.findByIdAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { orderStatus: "Cancel Requested..",  cancellationStatus: "cancellation requested" } },
      { new: true }
    ).exec();

    res.redirect(url);
  } catch (error) {
    console.log(error.message); 
  }
};


const undoCancel = async (req, res) => {
  try {
    const id = req.body.orderId;
    const url = '/ordersView?id=' + id;

    const updateOrder = await Order.findByIdAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { orderStatus: "Pending",  cancellationStatus: "Not Requested" } },
      { new: true }
    ).exec();

    res.redirect(url);
  } catch (error) {
    console.log(error.message); 
  }
};








 
const loadShopPage=async(req,res)=>{
  try {
    const userData = await User.findById({ _id: req.session.user_id});
    const productData = await Product.find({unlist:false}).lean();
    const categoryData = await categoryModel.find({unlist:false }).lean();

  res.render("users/shop", {
     user: userData,
    Product: productData,
    category: categoryData,
  });
  
  } catch (error) {
    console.log(error.messge);
  }
}










// const searchCategory = async (req, res) => {
//   try {
//     const categories = await userHelper.getCategory();
//     const products = await productHelpers.getAllProducts();
//     res.render('users/categorys-search', { categories, products,user:req.session.user });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// };

// const ListCategory = async (req, res) => {
//   try {
//     const catId = await userHelper.getCategoryByName(req.body.status);
//     const products = await userHelper.listCategorys(catId._id);
//     const categories = await userHelper.getCategory();
//     res.render('users/categorys-search', { products, categories });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// };







module.exports={
  loadSignup,
  insertUser,
  mailNotification,
  verifyMail,
  loginLoad,
  verifyLogin,
  loadHome,
  forgetLoad,
  forgetVerify,
  notifyForPassReset,
  forgetPasswordLoad,
  resetPassword,
  

   singleProductDetails,
  //  checkoutPage,

   getOtp,
  sendOtp,
  verifyOtp,

  mobilePage,
  aboutPage,
  userLogout,
  
  getCart,
   addToCart,
  changeQuantity,
  deleteProduct,
  blockUser,


  profilePage,
  editUser,
  
  loadAddress,
  addAddress,
 
  setAsDefault,
  addNewAddress,
  deleteAddress,
  editAddress,
  
 loadCheckout,
 placeOrder,
 orderPlaced,
 orderFailed,
 verifyPayment,
 changeAddress,

 
 orderDetails,
 loadOrdersView,
 cancelOrder,
 undoCancel,
 loadShopPage,
}

