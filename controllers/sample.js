// //user-profile
// const loadUserProfile = async (req, res) => {
//     try {
//       const userId = new mongoose.Types.ObjectId(req.session.user_id);
//       console.log(userId, "user id.....");
//       const userData = await User.findOne({ _id: userId }).lean();
//       const defaultAddress = await Addresses.findOne(
//         { user_id: userId, "addresses.is_default": true },
//         { "address.$": 1 }
//       ).lean();
//       console.log(defaultAddress, "defaultAddress");
//       if (defaultAddress) {
//         res.render("users/profile", {
      
//           userData,
//           defaultAddress: defaultAddress.addresses,
//         });
//       } else {
//         res.render("users/user-profile", { layout: "user-layout", userData });
//       }
//     } catch (error) {
//       console.log(error.message);
//     }
//   };
//   // const addressList = async (req, res) => {};
  
//   const editUser = async (req, res) => {
//     const id = new mongoose.Types.ObjectId(req.session.user_id);
//     const userDate = await User.findById(id).lean();
//     console.log(userDate, "userdata......");
//     if (!userDate) {
//       throw new Error("user data not find");
//     }
//     let updatedUser = {
//       image: req.file.filename,
//       name: req.body.name,
//       email: req.body.email,
//       mobile: req.body.mobile,
//     };
//     console.log(updatedUser, "updated user");
//     if (req.file) {
//       updatedUser.image = req.file.filename;
//     }
//     const updatedUserData = await User.findByIdAndUpdate(
//       { _id: id },
//       { $set: updatedUser },
//       { new: true }
//     );
//     res.redirect("/user-profile");
//   };


//   const loadAddress = async (req, res) => {
//     try {
//       const userId = req.session.user_id;
//       const userAddress = await Addresses.findOne({ user_id: userId })
//         .lean()
//         .exec();
  
//       if (userAddress) {
//         if (userAddress.addresses.length === 1) {
//           userAddress.addresses[0].isDefault = true;
//         }
  
//         const addressDetails = userAddress.addresses.map((address) => {
//           return {
//             name: addresses.name,
  
//             address: addresses.address,
//             city: addresses.city,
//             state: addresses.state,
//             pincode: addresses.pincode,
//             _id: addresses._id,
//             isDefault: addresses.isDefault,
//           };
//         });
  
//         console.log(addressDetails, "addressdetails");
//         res.render("users/address", { layout: "user-layout", addressDetails });
//       } else {
//         res.render("users/address", {
//           layout: "user-layout",
//           addressDetails: [],
//         });
//       }
//     } catch (error) {
//       throw new Error(error.message);
//     }
//   };
  
//   //nec




//   const addressList = async (req, res) => {
//     try {
//       const userId = req.session.user_id;
  
//       const name = req.body.name;
  
//       const city = req.body.city;
//       const state = req.body.state;
//       const pincode = req.body.pincode;
//       const address = req.body.address;
//       console.log(name);
  
//       console.log(city);
//       console.log(state);
//       console.log(pincode);
//       const newAddress = {
//         name: name,
  
//         address: address,
//         city: city,
//         state: state,
//         pincode: pincode,
//         is_default: false,
//       };
  
//       let userAddress = await Addresses.findOne({ user_id: userId });
  
//       if (!userAddress) {
//         newAddress.is_default = true;
//         userAddress = new Addresses({ user_id: userId, addresses: [newAddress] });
//       } else {
//         userAddress.addresses.push(newAddress);
//         if (userAddress.addresses.length === 1) {
//           userAddress.addresses[0].is_default = true;
//         }
//       }
  
//       await userAddress.save();
//       console.log(userAddress, "useraddress");
  
//       res.redirect("/address");
//     } catch (error) {
//       throw new Error(error.message);
//     }
//   };
















  

// // editingUserProfile: async (req, res) => {
// //   try {
// //       console.log(req.files, 'userimage');
// //       const id = new mongoose.Types.ObjectId(req.session.user_id);
// //       const userData = await User.findById({ _id: id }).lean();

// //       if (!userData) {
// //           throw new Error('User data not found');
// //       }

