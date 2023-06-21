
const User = require("../models/userModel")
const bcrypt=require('bcrypt')
const nodemailer= require('nodemailer')

const randomstring=require("randomstring")


const config=require('../config/config')
const { log } = require("handlebars/runtime")


const categoryModel = require("../models/categoryModel");
const Product=require("../models/productModel")



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



const productDetails = async(req,res)=>{
  try{
    res.render('users/quickview')
    
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
  productDetails,
  


  aboutPage,
  userLogout,
 
}

