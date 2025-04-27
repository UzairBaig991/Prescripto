// import validator from 'validator'
// import bcrypt from 'bcrypt'
// import userModel from '../models/userModel.js'
// import jwt from 'jsonwebtoken'
// import {v2 as cloudinary} from 'cloudinary'


// // API to register user
// const registerUser = async (req, res) => {

//     try {

//         const { name, email, password } = req.body

//         if (!name || !password || !email) {
//             return res.json({ success: false, message: "Missing Details" })
//         }

//         // validating email format
//         if (!validator.isEmail(email)) {
//             return res.json({ success: false, message: "enter a valid email" })
//         }

//         // validating strong password
//         if (password.length < 8) {
//             return res.json({ success: false, message: "enter a strong password" })
//         }

//         // hashing user password
//         const salt = await bcrypt.genSalt(10)
//         const hashedPassword = await bcrypt.hash(password, salt)

//         const userData = {
//             name,
//             email,
//             password: hashedPassword
//         }

//         const newUser = new userModel(userData)
//         const user = await newUser.save()

//         const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)

//         res.json({ sucess: true, token })

//     } catch (error) {
//         console.log(error)
//         res.json({ success: false, message: error.message })
//     }
// }

// // API for user login
// const loginUser = async (req, res) => {
//     try {

//         const { email, password } = req.body
//         const user = await userModel.findOne({ email })

//         if (!user) {
//             return res.json({ success: false, message: "User does not exist" })
//         }

//         const isMatch = await bcrypt.compare(password, user.password)

//         if (isMatch) {
//             const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
//             res.json({ success: true, token })
//         } else {
//             res.json({ success: false, message: "Invalid credentials" })
//         }

//     } catch (error) {
//         console.log(error)
//         res.json({ success: false, message: error.message })
//     }


// }

// // API to get user profile data
// const getProfile = async (req, res) => {

//     try {

//         const { userId } = req.body
//         const userData = await userModel.findById(userId).select('-password')

//         res.json({ success: true, userData })

//     } catch (error) {
//         console.log(error)
//         res.json({ success: false, message: error.message })
//     }
// }

// // API to update user profile
// const updateProfile = async (req, res) => {
//     try {

//         const { userId, name, phone, address, dob, gender } = req.body
//         const imageFile = req.file

//         if (!name || !phone || !dob || !gender) {
//             return res.json({ success: false, message: "Data Missing" })
//         }

//         await userModel.findByIdAndUpdate(userId, { name, phone, address: JSON.parse(address), dob, gender })

//         if(imageFile) {

//             // upload image to cloudinary
//             const imageUpload = await cloudinary.uploader.upload(imageFile.path,{resource_type:'image'})
//             const imageUrl = imageUpload.secure_url

//             await userModel.fingByIdAndUpdate(userId,{image:imageUrl})
//         }
//         res.json({success:true,message:"Profile Updated"})

//     } catch (error) {
//         console.log(error)
//         res.json({ success: false, message: error.message })
//     }

// }


// export { registerUser, loginUser, getProfile, updateProfile }
import validator from 'validator';
import bcrypt from 'bcrypt';
import userModel from '../models/userModel.js';
import jwt from 'jsonwebtoken';

   // API to register user
   const registerUser = async (req, res) => {
     try {
       const { name, email, password } = req.body;

       if (!name || !password || !email) {
         return res.json({ success: false, message: "Missing Details" });
       }

       // validating email format
       if (!validator.isEmail(email)) {
         return res.json({ success: false, message: "enter a valid email" });
       }

       // validating strong password
       if (password.length < 8) {
         return res.json({ success: false, message: "enter a strong password" });
       }

       // hashing user password
       const salt = await bcrypt.genSalt(10);
       const hashedPassword = await bcrypt.hash(password, salt);

       const userData = {
         name,
         email,
         password: hashedPassword
       };

       const newUser = new userModel(userData);
       const user = await newUser.save();

       const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

       res.json({ success: true, token });
     } catch (error) {
       console.log(error);
       res.json({ success: false, message: error.message });
     }
   };

   // API for user login
   const loginUser = async (req, res) => {
     try {
       const { email, password } = req.body;
       const user = await userModel.findOne({ email });

       if (!user) {
         return res.json({ success: false, message: "User does not exist" });
       }

       const isMatch = await bcrypt.compare(password, user.password);

       if (isMatch) {
         const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
         res.json({ success: true, token });
       } else {
         res.json({ success: false, message: "Invalid credentials" });
       }
     } catch (error) {
       console.log(error);
       res.json({ success: false, message: error.message });
     }
   };

   // API to get user profile data
   const getProfile = async (req, res) => {
     try {
       const userId = req.userId; // Use req.userId from authUser middleware
       if (!userId) {
         return res.status(401).json({ success: false, message: "Unauthorized: User ID not found" });
       }

       const userData = await userModel.findById(userId).select('-password');
       if (!userData) {
         return res.status(404).json({ success: false, message: "User not found" });
       }

       res.json({ success: true, userData });
     } catch (error) {
       console.log(error);
       res.json({ success: false, message: error.message });
     }
   };

   // API to update user profile
   const updateProfile = async (req, res) => {
     try {
       // Get user ID from authUser middleware
       const userId = req.userId;
       if (!userId) {
         return res.status(401).json({ success: false, message: "Unauthorized: User ID not found" });
       }

       // Find the user
       const user = await userModel.findById(userId);
       if (!user) {
         return res.status(404).json({ success: false, message: "User not found" });
       }

       // Extract fields to update
       const { name, phone, address, dob, gender } = req.body;
       const imageFile = req.file;

       // Parse address safely
       let parsedAddress = user.address;
       if (address) {
         try {
           parsedAddress = typeof address === 'string' ? JSON.parse(address) : address;
         } catch (error) {
           return res.json({ success: false, message: "Invalid address format" });
         }
       }

       // Handle image upload if provided
       let imagePath = user.image;
       if (imageFile) {
         // Store the image path (relative to /uploads)
         imagePath = `/uploads/${imageFile.filename}`;
       }

       // Prepare updated data (allow partial updates)
       const updatedData = {
         name: name || user.name,
         phone: phone || user.phone,
         address: parsedAddress,
         dob: dob || user.dob,
         gender: gender || user.gender,
         image: imagePath
       };

       // Update user in a single operation
       const updatedUser = await userModel.findByIdAndUpdate(userId, updatedData, { new: true }).select('-password');

       res.json({
         success: true,
         message: "Profile Updated",
         userData: updatedUser
       });
     } catch (error) {
       console.log(error);
       res.json({ success: false, message: error.message });
     }
   };

   export { registerUser, loginUser, getProfile, updateProfile };