// //       let updatedUserData = {
// //           image: userData.image, // Use the previous image data as the starting point
// //           name: req.body.name,
// //           email: req.body.email,
// //           mobile: req.body.mobile
// //       };
// //       if (req.file) {
// //           // Check if a new image file is uploaded
// //           updatedUserData.image = req.file.filename; // Update with the new image filename
// //       }

// //       const updatedUser = await User.findByIdAndUpdate({ _id: id }, { $set: updatedUserData }, { new: true });
// //       res.redirect('/user-profile');
// //   } catch (error) {
// //       throw new Error(error.message);
// //   }
// // },

// // loadAddressList: async (req, res) => {
// //   try {
// //       const userId = req.session.user_id;
// //       const userAddress = await Address.findOne({ user_id: userId }).lean().exec();

// //       if (userAddress) {
// //           // Check if there is only one address in the array
// //           if (userAddress.address.length === 1) {
// //               // If there is only one address, set it as the default
// //               userAddress.address[0].isDefault = true;
// //           }

// //           const addressDetails = userAddress.address.map((address) => {
// //               return {
// //                   name: address.name,
// //                   mobile: address.mobile,
// //                   homeAddress: address.homeAddress,
// //                   city: address.city,
// //                   street: address.street,
// //                   postalCode: address.postalCode,
// //                   _id: address._id,
// //                   isDefault: address.isDefault
// //               };
// //           });

// //           console.log(addressDetails, 'addressdetails');
// //           res.render('users/address', { layout: 'user-layout', addressDetails });
// //       } else {
// //           res.render('users/address', { layout: 'user-layout', addressDetails: [] });
// //       }
// //   } catch (error) {
// //       throw new Error(error.message);
// //   }
// // },


// // addingAddress: async (req, res) => {
// //   try {
// //       const userId = req.session.user_id
// //       const { name, mobile, homeAddress, city, street, postalCode } = req.body;
// //       console.log(name);
// //       console.log(mobile);

// //       console.log(city);
// //       console.log(street);
// //       console.log(postalCode);
// //       const newAddress = {
// //           name: name,
// //           mobile: mobile,
// //           homeAddress: homeAddress,
// //           city: city,
// //           street: street,
// //           postalCode: postalCode,
// //           isDefault: false, // Set the default flag to false by default
// //       };

// //       // Find the user's address document based on the user_id
// //       let userAddress = await Address.findOne({ user_id: userId });

// //       if (!userAddress) {
// //           // If the user doesn't have any address, create a new document
// //           newAddress.isDefault = true;
// //           userAddress = new Address({ user_id: userId, address: [newAddress] });
// //       } else {
// //           // If the user already has an address, push the new address to the array
// //           userAddress.address.push(newAddress);
// //           // Check if there is only one address in the array
// //           if (userAddress.address.length === 1) {
// //               // If there is only one address, set it as the default
// //               userAddress.address[0].isDefault = true;
// //           }
// //       }

// //       await userAddress.save(); // Save the updated address document
// //       console.log(userAddress, 'useraddress');

// //       res.redirect('/address');

// //   } catch (error) {
// //       throw new Error(error.message);
// //   }
// // },

// // addingNewAddress: async (req, res) => {
// //   try {
// //       const userId = req.session.user_id
// //       const { name, mobile, homeAddress, city, street, postalCode } = req.body;
// //       console.log(name);
// //       console.log(mobile);

// //       console.log(city);
// //       console.log(street);
// //       console.log(postalCode);
// //       const newAddress = {
// //           name: name,
// //           mobile: mobile,
// //           homeAddress: homeAddress,
// //           city: city,
// //           street: street,
// //           postalCode: postalCode,
// //           isDefault: false, // Set the default flag to false by default
// //       };

// //       // Find the user's address document based on the user_id
// //       let userAddress = await Address.findOne({ user_id: userId });

// //       if (!userAddress) {
// //           // If the user doesn't have any address, create a new document
// //           newAddress.isDefault = true;
// //           userAddress = new Address({ user_id: userId, address: [newAddress] });
// //       } else {
// //           // If the user already has an address, push the new address to the array
// //           userAddress.address.push(newAddress);
// //           // Check if there is only one address in the array
// //           if (userAddress.address.length === 1) {
// //               // If there is only one address, set it as the default
// //               userAddress.address[0].isDefault = true;
// //           }
// //       }

