
const User = require("../models/userModel")
const mongoose=require("mongoose")

const bcrypt=require('bcrypt')
const nodemailer= require('nodemailer')

const randomstring=require("randomstring")


const config=require('../config/config')
const { log } = require("handlebars/runtime")


const categoryModel = require("../models/categoryModel");
const Product=require("../models/productModel")

const accountSid = "ACa547f4ad75438fee11d6c1f2b5cc0a4a";
const authToken ="134aada0a6f8aeea3a9c3928db09a783";
const verifySid = "VAb65553a60d1c6c15f8fb69e14c75d2f9";
const client = require("twilio")(accountSid, authToken);
const Cart= require("../models/cartModel")




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



    if(userData){
      sendVerifyMail(req.body.name,req.body.email,userData._id)
      res.render('users/signup')
    }else{
      res.render('users/signup')
    }

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
     res.render('users/signup',)
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
   res.render('users/signup',{message:"Please Verify your Mail"})
   console.log("message printed")
      }else{
        req.session.user_id=userData._id
        res.redirect('/home')
      }

    }else{
      res.render('users/signup',{message:"Email and Password do not match"})
    }
   }else{
    res.render('users/signup',{message:"Email and Password do not match"})
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
       res.render('users/forget',{message:"Please Check your Mail to reset your password"})

       }
    }else{
      res.render('users/forget',{message:"User email is incorrect"})
    }
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
const sendOtp=(req,res)=>{
client.verify.v2
.services(verifySid)
.verifications.create({ to: "+916235095693", channel: "sms" })
.then((verification) => console.log(verification.status))
res.render('users/otpVerification')
}

const verifyOtp=(req,res)=>{
  otpCode=req.body.otp
  client.verify.v2
    .services(verifySid)
    .verificationChecks.create({ to: "+916235095693", code: otpCode })
    .then((verification_check) => console.log(verification_check.status))
  
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

const  profilePage=async(req,res)=>{
try{
 
   const userData=await User.findById({_id:req.session.user_id})
  res.render('users/profile',{
    user:userData
  })
}catch(error){
  console.log(error.message);
}
}




//user profile edit and update
const editProfile=async(req,res)=>{
  try {
    const id=req.query.id
    const userData = await User.findById(
      { _id:id });
      if(userData){
  res.render('users/edit',{user:userData})
      }else{
        res.redirect("/home");
      }

   

    
  } catch (error) {
    console.log(error.message);
  }
}



const updateProfile = async (req, res) => {
  try {
    const user_id = req.query.id; 

    if (req.file) {
      await User.findByIdAndUpdate({ _id: user_id }, {
        $set: { name: req.body.name, email: req.body.email, mobile: req.body.mobile }
      });
    } else {
      await User.findByIdAndUpdate({ _id: user_id }, {
        $set: { name: req.body.name, email: req.body.email, mobile: req.body.mobile }
      });
    }

    res.redirect('/home');
  } catch (error) {
    console.log(error.message);
  }
};











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
    console.log("entered loading cart page");
      const check = await Cart.findOne({ user_id: req.session.user_id });
    
        console.log("checking no 1", check, "this is cart");
        if (check) {
          const cart = await Cart.findOne({ user_id: req.session.user_id })
            .populate({
              path: "products.productId",
            })
            .lean()
            .exec();
          console.log(cart, "checking no 2");
          console.log("products", cart.products);
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
          console.log("passing products data is :", products);
    
          const total = products.reduce(
            (sum, product) => sum + Number(product.total),
            0
          );
          console.log(total,"total ");
    
          const finalAmount = total;
    
          // Get the total count of products
          const totalCount = products.length;
          console.log(totalCount);
          res.render("users/cart", {
            products,
            total,
            totalCount,
            subtotal: total,
            finalAmount,
          });
          console.log(products,total,totalCount,finalAmount);
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
            subtotal: subtotal
        };

        console.log(response);
        return res.json(response);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
};




    




var checkoutPage=async(req,res)=>{
  try{
    res.render('users/checkout')
  }catch(error){
    console.log(error.message);
  }
}

module.exports={
  loadSignup,
  insertUser,
  verifyMail,
  loginLoad,
  verifyLogin,
  loadHome,
  forgetLoad,
  forgetVerify,
  forgetPasswordLoad,
  resetPassword,
  


 
    profilePage,
    editProfile,
      updateProfile,

   singleProductDetails,
   checkoutPage,

   getOtp,
  sendOtp,
  verifyOtp,


  aboutPage,
  userLogout,
  
  getCart,
   addToCart,
  changeQuantity,
 
}

