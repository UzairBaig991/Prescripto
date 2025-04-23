import validator from 'validator';
import bcrypt from 'bcrypt';
import doctorModel from '../models/doctorModel.js';
import jwt from 'jsonwebtoken';
import { sendDoctorWelcomeEmail } from '../utils/emailConfig.js';

// API for adding doctor
const addDoctor = async (req, res) => {
    try {
        const { name, email, password, speciality, degree, experience, about, fees, address } = req.body;
        const imageFile = req.file;

        // Checking for all required data
        if (!name || !email || !password || !speciality || !degree || !experience || !about || !fees || !address || !imageFile) {
            return res.json({ success: false, message: 'Missing Details' });
        }

        // Validating email format
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: 'Please enter a valid email' });
        }

        // Validating strong password
        if (password.length < 8) {
            return res.json({ success: false, message: 'Please enter a strong password' });
        }

        // Check if email already exists
        const existingDoctor = await doctorModel.findOne({ email });
        if (existingDoctor) {
            return res.json({ success: false, message: 'Email already registered' });
        }

        // Use the local file path from Multer
        const imagePath = req.file.path.replace(/\\/g, '/');

        // Hashing doctor password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Saving doctor data
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

        // Send welcome email to the doctor
        const emailSent = await sendDoctorWelcomeEmail(email, name, password);
        if (!emailSent) {
            return res.json({ success: false, message: 'Doctor added, but failed to send welcome email' });
        }

        res.json({ success: true, message: 'Doctor Added and Email Sent' });

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

export { addDoctor, loginAdmin };