// //       await userAddress.save(); // Save the updated address document
// //       console.log(userAddress, 'useraddress');

// //       res.redirect('/checkout');

// //   } catch (error) {
// //       throw new Error(error.message);
// //   }
// // },

// // deletingAddress: async (req, res) => {
// //   try {
// //       const id = req.query.id;
// //       const userId = req.session.user_id;

// //       // Find the address with the specified address ID
// //       const address = await Address.findOne({ user_id: userId });

// //       // Find the deleted address and check if it is the default address
// //       const deletedAddress = address.address.find((addr) => addr._id.toString() === id);
// //       console.log(deletedAddress, 'deletedAddress');
// //       const isDefaultAddress = deletedAddress && deletedAddress.isDefault;
// //       console.log(isDefaultAddress, 'isDefaultAddress');

// //       // Remove the address with the specified ID from the address array
// //       address.address = address.address.filter(addr => addr._id.toString() !== id);

// //       // If the deleted address was the default address, set the next available address as the new default
// //       if (isDefaultAddress && address.address.length > 0) {
// //           // Find the first non-deleted address and set it as the new default
// //           const newDefaultAddress = address.address.find(addr => addr._id.toString() !== id);
// //           if (newDefaultAddress) {
// //               newDefaultAddress.isDefault = true;
// //           }
// //           console.log(newDefaultAddress, 'newDefaultAddress');
// //       }

// //       // Save the updated address
// //       await address.save();
// //       res.redirect('/address');
// //   } catch (error) {
// //       throw new Error(error.message);
// //   }
// // },

// // editingAddress: async (req, res) => {
// //   try {
// //       const userId = req.session.user_id;
// //       const { _id, name, mobile, homeAddress, city, street, postalCode } = req.body;
// //       console.log(_id, 'id');
// //       console.log(name, 'name');
// //       console.log(mobile, 'mobile');
// //       console.log(homeAddress, 'homeAddress');
// //       console.log(city, 'city');
// //       console.log(street, 'street');
// //       console.log(postalCode, 'postalCode');

// //       const updatedAddress = await Address.findOneAndUpdate(
// //           { user_id: userId, 'address._id': _id },
// //           {
// //               $set: {
// //                   'address.$.name': name,
// //                   'address.$.mobile': mobile,
// //                   'address.$.homeAddress': homeAddress,
// //                   'address.$.city': city,
// //                   'address.$.street': street,
// //                   'address.$.postalCode': postalCode
// //               }
// //           },
// //           { new: true }
// //       );

// //       if (updatedAddress) {
// //           console.log('Address updated successfully:', updatedAddress);
// //           // Redirect or send a response indicating the update was successful
// //           res.redirect('/address');
// //       } else {
// //           console.log('Address not found or not updated');
// //           // Redirect or send a response indicating the address was not found or not updated
// //           res.redirect('/address');
// //       }
// //   } catch (error) {
// //       console.error('Error updating address:', error);
// //       // Handle the error appropriately
// //       res.redirect('/address');
// //   }
// // },

// // settingAsDefault: async (req, res) => {
// //   try {
// //       const addressId = req.body.addressId;
// //       const userId = req.session.user_id;

// //       // Find the current default address and unset its "isDefault" flag
// //       await Address.findOneAndUpdate(
// //           { user_id: userId, 'address.isDefault': true },
// //           { $set: { 'address.$.isDefault': false } }
// //       );

// //       // Set the selected address as the new default address
// //       const defaultAddress = await Address.findOneAndUpdate(
// //           { user_id: userId, 'address._id': addressId },
// //           { $set: { 'address.$.isDefault': true } }
// //       );

// //       const response = {
// //           setDefault: true
// //       }

// //       return response

// //   } catch (error) {
// //       res.status(500).json({ success: false, message: 'Failed to set address as default' });
// //   }
// // },










// loadingCheckoutPage: async (req, res) => {
//   try {
//       const userId = req.session.user_id;
//       console.log(userId, 'id');
//       // Find the default address for the user
//       const defaultAddress = await Address.findOne({ user_id: userId, 'address.isDefault': true }, { 'address.$': 1 }).lean();

