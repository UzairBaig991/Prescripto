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
// import validator from 'validator';
// import bcrypt from 'bcrypt';
// import userModel from '../models/userModel.js';
// import jwt from 'jsonwebtoken';

// // Base URL for the server (can be moved to .env if needed)
// const BASE_URL = process.env.BASE_URL || 'http://localhost:4000';

// // API to register user
// const registerUser = async (req, res) => {
//   try {
//     const { name, email, password } = req.body;

//     if (!name || !password || !email) {
//       return res.json({ success: false, message: "Missing Details" });
//     }

//     // validating email format
//     if (!validator.isEmail(email)) {
//       return res.json({ success: false, message: "enter a valid email" });
//     }

//     // validating strong password
//     if (password.length < 8) {
//       return res.json({ success: false, message: "enter a strong password" });
//     }

//     // hashing user password
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);

//     const userData = {
//       name,
//       email,
//       password: hashedPassword
//     };

//     const newUser = new userModel(userData);
//     const user = await newUser.save();

//     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

//     res.json({ success: true, token });
//   } catch (error) {
//     console.log(error);
//     res.json({ success: false, message: error.message });
//   }
// };

// // API for user login
// const loginUser = async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     const user = await userModel.findOne({ email });

//     if (!user) {
//       return res.json({ success: false, message: "User does not exist" });
//     }

//     const isMatch = await bcrypt.compare(password, user.password);

//     if (isMatch) {
//       const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
//       res.json({ success: true, token });
//     } else {
//       res.json({ success: false, message: "Invalid credentials" });
//     }
//   } catch (error) {
//     console.log(error);
//     res.json({ success: false, message: error.message });
//   }
// };

// // API to get user profile data
// const getProfile = async (req, res) => {
//   try {
//     const userId = req.userId; // Use req.userId from authUser middleware
//     if (!userId) {
//       return res.status(401).json({ success: false, message: "Unauthorized: User ID not found" });
//     }

//     const userData = await userModel.findById(userId).select('-password');
//     if (!userData) {
//       return res.status(404).json({ success: false, message: "User not found" });
//     }

//     // Prepend BASE_URL to the image path if it exists
//     if (userData.image) {
//       userData.image = `${BASE_URL}${userData.image}`;
//     }

//     res.json({ success: true, userData });
//   } catch (error) {
//     console.log(error);
//     res.json({ success: false, message: error.message });
//   }
// };

// // API to update user profile
// const updateProfile = async (req, res) => {
//   try {
//     // Get user ID from authUser middleware
//     const userId = req.userId;
//     if (!userId) {
//       return res.status(401).json({ success: false, message: "Unauthorized: User ID not found" });
//     }

//     // Find the user
//     const user = await userModel.findById(userId);
//     if (!user) {
//       return res.status(404).json({ success: false, message: "User not found" });
//     }

//     // Extract fields to update
//     const { name, phone, address, dob, gender } = req.body;
//     const imageFile = req.file;

//     // Parse address safely
//     let parsedAddress = user.address;
//     if (address) {
//       try {
//         parsedAddress = typeof address === 'string' ? JSON.parse(address) : address;
//       } catch (error) {
//         return res.json({ success: false, message: "Invalid address format" });
//       }
//     }

//     // Handle image upload if provided
//     let imagePath = user.image;
//     if (imageFile) {
//       // Store the image path (relative to /uploads)
//       imagePath = `/uploads/${imageFile.filename}`;
//     }

//     // Prepare updated data (allow partial updates)
//     const updatedData = {
//       name: name || user.name,
//       phone: phone || user.phone,
//       address: parsedAddress,
//       dob: dob || user.dob,
//       gender: gender || user.gender,
//       image: imagePath
//     };

//     // Update user in a single operation
//     const updatedUser = await userModel.findByIdAndUpdate(userId, updatedData, { new: true }).select('-password');

//     // Prepend BASE_URL to the image path if it exists
//     if (updatedUser.image) {
//       updatedUser.image = `${BASE_URL}${updatedUser.image}`;
//     }

//     res.json({
//       success: true,
//       message: "Profile Updated",
//       userData: updatedUser
//     });
//   } catch (error) {
//     console.log(error);
//     res.json({ success: false, message: error.message });
//   }
// };

// export { registerUser, loginUser, getProfile, updateProfile };
// import validator from 'validator';
// import bcrypt from 'bcrypt';
// import userModel from '../models/userModel.js';
// import jwt from 'jsonwebtoken';
// import formidable from 'formidable';
// import path from 'path';
// import fs from 'fs';

// // Base URL for the server (can be moved to .env if needed)
// const BASE_URL = process.env.BASE_URL || 'http://localhost:4000';

// // API to register user
// const registerUser = async (req, res) => {
//   try {
//     const { name, email, password } = req.body;

//     if (!name || !password || !email) {
//       return res.json({ success: false, message: "Missing Details" });
//     }

//     // validating email format
//     if (!validator.isEmail(email)) {
//       return res.json({ success: false, message: "enter a valid email" });
//     }

//     // validating strong password
//     if (password.length < 8) {
//       return res.json({ success: false, message: "enter a strong password" });
//     }

//     // hashing user password
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);

//     const userData = {
//       name,
//       email,
//       password: hashedPassword
//     };

//     const newUser = new userModel(userData);
//     const user = await newUser.save();

//     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

