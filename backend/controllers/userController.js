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

    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "enter a valid email" });
    }

    if (password.length < 8) {
      return res.json({ success: false, message: "enter a strong password" });
    }

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

    console.log('Profile image path:', userData.image);
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
      console.log('Updated image path:', imagePath);
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
const bookAppointment = async (req, res) => {
  try {
    const { userId, docId, slotDate, slotTime } = req.body;

    const docData = await doctorModel.findById(docId).select('-password');

    if (!docData.available) {
      return res.json({ success: false, message: 'Doctor not available' });
    }

    let slots_booked = docData.slots_booked;

    if (slots_booked[slotDate]) {
      if (slots_booked[slotDate].includes(slotTime)) {
        return res.json({ success: false, message: 'Slot not available' });
      } else {
        slots_booked[slotDate].push(slotTime);
      }
    } else {
      slots_booked[slotDate] = [];
      slots_booked[slotDate].push(slotTime);
    }

    const userData = await userModel.findById(req.userId).select('-password');

    delete docData.slots_booked;

    const appointmentData = {
      userId: req.userId,
      docId,
      userData,
      docData,
      amount: docData.fees,
      slotTime,
      slotDate,
      date: Date.now(),
    };

    const newAppointment = new appointmentModel(appointmentData);
    await newAppointment.save();

    await doctorModel.findByIdAndUpdate(docId, { slots_booked });

    res.json({ success: true, message: 'Appointment booked' });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get user's appointments
const getUserAppointments = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized: User ID not found" });
    }

    const appointments = await appointmentModel.find({ userId, cancelled: false, isCompleted: false });
    res.json({ success: true, appointments });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to cancel appointment
const cancelAppointment = async (req, res) => {
  try {
    const { appointmentId, slotDate, slotTime } = req.body;
    const appointment = await appointmentModel.findById(appointmentId);

    if (!appointment) {
      return res.json({ success: false, message: 'Appointment not found' });
    }

    if (appointment.cancelled) {
      return res.json({ success: false, message: 'Appointment already cancelled' });
    }

    appointment.cancelled = true;
    await appointment.save();

    const docData = await doctorModel.findById(appointment.docId);
    let slots_booked = docData.slots_booked;

    if (slots_booked[slotDate]) {
      const slotIndex = slots_booked[slotDate].indexOf(slotTime);
      if (slotIndex > -1) {
        slots_booked[slotDate].splice(slotIndex, 1);
        if (slots_booked[slotDate].length === 0) {
          delete slots_booked[slotDate];
        }
        await doctorModel.findByIdAndUpdate(appointment.docId, { slots_booked });
      }
    }

    res.json({ success: true, message: 'Appointment cancelled successfully' });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to process payment (mock implementation)
const payAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const appointment = await appointmentModel.findById(appointmentId);

    if (!appointment) {
      return res.json({ success: false, message: 'Appointment not found' });
    }

    if (appointment.payment) {
      return res.json({ success: false, message: 'Payment already processed' });
    }

    appointment.payment = true;
    await appointment.save();

    res.json({ success: true, message: 'Payment processed successfully (mock)' });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export { registerUser, loginUser, getProfile, updateProfile, bookAppointment, getUserAppointments, cancelAppointment, payAppointment };