//       console.log(defaultAddress, 'default address');

//       // Find the user document and extract the address array
//       const userDocument = await Address.findOne({ user_id: userId }).lean();
//       const addressArray = userDocument.address;
//       console.log(addressArray, 'addressArray');

//       // Filter the addresses where isDefault is false
//       const filteredAddresses = addressArray.filter(address => !address.isDefault);
//       console.log(filteredAddresses, 'filteredAddresses');


//       // finding cart products //

//       const cart = await Cart.findOne({ user_id: req.session.user_id })
//           .populate({
//               path: 'products.productId',
//               populate: { path: 'category', select: 'category' },
//           })
//           .lean()
//           .exec();

//       const products = cart.products.map((product) => {
//           const total =
//               Number(product.quantity) * Number(product.productId.price);
//           return {
//               _id: product.productId._id.toString(),
//               name: product.productId.name,
//               category: product.productId.category.category, // Access the category field directly
//               image: product.productId.image,
//               price: product.productId.price,
//               description: product.productId.description,
//               quantity: product.quantity,
//               total,
//               user_id: req.session.user_id,

//           };
//       });

//       const total = products.reduce(
//           (sum, product) => sum + Number(product.total),
//           0
//       );
//       const finalAmount = total;
//       // Get the total count of products
//       const totalCount = products.length;


//       res.render('users/checkout',
//           {
//               layout: 'user-layout',
//               defaultAddress: defaultAddress.address[0],
//               filteredAddresses: filteredAddresses,
//               products,
//               total,
//               totalCount,
//               subtotal: total,
//               finalAmount,
//           });



//   } catch (error) {
//       throw new Error(error.message);
//   }
// },









// const Cart = require("../models/cartModel");
// const Product = require("../models/productModels");
// const Addresses = require("../models/addressesModel");
// const mongoose = require("mongoose");
// const Order = require("../models/orderModel");

// module.exports = {
//   submitCheckout: async (req, res) => {
//     try {
//       console.log("entered checkout page");

//       const userId = req.session.user_id;
//       console.log(userId, "userid");
//       console.log("FIND THE CART DETAILS");

//       const cartData = await Cart.findOne({ User_id: userId }).lean();
//       console.log(cartData, "cart data has been fetched successfully");

//       console.log(req.body, "all req body");
//       const paymentMethod = req.body.paymentMethod;

//       console.log(paymentMethod, "paymentmethod");
//       const status = paymentMethod === "COD" ? "PENDING" : "PAYED";

//       console.log(status, "the status of payment");

//       const addressData = await Addresses.findOne(
//         { user_id: userId, "addresses.is_default": true },
//         { "addresses.$": 1 }
//       ).lean();
//       console.log(addressData, "address data is this");

//       if (!addressData) {
//         return res.status(400).json({ error: "Default address not found." });
//       }
//       const subtotal = cartData.products.reduce((acc, product) => {
//         return acc + product.total;
//       }, 0);
//       console.log(subtotal, "subtotal");

//       const products = cartData.products.map((product) => ({
//         productId: product.productId,
//         quantity: product.quantity,
//         total: product.total,
//       }));
//       console.log(products, "products loading");
//       const defaultAddress = addressData.addresses[0];
//       const address = {
//         name: defaultAddress.name,
//         mobile: defaultAddress.mobile,
//         address: defaultAddress.address,
//         city: defaultAddress.city,
//         state: defaultAddress.state,
//         pincode: defaultAddress.pincode,
//       };

//       console.log(address, "setting the defaulf address");

//       const newOrder = new Order({
//         userId: userId,
//         date: Date(),
//         orderValue: subtotal,
//         paymentMethod: paymentMethod,
//         orderStatus: status,
//         products: products,
//         addressDetails: address,
//       });
//       const savedOrder = await newOrder.save();
//       console.log(savedOrder, "saved to data base");
//       await Cart.findOneAndDelete({ User_id: userId });
//       res.render("users/order-sucessfull", {
//         layout: "user-layout",
//         savedOrder,
//       });
//     } catch (error) {
//       console.log(error.message);
//     }
//   },
// };