//     res.json({ success: true, token });
//   } catch (error) {
//     console.log('RegisterUser Error:', error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // API for user login
// const loginUser = async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     const user = await userModel.findOne({ email });

//     if (!user) {
//       return res.json({ success: false, message: "User does not exist" });
//     }

//     const isMatch = await bcrypt.compare(password, user.password);

//     if (isMatch) {
//       const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
//       res.json({ success: true, token });
//     } else {
//       res.json({ success: false, message: "Invalid credentials" });
//     }
//   } catch (error) {
//     console.log('LoginUser Error:', error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // API to get user profile data
// const getProfile = async (req, res) => {
//   try {
//     const userId = req.userId; // Use req.userId from authUser middleware
//     if (!userId) {
//       return res.status(401).json({ success: false, message: "Unauthorized: User ID not found" });
//     }

//     const userData = await userModel.findById(userId).select('-password');
//     if (!userData) {
//       return res.status(404).json({ success: false, message: "User not found" });
//     }

//     // Prepend BASE_URL to the image path if it exists
//     if (userData.image) {
//       userData.image = `${BASE_URL}${userData.image}`;
//     }

//     res.json({ success: true, userData });
//   } catch (error) {
//     console.log('GetProfile Error:', error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // API to update user profile
// const updateProfile = async (req, res) => {
//   try {
//     console.log('Starting updateProfile...');

//     // Get user ID from authUser middleware
//     const userId = req.userId;
//     console.log('User ID:', userId);
//     if (!userId) {
//       return res.status(401).json({ success: false, message: "Unauthorized: User ID not found" });
//     }

//     // Find the user
//     const user = await userModel.findById(userId);
//     console.log('Found user:', user);
//     if (!user) {
//       return res.status(404).json({ success: false, message: "User not found" });
//     }

//     // Use formidable to parse the multipart form data
//     const form = new formidable.IncomingForm({
//       uploadDir: path.join(process.cwd(), 'uploads'),
//       keepExtensions: true,
//       maxFileSize: 10 * 1024 * 1024, // 10MB limit
//       allowEmptyFiles: false,
//       filter: ({ mimetype }) => {
//         const isImage = mimetype && mimetype.startsWith('image/');
//         console.log('Formidable filter - mimetype:', mimetype, 'isImage:', isImage);
//         return isImage;
//       }
//     });

//     console.log('Parsing form data...');
//     const [fields, files] = await form.parse(req);
//     console.log('Form parsing completed.');

//     // Extract fields from the form
//     const name = fields.name?.[0];
//     const phone = fields.phone?.[0];
//     const addressRaw = fields.address?.[0];
//     const dob = fields.dob?.[0];
//     const gender = fields.gender?.[0];
//     const imageFile = files.image?.[0];

//     console.log('Parsed fields:', { name, phone, addressRaw, dob, gender });
//     console.log('Parsed files:', imageFile);

//     // Validate required fields
//     if (!name || !phone || !addressRaw || !dob || !gender) {
//       return res.status(400).json({ success: false, message: "Missing required fields: name, phone, address, dob, and gender are required" });
//     }

//     // Parse address safely
//     let parsedAddress = user.address || {};
//     if (addressRaw) {
//       console.log('Parsing address:', addressRaw);
//       try {
//         parsedAddress = JSON.parse(addressRaw);
//         if (!parsedAddress.line1 || !parsedAddress.line2) {
//           return res.status(400).json({ success: false, message: "Address must include line1 and line2" });
//         }
//       } catch (error) {
//         console.log('Address parsing error:', error);
//         return res.status(400).json({ success: false, message: "Invalid address format: " + error.message });
//       }
//     }

//     // Handle image upload if provided
//     let imagePath = user.image;
//     if (imageFile) {
//       console.log('Processing image upload...');
//       const newPath = `/uploads/${Date.now()}_${imageFile.originalFilename}`;
//       const absolutePath = path.join(process.cwd(), newPath);
//       try {
//         fs.renameSync(imageFile.filepath, absolutePath);
//         imagePath = newPath;
//         console.log('Image saved to:', imagePath);
//       } catch (error) {
//         console.log('Image save error:', error);
//         return res.status(500).json({ success: false, message: "Failed to save image: " + error.message });
//       }
//     }

//     // Prepare updated data (allow partial updates)
//     const updatedData = {
//       name: name || user.name,
//       phone: phone || user.phone,
//       address: parsedAddress,
//       dob: dob || user.dob,
//       gender: gender || user.gender,
//       image: imagePath
//     };

//     console.log('Prepared updated data:', updatedData);

//     // Update user in a single operation
//     console.log('Updating user in database...');
//     const updatedUser = await userModel.findByIdAndUpdate(userId, updatedData, { new: true }).select('-password');
//     console.log('Updated user:', updatedUser);

//     if (!updatedUser) {
//       return res.status(500).json({ success: false, message: "Failed to update user in database" });
//     }

//     // Prepend BASE_URL to the image path if it exists
//     if (updatedUser.image) {
//       updatedUser.image = `${BASE_URL}${updatedUser.image}`;
//     }

//     console.log('Sending response...');
//     res.json({
//       success: true,
//       message: "Profile Updated",
//       userData: updatedUser
//     });
//   } catch (error) {
//     console.log('UpdateProfile Error:', error);
//     res.status(500).json({ success: false, message: `UpdateProfile failed: ${error.message}` });
//   }
// };

// export { registerUser, loginUser, getProfile, updateProfile };