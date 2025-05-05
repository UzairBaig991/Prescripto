// import express from 'express';
// import { registerUser, loginUser, getProfile, updateProfile, bookAppointment, getUserAppointments } from '../controllers/userController.js';
// import authUser from '../middlewares/userAuth.js';
// import upload from '../middlewares/multer.js';

// const userRouter = express.Router();

// userRouter.post('/register', registerUser);
// userRouter.post('/login', loginUser);
// userRouter.get('/get-profile', authUser, getProfile);
// userRouter.post('/update-profile', upload.single('image'), authUser, updateProfile);
// userRouter.post('/book-appointment', authUser, bookAppointment);
// userRouter.get('/my-appointments', authUser, getUserAppointments);

// export default userRouter;

import express from 'express';
import { registerUser, loginUser, getProfile, updateProfile, bookAppointment, getUserAppointments, cancelAppointment, payAppointment } from '../controllers/userController.js';
import authUser from '../middlewares/userAuth.js';
import upload from '../middlewares/multer.js';

const userRouter = express.Router();

userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);
userRouter.get('/get-profile', authUser, getProfile);
userRouter.post('/update-profile', upload.single('image'), authUser, updateProfile);
userRouter.post('/book-appointment', authUser, bookAppointment);
userRouter.get('/my-appointments', authUser, getUserAppointments);
userRouter.post('/cancel-appointment', authUser, cancelAppointment);
userRouter.post('/pay-appointment', authUser, payAppointment);

export default userRouter;