import express from 'express';
import { addDoctor, loginAdmin, getDoctors, deleteDoctor, updateDoctor } from '../controllers/adminController.js';
import upload from '../middlewares/multer.js';
import authAdmin from '../middlewares/authAdmin.js';

const adminRouter = express.Router();

// POST /add-doctor — with Multer and authAdmin
adminRouter.post(
    '/add-doctor',
    upload.single('image'),
    authAdmin,
    async (req, res) => {
        try {
            await addDoctor(req, res);
        } catch (error) {
            console.error('Error in /add-doctor:', error.message);
            res.status(500).json({ success: false, message: error.message });
        }
    }
);

// POST /login — simple login endpoint
adminRouter.post('/login', loginAdmin);

// GET /doctors — fetch all doctors
adminRouter.get('/doctors', authAdmin, getDoctors);

// DELETE /delete-doctor/:id — delete a doctor
adminRouter.delete('/delete-doctor/:id', authAdmin, deleteDoctor);

// PATCH /update-doctor/:id — update a doctor
adminRouter.patch(
    '/update-doctor/:id',
    upload.single('image'),
    authAdmin,
    async (req, res) => {
        try {
            await updateDoctor(req, res);
        } catch (error) {
            console.error('Error in /update-doctor:', error.message);
            res.status(500).json({ success: false, message: error.message });
        }
    }
);

export default adminRouter;