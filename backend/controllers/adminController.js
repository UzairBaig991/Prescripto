import validator from 'validator';
import bcrypt from 'bcrypt';
import doctorModel from '../models/doctorModel.js';
import jwt from 'jsonwebtoken';
import { sendDoctorWelcomeEmail } from '../utils/emailConfig.js';
import fs from 'fs';
import path from 'path';

// Valid degrees for validation
const validDegrees = [
  'MBBS',
  'MD',
  'DO',
  'BDS',
  'MS',
  'DNB',
  'FCPS',
  'PhD',
  'DM',
];

// API for adding doctor
const addDoctor = async (req, res) => {
  try {
    const { name, email, password, speciality, degree, experience, about, fees, address } = req.body;
    const imageFile = req.file;

    if (!name || !email || !password || !speciality || !degree || !experience || !about || !fees || !address || !imageFile) {
      return res.json({ success: false, message: 'Missing Details' });
    }

    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: 'Please enter a valid email' });
    }

    if (password.length < 8) {
      return res.json({ success: false, message: 'Please enter a strong password' });
    }

    if (!validDegrees.includes(degree)) {
      return res.json({ success: false, message: 'Invalid degree selected' });
    }

    const existingDoctor = await doctorModel.findOne({ email });
    if (existingDoctor) {
      return res.json({ success: false, message: 'Email already registered' });
    }

    const imagePath = req.file.path.replace(/\\/g, '/');

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const doctorData = {
      name,
      email,
      image: imagePath,
      password: hashedPassword,
      speciality,
      degree,
      experience,
      about,
      fees,
      address: JSON.parse(address),
      date: Date.now(),
    };

    const newDoctor = new doctorModel(doctorData);
    await newDoctor.save();

    const emailSent = await sendDoctorWelcomeEmail(email, name, password);
    if (!emailSent) {
      return res.json({ success: false, message: 'Doctor added, but failed to send welcome email' });
    }

    res.json({ success: true, message: 'Doctor Added' });
  } catch (error) {
    console.error('Error in addDoctor:', error.message);
    res.json({ success: false, message: error.message });
  }
};

// API for admin login
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      const token = jwt.sign(email + password, process.env.JWT_SECRET);
      res.json({ success: true, token });
    } else {
      res.json({ success: false, message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Error in loginAdmin:', error.message);
    res.json({ success: false, message: error.message });
  }
};

// API to fetch all doctors
const getDoctors = async (req, res) => {
  try {
    const doctors = await doctorModel.find({}).select('-password');
    res.json({ success: true, doctors });
  } catch (error) {
    console.error('Error in getDoctors:', error.message);
    res.json({ success: false, message: error.message });
  }
};

// API to delete a doctor
const deleteDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const doctor = await doctorModel.findById(id);
    if (!doctor) {
      return res.json({ success: false, message: 'Doctor not found' });
    }

    const imagePath = path.join(process.cwd(), doctor.image);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    await doctorModel.findByIdAndDelete(id);
    res.json({ success: true, message: 'Doctor deleted successfully' });
  } catch (error) {
    console.error('Error in deleteDoctor:', error.message);
    res.json({ success: false, message: error.message });
  }
};

// API to update a doctor
const updateDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, speciality, degree, experience, about, fees, address } = req.body;
    const imageFile = req.file;

    const doctor = await doctorModel.findById(id);
    if (!doctor) {
      return res.json({ success: false, message: 'Doctor not found' });
    }

    if (!name || !email || !speciality || !degree || !experience || !about || !fees || !address) {
      return res.json({ success: false, message: 'Missing Details' });
    }

    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: 'Please enter a valid email' });
    }

    if (!validDegrees.includes(degree)) {
      return res.json({ success: false, message: 'Invalid degree selected' });
    }

    const existingDoctor = await doctorModel.findOne({ email, _id: { $ne: id } });
    if (existingDoctor) {
      return res.json({ success: false, message: 'Email already registered' });
    }

    doctor.name = name;
    doctor.email = email;
    doctor.speciality = speciality;
    doctor.degree = degree;
    doctor.experience = experience;
    doctor.about = about;
    doctor.fees = Number(fees);
    doctor.address = JSON.parse(address);

    if (imageFile) {
      const oldImagePath = path.join(process.cwd(), doctor.image);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
      doctor.image = req.file.path.replace(/\\/g, '/');
    }

    await doctor.save();
    const updatedDoctor = await doctorModel.findById(id).select('-password');
    res.json({ success: true, message: 'Doctor updated successfully', doctor: updatedDoctor });
  } catch (error) {
    console.error('Error in updateDoctor:', error.message);
    res.json({ success: false, message: error.message });
  }
};

// API to toggle doctor availability
const toggleAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { available } = req.body;

    const doctor = await doctorModel.findById(id);
    if (!doctor) {
      return res.json({ success: false, message: 'Doctor not found' });
    }

    doctor.available = available;
    await doctor.save();

    const updatedDoctor = await doctorModel.findById(id).select('-password');
    res.json({ success: true, message: 'Availability updated successfully', doctor: updatedDoctor });
  } catch (error) {
    console.error('Error in toggleAvailability:', error.message);
    res.json({ success: false, message: error.message });
  }
};

export { addDoctor, loginAdmin, getDoctors, deleteDoctor, updateDoctor, toggleAvailability };