import validator from 'validator';
import bcrypt from 'bcrypt';
import userModel from '../models/userModel.js';
import jwt from 'jsonwebtoken';
import doctorModel from '../models/doctorModel.js';
import appointmentModel from '../models/appointmentModel.js';

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
      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized: User ID not found" });
      }
  
      const userData = await userModel.findById(userId).select('-password');
      if (!userData) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
  
      console.log('Profile image path:', userData.image); // Debug log
      res.json({ success: true, userData });
    } catch (error) {
      console.log(error);
      res.json({ success: false, message: error.message });
    }
  };

 // API to update user profile
const updateProfile = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized: User ID not found" });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const { name, phone, address, dob, gender } = req.body;
    const imageFile = req.file;

    let parsedAddress = user.address;
    if (address) {
      try {
        parsedAddress = typeof address === 'string' ? JSON.parse(address) : address;
      } catch (error) {
        return res.json({ success: false, message: "Invalid address format" });
      }
    }

    let imagePath = user.image;
    if (imageFile) {
      imagePath = `/uploads/${imageFile.filename}`;
      console.log('Updated image path:', imagePath); // Debug log
    }

    const updatedData = {
      name: name || user.name,
      phone: phone || user.phone,
      address: parsedAddress,
      dob: dob || user.dob,
      gender: gender || user.gender,
      image: imagePath,
    };

    const updatedUser = await userModel.findByIdAndUpdate(userId, updatedData, { new: true }).select('-password');

    res.json({
      success: true,
      message: "Profile Updated",
      userData: updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to book appointment
const bookAppointment = async (req,res) => {
   try {

    const {userId, docId, slotDate, slotTime } = req.body

    const docData = await doctorModel.findById(docId).select('-password')

    if (!docData.available) {
        return res.json({success: false,message:'Doctor not available'})
    }

    let slots_booked = docData.slots_booked

    // checking for slot availability
    if (slots_booked[slotDate]) {
        if (slots_booked[slotDate].includes(slotTime)) {
            return res.json({success:false,message:'Slot not available'})
        } else {
          slots_booked[slotDate].push(slotTime)
        }
    } else {
        slots_booked[slotDate] = []
        slots_booked[slotDate].push(slotTime)
    }

    const userData = await userModel.findById(userId).select('-password')

    delete docData.slots_booked

    const appointmentData = {
        userId,
        docId,
        userData,
        docData,
        amount: docData.fees,
        slotTime,
        slotDate,
        date: Date.now()
    }

    const newAppointment = new appointmentModel(appointmentData)
    await newAppointment.save()

    // save new slots data in doctors data
    await doctorModel.findByIdAndUpdate(docId,{slots_booked})

    res.json({success:true,message:'Appointment booked'})

   } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
   }
}

   export { registerUser, loginUser, getProfile, updateProfile, bookAppointment };
