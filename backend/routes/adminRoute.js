import express from 'express';
import { addDoctor, loginAdmin } from '../controllers/adminController.js';
import upload from '../middlewares/multer.js';
import authAdmin from '../middlewares/authAdmin.js';

const adminRouter = express.Router();

// POST /add-doctor — with Multer and authAdmin
adminRouter.post(
    '/add-doctor',
    upload.single('image'),
    authAdmin, // Keep authAdmin middleware
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

export default adminRouter;